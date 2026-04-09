-- Migration: Add culling analysis columns to media table
-- Purpose: Store browser-side canvas culling results (blur, duplicate, exposure)

ALTER TABLE media
  ADD COLUMN IF NOT EXISTS is_blurry          boolean,
  ADD COLUMN IF NOT EXISTS is_duplicate       boolean,
  ADD COLUMN IF NOT EXISTS is_overexposed     boolean,
  ADD COLUMN IF NOT EXISTS is_underexposed    boolean,
  ADD COLUMN IF NOT EXISTS culling_confidence float;

-- Index for fast culling filter queries
CREATE INDEX IF NOT EXISTS idx_media_culling
  ON media (project_id, is_blurry, is_duplicate, is_overexposed)
  WHERE is_blurry = true OR is_duplicate = true OR is_overexposed = true;

-- RLS: inherit existing media policies (no new policies needed — culling columns
-- are updated by the same user who owns the media via the existing INSERT/UPDATE policies)
