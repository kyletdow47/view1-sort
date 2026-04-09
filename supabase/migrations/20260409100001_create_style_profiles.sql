-- Create style_profiles table for AI style learning / personalization
-- Agent 3 — Vibe Presets & Style Profile

CREATE TABLE style_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preset_id TEXT,
  feedback_count INTEGER NOT NULL DEFAULT 0,
  personalized_mode_unlocked BOOLEAN NOT NULL DEFAULT false,
  category_weights JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, preset_id)
);

-- Index for fast user profile lookups
CREATE INDEX idx_style_profiles_user ON style_profiles (user_id);

-- RLS: users can only access their own profiles
ALTER TABLE style_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own style profiles"
  ON style_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own style profiles"
  ON style_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own style profiles"
  ON style_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own style profiles"
  ON style_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at on change
CREATE TRIGGER set_style_profiles_updated_at
  BEFORE UPDATE ON style_profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
