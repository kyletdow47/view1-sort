-- Migration: Brain #2 Phase 1 — signal quality upgrades.
--
-- Builds on 20260415000001_style_embeddings (positive-only CLIP library)
-- with three complementary signals:
--
--   1. style_rejections  — soft "not this category" evidence that accumulates
--                          with repetition. One correction != "never again";
--                          ten corrections = strong down-weight.
--   2. time-decay weight — recent corrections count more than old ones
--                          (90-day half-life). A photographer's style drifts;
--                          the library should drift with it.
--   3. rich neighbor data — find_nearest_style_matches now returns the age
--                          of the neighbor and the rejections recorded on
--                          that neighbor so the client can do weighted,
--                          penalty-aware voting.
--
-- None of this replaces positive embeddings — it *augments* them. The
-- positive library remains the source of truth for "this looks like X";
-- rejections only down-weight, never pick.

/* ------------------------------------------------------------------ */
/*  style_rejections                                                   */
/* ------------------------------------------------------------------ */
-- One row per (user, media, rejected-category). `count` increments every
-- time the user moves this media *away from* that category. We use
-- count-weighted, log-damped penalties on the client so the first rejection
-- is a gentle "maybe not" and the tenth is a firm "no".

CREATE TABLE IF NOT EXISTS style_rejections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_id    uuid NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  category    text NOT NULL,
  count       integer NOT NULL DEFAULT 1 CHECK (count > 0),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, media_id, category)
);

CREATE INDEX IF NOT EXISTS idx_style_rejections_user_media
  ON style_rejections (user_id, media_id);

ALTER TABLE style_rejections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own style rejections"
  ON style_rejections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own style rejections"
  ON style_rejections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own style rejections"
  ON style_rejections FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own style rejections"
  ON style_rejections FOR DELETE
  USING (auth.uid() = user_id);

/* ------------------------------------------------------------------ */
/*  increment_style_rejection                                          */
/* ------------------------------------------------------------------ */
-- Upsert wrapper: idempotent per (user, media, category). Called from
-- /api/style/capture-correction whenever the user moves a photo *out of*
-- a category (previousCategory). Returns the new count so the client can
-- display "learned: N rejections" if we ever want to.

CREATE OR REPLACE FUNCTION increment_style_rejection(
  p_media_id uuid,
  p_category text
) RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_count   integer;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated to record rejections';
  END IF;

  INSERT INTO style_rejections (user_id, media_id, category, count)
  VALUES (v_user_id, p_media_id, p_category, 1)
  ON CONFLICT (user_id, media_id, category)
  DO UPDATE SET
    count      = style_rejections.count + 1,
    updated_at = now()
  RETURNING count INTO v_count;

  RETURN v_count;
END;
$$;

/* ------------------------------------------------------------------ */
/*  bulk_upsert_style_embeddings                                        */
/* ------------------------------------------------------------------ */
-- Batch version of upsert_style_embedding for the confirm-capture flow.
-- On Approve All / Publish we may have hundreds of photos to confirm at
-- once; round-tripping to Postgres per row would be absurd.
--
-- Input is a jsonb array of objects:
--   [{"media_id": "...", "preset_id": "...", "category": "...",
--     "embedding": [512 floats], "source": "confirm", "confidence": 0.91}]
--
-- Returns the number of rows affected.

