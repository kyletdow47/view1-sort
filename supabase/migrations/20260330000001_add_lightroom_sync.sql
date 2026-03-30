-- =============================================================================
-- View1 Studio — Lightroom Roundtrip Sync
-- Migration: 20260330000001_add_lightroom_sync.sql
-- =============================================================================

-- Add Lightroom sync columns to media table
ALTER TABLE media
  ADD COLUMN IF NOT EXISTS edited_storage_path  text,
  ADD COLUMN IF NOT EXISTS edited_thumbnail_url text,
  ADD COLUMN IF NOT EXISTS edited_at            timestamptz,
  ADD COLUMN IF NOT EXISTS file_checksum        text;

-- file_checksum stores a lightweight fingerprint ("{size}_{lastModified}") of
-- the original file set on first Lightroom scan. Subsequent scans compare
-- against this to detect edits. NULL means the file has never been scanned.

-- edited_storage_path: Supabase Storage path for the Lightroom-edited version.
-- edited_thumbnail_url: Public URL for the edited thumbnail.
-- edited_at: Timestamp when the edit was last applied via sync.
