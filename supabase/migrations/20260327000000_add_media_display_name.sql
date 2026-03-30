-- Add display_name column to media for batch rename feature
ALTER TABLE media ADD COLUMN IF NOT EXISTS display_name text;
