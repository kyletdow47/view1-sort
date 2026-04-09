-- AI insights cache table for server-side Claude-generated business insights
-- Caches insights by project + stats hash to avoid redundant API calls

CREATE TABLE IF NOT EXISTS ai_insights_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  stats_hash TEXT NOT NULL,
  insights JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, stats_hash)
);

-- Enable RLS
ALTER TABLE ai_insights_cache ENABLE ROW LEVEL SECURITY;

-- Users can read/write cache entries for their own projects
CREATE POLICY "Users can view own project insights cache"
  ON ai_insights_cache FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN workspaces w ON p.workspace_id = w.id
      WHERE w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own project insights cache"
  ON ai_insights_cache FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN workspaces w ON p.workspace_id = w.id
      WHERE w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own project insights cache"
  ON ai_insights_cache FOR DELETE
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN workspaces w ON p.workspace_id = w.id
      WHERE w.owner_id = auth.uid()
    )
  );

-- Index for fast lookups
CREATE INDEX idx_ai_insights_cache_lookup ON ai_insights_cache(project_id, stats_hash);
CREATE INDEX idx_ai_insights_cache_expiry ON ai_insights_cache(expires_at);

-- Comment
COMMENT ON TABLE ai_insights_cache IS 'Caches AI-generated business insights per project to reduce Claude API calls';
