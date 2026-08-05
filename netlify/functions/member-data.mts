import type { Config } from '@netlify/functions'
import { getDatabase } from '@netlify/database'
import { getUser, verifyRequestOrigin } from '@netlify/identity'

const json = (data: unknown, status = 200) =>
  Response.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })

const cleanText = (value: unknown, maximum = 160) =>
  String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maximum)

const cleanSlug = (value: unknown) => cleanText(value, 100).toLowerCase().replace(/[^a-z0-9/_-]/g, '')

// verifyRequestOrigin throws, which would surface as an opaque 500 and make a blocked
// cross-origin write look like an outage. Turn it into a real 403 instead.
const guardOrigin = (request: Request) => {
  try {
    verifyRequestOrigin(request)
    return null
  } catch {
    return json({ error: 'That request did not look like it came from this site, so it was refused.' }, 403)
  }
}

const handleRequest = async (request: Request) => {
  const user = await getUser()
  if (!user) return json({ error: 'Log in to access your saved work.' }, 401)

  const { pool } = getDatabase()

  if (request.method === 'GET') {
    const [resultsQuery, viewsQuery] = await Promise.all([
      pool.query(
        `SELECT id, tool_slug, result_key, title, status, summary, payload, created_at, updated_at
         FROM member_tool_results
         WHERE user_id = $1
         ORDER BY updated_at DESC
         LIMIT 100`,
        [user.id],
      ),
      pool.query(
        `SELECT content_slug, viewed_at
         FROM member_content_views
         WHERE user_id = $1
         ORDER BY viewed_at DESC
         LIMIT 250`,
        [user.id],
      ),
    ])

    return json({ results: resultsQuery.rows, contentViews: viewsQuery.rows })
  }

  if (request.method === 'POST') {
    const blocked = guardOrigin(request)
    if (blocked) return blocked
    const raw = await request.text()
    if (raw.length > 120_000) return json({ error: 'That saved result is too large.' }, 413)

    let body: Record<string, unknown>
    try {
      body = JSON.parse(raw)
    } catch {
      return json({ error: 'The request could not be read.' }, 400)
    }

    if (body.type === 'content_view') {
      const contentSlug = cleanSlug(body.contentSlug)
      if (!contentSlug) return json({ error: 'A content reference is required.' }, 400)

      await pool.query(
        `INSERT INTO member_content_views (user_id, content_slug, viewed_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (user_id, content_slug)
         DO UPDATE SET viewed_at = EXCLUDED.viewed_at`,
        [user.id, contentSlug],
      )
      return json({ saved: true })
    }

    if (body.type !== 'result') return json({ error: 'Unknown save type.' }, 400)

    const toolSlug = cleanSlug(body.toolSlug)
    const resultKey = cleanSlug(body.resultKey || 'latest')
    const title = cleanText(body.title, 140)
    // A missing status or summary means "leave whatever is already saved alone", so a
    // background sync from another page cannot flatten a finished result.
    const status = body.status === 'completed' || body.status === 'in_progress' ? body.status : null
    const summary = typeof body.summary === 'string' ? cleanText(body.summary, 500) : null
    const payload = body.payload && typeof body.payload === 'object' ? body.payload : {}

    if (!toolSlug || !resultKey || !title) return json({ error: 'Tool, title and result details are required.' }, 400)

    const saved = await pool.query(
      `INSERT INTO member_tool_results
        (user_id, tool_slug, result_key, title, status, summary, payload)
       VALUES ($1, $2, $3, $4, COALESCE($5, 'in_progress'), COALESCE($6, ''), $7::jsonb)
       ON CONFLICT (user_id, tool_slug, result_key)
       DO UPDATE SET
         title = EXCLUDED.title,
         status = COALESCE($5, member_tool_results.status),
         summary = COALESCE($6, member_tool_results.summary),
         payload = EXCLUDED.payload,
         updated_at = NOW()
       RETURNING id, tool_slug, result_key, title, status, summary, created_at, updated_at`,
      [user.id, toolSlug, resultKey, title, status, summary, JSON.stringify(payload)],
    )

    return json({ result: saved.rows[0] }, 201)
  }

  if (request.method === 'DELETE') {
    const blocked = guardOrigin(request)
    if (blocked) return blocked
    const resultId = new URL(request.url).searchParams.get('resultId')
    if (!resultId || !/^[0-9a-f-]{36}$/i.test(resultId)) return json({ error: 'A valid saved result is required.' }, 400)

    await pool.query('DELETE FROM member_tool_results WHERE id = $1 AND user_id = $2', [resultId, user.id])
    return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } })
  }

  return json({ error: 'Method not allowed.' }, 405)
}

export default async (request: Request) => {
  try {
    return await handleRequest(request)
  } catch (error) {
    console.error('member-data request failed', error)
    return json({ error: 'Your saved work could not be reached just now. Please try again shortly.' }, 500)
  }
}

export const config: Config = {
  path: '/api/member-data',
}
