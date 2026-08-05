CREATE TABLE IF NOT EXISTS member_tool_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  tool_slug TEXT NOT NULL,
  result_key TEXT NOT NULL DEFAULT 'latest',
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  summary TEXT NOT NULL DEFAULT '',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, tool_slug, result_key)
);

CREATE INDEX IF NOT EXISTS member_tool_results_user_updated_idx
  ON member_tool_results (user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS member_content_views (
  user_id TEXT NOT NULL,
  content_slug TEXT NOT NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, content_slug)
);

CREATE INDEX IF NOT EXISTS member_content_views_user_viewed_idx
  ON member_content_views (user_id, viewed_at DESC);
