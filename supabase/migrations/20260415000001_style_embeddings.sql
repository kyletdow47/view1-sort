-- Migration: style_embeddings — per-photographer CLIP embedding library.
--
-- Every time a user drags a photo from one AI-predicted category to a
-- different one (or confirms an AI suggestion), we capture the photo's
-- 512-dim CLIP embedding alongside the user's chosen category. Future
-- sorts then look up nearest neighbors in this library to personalise
-- predictions to the photographer's style.
--
-- Key design choices:
--   * vector(512) — base CLIP (clip-vit-base-patch32) output dimension.
--   * HNSW index on cosine distance — very fast sublinear similarity search.
--   * One-embedding-per-(user, media) — re-corrections overwrite the old
--     category rather than creating duplicates.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS style_embeddings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_id    uuid REFERENCES media(id) ON DELETE SET NULL,
  preset_id   text NOT NULL,
  category    text NOT NULL,
  embedding   vector(512) NOT NULL,
  source      text NOT NULL DEFAULT 'correction',  -- 'correction' | 'confirm' | 'import'
  confidence  real,                                 -- optional — the confidence of the original prediction at capture time
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- One active embedding per (user, media). A new correction overwrites it.
CREATE UNIQUE INDEX IF NOT EXISTS idx_style_embeddings_user_media
  ON style_embeddings (user_id, media_id)
  WHERE media_id IS NOT NULL;

-- Bounded scan by user + preset before the vector index runs, so the
-- nearest-neighbor query only considers *this* photographer's *this-preset*
-- library — not a global pool of everyone's embeddings.
CREATE INDEX IF NOT EXISTS idx_style_embeddings_user_preset
  ON style_embeddings (user_id, preset_id);

-- HNSW index for cosine similarity. `vector_cosine_ops` matches the distance
-- operator `<=>` we use in find_nearest_style_matches below.
CREATE INDEX IF NOT EXISTS idx_style_embeddings_embedding
  ON style_embeddings USING hnsw (embedding vector_cosine_ops);

-- RLS: users manage only their own embeddings.
ALTER TABLE style_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own style embeddings"
  ON style_embeddings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own style embeddings"
  ON style_embeddings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own style embeddings"
  ON style_embeddings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own style embeddings"
  ON style_embeddings FOR DELETE
  USING (auth.uid() = user_id);

/* ------------------------------------------------------------------ */
/*  find_nearest_style_matches                                         */
/* ------------------------------------------------------------------ */
-- Returns the K nearest neighbors in the caller's personal embedding
-- library for the given preset, ordered by cosine similarity.
--
-- Returned columns:
--   category    — the category the user assigned to that neighbor
--   similarity  — cosine similarity in [0, 1] (higher = more similar)
--   media_id    — reference to the original media row (may be NULL if media was deleted)
--
-- Usage from the app:
--   supabase.rpc('find_nearest_style_matches', {
--     p_preset_id: 'wedding',
--     p_query_embedding: [0.12, -0.34, ...],  // 512 floats
--     p_k: 5,
--   })

CREATE OR REPLACE FUNCTION find_nearest_style_matches(
  p_preset_id       text,
  p_query_embedding vector(512),
  p_k               integer DEFAULT 5
) RETURNS TABLE (
  category   text,
  similarity real,
  media_id   uuid
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    se.category,
    (1 - (se.embedding <=> p_query_embedding))::real AS similarity,
    se.media_id
  FROM style_embeddings se
  WHERE se.user_id = auth.uid()
    AND se.preset_id = p_preset_id
  ORDER BY se.embedding <=> p_query_embedding
  LIMIT p_k;
END;
$$;

/* ------------------------------------------------------------------ */
/*  upsert_style_embedding                                             */
/* ------------------------------------------------------------------ */
-- Creates or updates a (user, media) embedding. Used by the correction
-- capture flow after a user drags a photo to a different category.
-- Safer than a naked INSERT .. ON CONFLICT since it enforces that the
-- caller is the owning user.

CREATE OR REPLACE FUNCTION upsert_style_embedding(
  p_media_id   uuid,
  p_preset_id  text,
  p_category   text,
  p_embedding  vector(512),
  p_source     text DEFAULT 'correction',
  p_confidence real DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_id      uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated to capture style embeddings';
  END IF;

  INSERT INTO style_embeddings (user_id, media_id, preset_id, category, embedding, source, confidence)
  VALUES (v_user_id, p_media_id, p_preset_id, p_category, p_embedding, p_source, p_confidence)
  ON CONFLICT (user_id, media_id) WHERE media_id IS NOT NULL
  DO UPDATE SET
    category    = EXCLUDED.category,
    embedding   = EXCLUDED.embedding,
    source      = EXCLUDED.source,
    confidence  = EXCLUDED.confidence,
    preset_id   = EXCLUDED.preset_id,
    updated_at  = now()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;
