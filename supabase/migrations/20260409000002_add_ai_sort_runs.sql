-- Migration: Add ai_sort_runs tracking table
-- Purpose: Track each AI classification run for analytics and debugging

CREATE TABLE IF NOT EXISTS ai_sort_runs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_photos      integer NOT NULL DEFAULT 0,
  classified_photos integer NOT NULL DEFAULT 0,
  model_id          text NOT NULL DEFAULT 'Xenova/clip-vit-base-patch32',
  preset_id         text,
  duration_ms       integer,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE ai_sort_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ai_sort_runs"
  ON ai_sort_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai_sort_runs"
  ON ai_sort_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for dashboard analytics queries
CREATE INDEX IF NOT EXISTS idx_ai_sort_runs_project
  ON ai_sort_runs (project_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_sort_runs_user
  ON ai_sort_runs (user_id, created_at DESC);
