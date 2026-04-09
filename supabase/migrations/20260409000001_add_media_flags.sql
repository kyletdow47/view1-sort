-- Migration: Add star and review flag columns to media table
-- Purpose: Photographer can star photos and flag them keep/reject;
--          these flags feed the style-profile learning system

ALTER TABLE media
  ADD COLUMN IF NOT EXISTS is_starred    boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS review_flag   text CHECK (review_flag IN ('keep', 'reject'));

-- Index for fast starred / flagged queries
CREATE INDEX IF NOT EXISTS idx_media_starred
  ON media (project_id, is_starred)
  WHERE is_starred = true;

CREATE INDEX IF NOT EXISTS idx_media_review_flag
  ON media (project_id, review_flag)
  WHERE review_flag IS NOT NULL;
