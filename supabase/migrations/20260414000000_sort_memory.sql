-- =============================================================================
-- AI Sort Memory System
-- Migration: 20260414000000_sort_memory.sql
--
-- Two tables:
-- 1. sort_profiles: Per-photographer AI sorting preferences (learned over time)
-- 2. sort_sessions: Per-sort history (what the AI did, what the user changed)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. SORT PROFILES (per-photographer AI preferences)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS sort_profiles (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_weights      jsonb NOT NULL DEFAULT '{}',
  label_weights         jsonb NOT NULL DEFAULT '{}',
  preferred_categories  jsonb NOT NULL DEFAULT '[]',
  feedback_count        integer NOT NULL DEFAULT 0,
  last_sort_at          timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE sort_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sort_profiles_select_own"
  ON sort_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "sort_profiles_insert_own"
  ON sort_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sort_profiles_update_own"
  ON sort_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sort_profiles_delete_own"
  ON sort_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE TRIGGER sort_profiles_set_updated_at
  BEFORE UPDATE ON sort_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ---------------------------------------------------------------------------
-- 2. SORT SESSIONS (per-sort history)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS sort_sessions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id           uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  brief_text        text,
  batch_summary     jsonb,
  sort_plan         jsonb,
  categories_used   jsonb,
  photo_count       integer NOT NULL DEFAULT 0,
  corrections       jsonb NOT NULL DEFAULT '[]',
  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE sort_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sort_sessions_select_own"
  ON sort_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "sort_sessions_insert_own"
  ON sort_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sort_sessions_update_own"
  ON sort_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for fetching a user's sort history
CREATE INDEX IF NOT EXISTS idx_sort_sessions_user ON sort_sessions(user_id, created_at DESC);

-- Index for fetching sort history for a project
CREATE INDEX IF NOT EXISTS idx_sort_sessions_project ON sort_sessions(project_id, created_at DESC);
