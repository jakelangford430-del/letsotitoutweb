import type { Config } from '@netlify/functions'
import { getStore } from '@netlify/blobs'
import { getDatabase } from '@netlify/database'
import { getUser, verifyRequestOrigin } from '@netlify/identity'

const json = (data: unknown, status = 200) =>
  Response.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })

const MAX_BYTES = 5 * 1024 * 1024 // 5MB — keep well under function payload limits

const ALLOWED_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
  'image/png',
  'image/jpeg',
  'image/webp',
])

const cleanFilename = (value: unknown) =>
  String(value ?? 'file')
    .replace(/[/\\]/g, '_')
    .replace(/[^a-zA-Z0-9 ._-]/g, '')
    .trim()
    .slice(0, 140) || 'file'

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
  if (!user) return json({ error: 'Log in to upload or view files.' }, 401)

  const { pool } = getDatabase()
  const store = getStore({ name: 'member-uploads', consistency: 'strong' })

  if (request.method === 'GET') {
    const rows = await pool.query(
      `SELECT id, filename, content_type, size_bytes, note, created_at
       FROM member_files
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [user.id],
    )
    return json({ files: rows.rows })
  }

  if (request.method === 'POST') {
    const blocked = guardOrigin(request)
    if (blocked) return blocked
    const raw = await request.text()
    if (raw.length > Math.ceil((MAX_BYTES * 4) / 3) + 5000) {
      return json({ error: 'That file is too large. Please keep uploads under 5MB.' }, 413)
    }

    let body: Record<string, unknown>
    try {
      body = JSON.parse(raw)
    } catch {
      return json({ error: 'The request could not be read.' }, 400)
    }

    const filename = cleanFilename(body.filename)
    const contentType = String(body.contentType || 'application/octet-stream')
    const note = String(body.note || '').slice(0, 300)
    const base64 = String(body.data || '')

    if (!ALLOWED_TYPES.has(contentType)) {
      return json({ error: 'That file type is not supported. Stick to PDF, Word, Excel, CSV, text or image files.' }, 415)
    }
    if (!base64) return json({ error: 'No file data received.' }, 400)

    let bytes: Uint8Array<ArrayBuffer>
    try {
      bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
    } catch {
      return json({ error: 'The file could not be read.' }, 400)
    }
    if (bytes.byteLength > MAX_BYTES) {
      return json({ error: 'That file is too large. Please keep uploads under 5MB.' }, 413)
    }

    const blobKey = `${user.id}/${Date.now()}-${filename}`
    await store.set(blobKey, new Blob([bytes], { type: contentType }), {
      metadata: { contentType, userId: user.id, filename },
    })

    const saved = await pool.query(
      `INSERT INTO member_files (user_id, filename, content_type, size_bytes, blob_key, note)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, filename, content_type, size_bytes, note, created_at`,
      [user.id, filename, contentType, bytes.byteLength, blobKey, note],
    )

    return json({ file: saved.rows[0] }, 201)
  }

  if (request.method === 'DELETE') {
    const blocked = guardOrigin(request)
    if (blocked) return blocked
    const fileId = new URL(request.url).searchParams.get('fileId')
    if (!fileId || !/^[0-9a-f-]{36}$/i.test(fileId)) return json({ error: 'A valid file is required.' }, 400)

    const existing = await pool.query(
      `SELECT blob_key FROM member_files WHERE id = $1 AND user_id = $2`,
      [fileId, user.id],
    )
    if (!existing.rows[0]) return json({ error: 'File not found.' }, 404)

    await store.delete(existing.rows[0].blob_key)
    await pool.query('DELETE FROM member_files WHERE id = $1 AND user_id = $2', [fileId, user.id])
    return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } })
  }

  return json({ error: 'Method not allowed.' }, 405)
}

export default async (request: Request) => {
  try {
    return await handleRequest(request)
  } catch (error) {
    console.error('member-files request failed', error)
    return json({ error: 'Your files could not be reached just now. Please try again shortly.' }, 500)
  }
}

export const config: Config = {
  path: '/api/member-files',
}
