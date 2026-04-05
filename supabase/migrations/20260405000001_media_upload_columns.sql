-- =============================================================================
-- Add upload-tracking columns to media table
-- Migration: 20260405000001_media_upload_columns.sql
--
-- The uploadStore inserts file_hash (for dedup) and status (for pipeline state).
-- The initial schema was missing these; add them now.
-- Also adds display_name which was added in a separate migration but
-- may not exist in all environments.
-- =============================================================================

ALTER TABLE media
  ADD COLUMN IF NOT EXISTS file_hash text,
  ADD COLUMN IF NOT EXISTS status    text NOT NULL DEFAULT 'uploaded';

-- Index for dedup lookups by hash + project
CREATE INDEX IF NOT EXISTS idx_media_file_hash ON media(project_id, file_hash);

-- Index for status-based queries (e.g. "find all pending AI classification")
CREATE INDEX IF NOT EXISTS idx_media_status ON media(project_id, status);
