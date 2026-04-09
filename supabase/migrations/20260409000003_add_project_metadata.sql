-- Migration: Add metadata JSONB column to projects table
-- Purpose: Store per-project preferences (AI preferences, vibe keywords, etc.)
--          Key: metadata.ai_preferences → AIPreferences JSON object

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS metadata jsonb;

-- Index for fast JSONB key lookups
CREATE INDEX IF NOT EXISTS idx_projects_metadata
  ON projects USING gin(metadata)
  WHERE metadata IS NOT NULL;