CREATE OR REPLACE FUNCTION bulk_upsert_style_embeddings(
  p_items jsonb
) RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_count   integer := 0;
  v_item    jsonb;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated to capture style embeddings';
  END IF;

  IF jsonb_typeof(p_items) <> 'array' THEN
    RAISE EXCEPTION 'p_items must be a jsonb array';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO style_embeddings (
      user_id, media_id, preset_id, category, embedding, source, confidence
    )
    VALUES (
      v_user_id,
      (v_item->>'media_id')::uuid,
      v_item->>'preset_id',
      v_item->>'category',
      (v_item->>'embedding')::vector(512),
      COALESCE(v_item->>'source', 'confirm'),
      NULLIF(v_item->>'confidence', '')::real
    )
    ON CONFLICT (user_id, media_id) WHERE media_id IS NOT NULL
    DO UPDATE SET
      -- Confirms never overwrite corrections. Corrections are stronger signal.
      category    = CASE
                      WHEN style_embeddings.source = 'correction'
                        AND EXCLUDED.source = 'confirm'
                      THEN style_embeddings.category
                      ELSE EXCLUDED.category
                    END,
      embedding   = EXCLUDED.embedding,
      source      = CASE
                      WHEN style_embeddings.source = 'correction'
                        AND EXCLUDED.source = 'confirm'
                      THEN style_embeddings.source
                      ELSE EXCLUDED.source
                    END,
      confidence  = COALESCE(EXCLUDED.confidence, style_embeddings.confidence),
      preset_id   = EXCLUDED.preset_id,
      updated_at  = now();

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

/* ------------------------------------------------------------------ */
/*  find_nearest_style_matches (v2)                                    */
/* ------------------------------------------------------------------ */
-- Replaces the v1 signature with a richer return shape. Adds:
--   * age_days      — how old the neighbor is, for client-side decay info
--   * weight        — similarity × exp(-ln2 · age_days / 90).
--                     This is what the client sums over when voting.
--   * rejections    — jsonb {"CatA": 2, ...} of rejections recorded on
--                     this neighbor's media_id (scoped to the caller).
--                     Lets the client apply category-specific penalties
--                     without a second round-trip.
--
-- Note on halflife: 90 days is a starting point. Short enough that a
-- photographer evolving their style this season isn't dragged backward
-- by last winter's corrections; long enough that a single week of sorting
-- doesn't dominate the library.
--
-- We DROP-then-CREATE because the return type changed. Safe since the
-- function is only called from server code we control.

DROP FUNCTION IF EXISTS find_nearest_style_matches(text, vector, integer);

CREATE OR REPLACE FUNCTION find_nearest_style_matches(
  p_preset_id       text,
  p_query_embedding vector(512),
  p_k               integer DEFAULT 5
) RETURNS TABLE (
  category   text,
  similarity real,
  weight     real,
  age_days   real,
  media_id   uuid,
  source     text,
  rejections jsonb
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id  uuid := auth.uid();
  v_halflife real := 90.0;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated';
  END IF;

  RETURN QUERY
  WITH nearest AS (
    SELECT
      se.category,
      (1 - (se.embedding <=> p_query_embedding))::real AS sim,
      EXTRACT(EPOCH FROM (now() - se.updated_at))::real / 86400.0 AS age_d,
      se.media_id,
      se.source
    FROM style_embeddings se
    WHERE se.user_id = v_user_id
      AND se.preset_id = p_preset_id
    ORDER BY se.embedding <=> p_query_embedding
    LIMIT p_k
  ),
  rej_agg AS (
    -- Per-neighbor jsonb of rejection counts, scoped to the caller.
    -- COALESCE handles neighbors with zero rejections.
    SELECT
      n.media_id,
      COALESCE(
        jsonb_object_agg(sr.category, sr.count) FILTER (WHERE sr.category IS NOT NULL),
        '{}'::jsonb
      ) AS rejections
    FROM nearest n
    LEFT JOIN style_rejections sr
      ON sr.media_id = n.media_id
     AND sr.user_id  = v_user_id
    GROUP BY n.media_id
  )
  SELECT
    n.category,
    n.sim AS similarity,
    (n.sim * exp(-ln(2) * n.age_d / v_halflife))::real AS weight,
    n.age_d AS age_days,
    n.media_id,
    n.source,
    COALESCE(r.rejections, '{}'::jsonb) AS rejections
  FROM nearest n
  LEFT JOIN rej_agg r ON r.media_id = n.media_id
  ORDER BY n.sim DESC;
END;
$$;
