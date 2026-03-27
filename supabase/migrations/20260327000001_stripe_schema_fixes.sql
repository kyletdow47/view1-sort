-- =============================================================================
-- Stripe Schema Fixes — sync profiles columns with webhook expectations,
-- add stripe_events idempotency table, add gallery_payments table
-- Migration: 20260327000001_stripe_schema_fixes.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Add missing columns to profiles
--    webhook/checkout handlers need subscription_status, stripe_subscription_id,
--    and stripe_connect_enabled for quick lookups without joining subscriptions
-- ---------------------------------------------------------------------------

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS subscription_status subscription_status,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS stripe_connect_enabled boolean NOT NULL DEFAULT false;

-- ---------------------------------------------------------------------------
-- 2. stripe_events — idempotency log for Stripe webhook processing
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS stripe_events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id  text NOT NULL UNIQUE,
  event_type       text NOT NULL,
  processed        boolean NOT NULL DEFAULT false,
  processed_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;
-- stripe_events is service-role only; no user-facing policies needed

CREATE INDEX IF NOT EXISTS stripe_events_stripe_event_id_idx
  ON stripe_events (stripe_event_id);

-- ---------------------------------------------------------------------------
-- 3. gallery_payments — record of one-time gallery purchase payments
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS gallery_payments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id          uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  stripe_session_id   text NOT NULL UNIQUE,
  amount              bigint,
  currency            text NOT NULL DEFAULT 'usd',
  status              text NOT NULL DEFAULT 'paid',
  client_email        text,
  paid_at             timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE gallery_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gallery_payments_select_project_owner"
  ON gallery_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN workspaces w ON w.id = p.workspace_id
      WHERE p.id = project_id AND w.owner_id = auth.uid()
    )
  );

-- Inserts are via service role (Stripe webhook handler only)

CREATE INDEX IF NOT EXISTS gallery_payments_project_id_idx
  ON gallery_payments (project_id);
