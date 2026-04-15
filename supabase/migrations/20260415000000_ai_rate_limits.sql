-- Migration: Durable rate limiting for AI edge functions.
--
-- The existing edge functions (generate-captions, parse-vibe, generate-insights,
-- vision-classify) tracked request counts in an in-memory Map. Supabase Edge
-- Runtime spins up a fresh Deno isolate every few invocations, so the Map
-- resets constantly and the limiter provides almost no real protection for
-- the paid Anthropic key.
--
-- This migration moves the limiter to Postgres. A single atomic RPC,
-- `check_and_increment_rate_limit`, handles the read + upsert in one
-- statement so two concurrent requests can't both slip through on the
-- last slot of a window.

CREATE TABLE IF NOT EXISTS ai_rate_limits (
  user_id       text    NOT NULL,
  function_name text    NOT NULL,
  window_start  timestamptz NOT NULL,
  request_count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, function_name)
);

-- Look-up index for window-based pruning
CREATE INDEX IF NOT EXISTS idx_ai_rate_limits_window_start
  ON ai_rate_limits (window_start);

-- RLS: service_role only — edge functions invoke with the service_role key.
-- No end-user should ever read or write this table directly.
ALTER TABLE ai_rate_limits ENABLE ROW LEVEL SECURITY;

-- (no policies = only service_role bypasses RLS)

-- Atomic check-and-increment. Returns TRUE when the request is allowed,
-- FALSE when the caller has exceeded max_requests for this window.
--
-- Usage from an edge function:
--   const { data: allowed } = await supabase.rpc('check_and_increment_rate_limit', {
--     p_user_id: userId,
--     p_function_name: 'generate-captions',
--     p_window_seconds: 60,
--     p_max_requests: 10,
--   })
CREATE OR REPLACE FUNCTION check_and_increment_rate_limit(
  p_user_id       text,
  p_function_name text,
  p_window_seconds integer,
  p_max_requests  integer
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now            timestamptz := now();
  v_window_cutoff  timestamptz := v_now - make_interval(secs => p_window_seconds);
  v_current_count  integer;
BEGIN
  -- Upsert the counter atomically. If an existing row's window_start is
  -- older than the cutoff, reset window_start and count.
  INSERT INTO ai_rate_limits (user_id, function_name, window_start, request_count)
  VALUES (p_user_id, p_function_name, v_now, 1)
  ON CONFLICT (user_id, function_name) DO UPDATE SET
    window_start  = CASE
                      WHEN ai_rate_limits.window_start < v_window_cutoff THEN v_now
                      ELSE ai_rate_limits.window_start
                    END,
    request_count = CASE
                      WHEN ai_rate_limits.window_start < v_window_cutoff THEN 1
                      ELSE ai_rate_limits.request_count + 1
                    END
  RETURNING request_count INTO v_current_count;

  -- Return TRUE if still under the limit (the increment already happened).
  RETURN v_current_count <= p_max_requests;
END;
$$;

-- Convenience cleanup — can be called by a pg_cron job if we ever wire one.
-- Not required; the check-and-increment handles stale rows inline.
CREATE OR REPLACE FUNCTION prune_ai_rate_limits(p_older_than_hours integer DEFAULT 24)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted integer;
BEGIN
  WITH del AS (
    DELETE FROM ai_rate_limits
    WHERE window_start < now() - make_interval(hours => p_older_than_hours)
    RETURNING 1
  )
  SELECT count(*) INTO v_deleted FROM del;
  RETURN v_deleted;
END;
$$;
