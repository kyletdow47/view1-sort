-- Create vibe_presets table for cloud-persisted AI style presets
-- Agent 3 — Vibe Presets & Style Profile

CREATE TABLE vibe_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  style_params JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  source TEXT NOT NULL DEFAULT 'custom' CHECK (source IN ('builtin', 'custom', 'ai_parsed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast user preset lookups
CREATE INDEX idx_vibe_presets_user_active ON vibe_presets (user_id, is_active);

-- RLS: users can only CRUD their own presets
ALTER TABLE vibe_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own presets"
  ON vibe_presets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own presets"
  ON vibe_presets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presets"
  ON vibe_presets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own presets"
  ON vibe_presets FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at on change
CREATE TRIGGER set_vibe_presets_updated_at
  BEFORE UPDATE ON vibe_presets
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
