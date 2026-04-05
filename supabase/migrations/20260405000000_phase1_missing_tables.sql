-- =============================================================================
-- View1 Sort — Phase 1 Missing Tables
-- Migration: 20260405000000_phase1_missing_tables.sql
--
-- Adds 11 tables not covered by the initial schema:
--   gallery_views, clients, contracts, contract_signatures, contract_templates,
--   edit_requests, calendar_events, content_posts, questionnaires,
--   questionnaire_fields, questionnaire_responses
-- =============================================================================

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------

CREATE TYPE client_stage AS ENUM ('inquiry', 'quoted', 'booked', 'shooting', 'delivered', 'paid');
CREATE TYPE client_tier AS ENUM ('standard', 'vip', 'returning');
CREATE TYPE contract_status AS ENUM ('draft', 'sent', 'signed', 'declined', 'expired');
CREATE TYPE edit_request_status AS ENUM ('requested', 'priced', 'in_progress', 'delivered');
CREATE TYPE calendar_event_source AS ENUM ('booking', 'project', 'block');
CREATE TYPE calendar_event_status AS ENUM (
  'inquiry', 'quoted', 'booked', 'contracted', 'prepped',
  'shooting', 'processing', 'review', 'gallery_live', 'delivered', 'paid', 'blocked'
);
CREATE TYPE post_status AS ENUM ('draft', 'scheduled', 'published', 'failed');
CREATE TYPE post_platform AS ENUM ('instagram', 'facebook', 'tiktok', 'pinterest');
CREATE TYPE questionnaire_category AS ENUM ('wedding', 'portrait', 'commercial', 'event', 'custom');

-- ---------------------------------------------------------------------------
-- 1. GALLERY_VIEWS — analytics tracking for gallery page visits
-- ---------------------------------------------------------------------------

CREATE TABLE gallery_views (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  viewer_email text,
  source      text,                    -- 'direct', 'email', 'social', etc.
  ip_hash     text,                    -- hashed for privacy
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE gallery_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gallery_views_select_project_owner"
  ON gallery_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN workspaces w ON w.id = p.workspace_id
      WHERE p.id = project_id AND w.owner_id = auth.uid()
    )
  );

-- Inserts are via service role (public gallery page) — no auth required
CREATE POLICY "gallery_views_insert_anon"
  ON gallery_views FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_gallery_views_project_id ON gallery_views(project_id);
CREATE INDEX idx_gallery_views_created_at ON gallery_views(project_id, created_at);

-- ---------------------------------------------------------------------------
-- 2. CLIENTS — photographer CRM
-- ---------------------------------------------------------------------------

CREATE TABLE clients (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id        uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email               text NOT NULL,
  display_name        text NOT NULL,
  phone               text,
  shoot_type          text,             -- e.g. 'Wedding', 'Portrait'
  shoot_date          date,
  price_cents         integer,
  stage               client_stage NOT NULL DEFAULT 'inquiry',
  tier                client_tier NOT NULL DEFAULT 'standard',
  notes               text,
  project_count       integer NOT NULL DEFAULT 0,
  total_revenue_cents integer NOT NULL DEFAULT 0,
  last_active_at      timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, email)
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_select_workspace_owner"
  ON clients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "clients_insert_workspace_owner"
  ON clients FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "clients_update_workspace_owner"
  ON clients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "clients_delete_workspace_owner"
  ON clients FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid()
    )
  );

CREATE INDEX idx_clients_workspace_id ON clients(workspace_id);
CREATE INDEX idx_clients_stage ON clients(workspace_id, stage);

CREATE TRIGGER clients_set_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. CONTRACT_TEMPLATES — reusable contract templates per photographer
-- ---------------------------------------------------------------------------

CREATE TABLE contract_templates (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name           text NOT NULL,
  category       text NOT NULL DEFAULT 'Other',
  body           text NOT NULL DEFAULT '',
  variable_hints text[] NOT NULL DEFAULT '{}',
  last_used_at   timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contract_templates_select_own"
  ON contract_templates FOR SELECT
  USING (photographer_id = auth.uid());

CREATE POLICY "contract_templates_insert_own"
  ON contract_templates FOR INSERT
  WITH CHECK (photographer_id = auth.uid());

CREATE POLICY "contract_templates_update_own"
  ON contract_templates FOR UPDATE
  USING (photographer_id = auth.uid())
  WITH CHECK (photographer_id = auth.uid());

CREATE POLICY "contract_templates_delete_own"
  ON contract_templates FOR DELETE
  USING (photographer_id = auth.uid());

CREATE INDEX idx_contract_templates_photographer ON contract_templates(photographer_id);

-- ---------------------------------------------------------------------------
-- 4. CONTRACTS — individual contracts sent to clients
-- ---------------------------------------------------------------------------

CREATE TABLE contracts (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id        uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id             uuid REFERENCES projects(id) ON DELETE SET NULL,
  template_id            uuid REFERENCES contract_templates(id) ON DELETE SET NULL,
  client_name            text NOT NULL,
  client_email           text NOT NULL,
  category               text NOT NULL DEFAULT 'Other',
  type                   text NOT NULL DEFAULT 'Photography Services Agreement',
  status                 contract_status NOT NULL DEFAULT 'draft',
  event_date             date,
  value_cents            integer,
  body                   text NOT NULL DEFAULT '',
  -- HelloSign integration
  signature_request_id   text UNIQUE,
  sent_at                timestamptz,
  last_viewed_at         timestamptz,
  completed_at           timestamptz,
  is_complete            boolean NOT NULL DEFAULT false,
  -- Decline support
  declined_at            timestamptz,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contracts_select_own"
  ON contracts FOR SELECT
  USING (photographer_id = auth.uid());

CREATE POLICY "contracts_insert_own"
  ON contracts FOR INSERT
  WITH CHECK (photographer_id = auth.uid());

CREATE POLICY "contracts_update_own"
  ON contracts FOR UPDATE
  USING (photographer_id = auth.uid())
  WITH CHECK (photographer_id = auth.uid());

CREATE POLICY "contracts_delete_own"
  ON contracts FOR DELETE
  USING (photographer_id = auth.uid());

CREATE INDEX idx_contracts_photographer ON contracts(photographer_id);
CREATE INDEX idx_contracts_signature_request ON contracts(signature_request_id);
CREATE INDEX idx_contracts_status ON contracts(photographer_id, status);

CREATE TRIGGER contracts_set_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 5. CONTRACT_SIGNATURES — individual signer records per contract
-- ---------------------------------------------------------------------------

CREATE TABLE contract_signatures (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id             uuid NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  hellosign_signature_id  text UNIQUE,
  signer_email            text NOT NULL,
  signer_name             text,
  status                  text NOT NULL DEFAULT 'pending',  -- 'pending', 'signed', 'declined'
  signed_at               timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contract_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contract_signatures_select_own"
  ON contract_signatures FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM contracts c WHERE c.id = contract_id AND c.photographer_id = auth.uid()
    )
  );

CREATE INDEX idx_contract_signatures_contract ON contract_signatures(contract_id);
CREATE INDEX idx_contract_signatures_hellosign ON contract_signatures(hellosign_signature_id);

-- ---------------------------------------------------------------------------
-- 6. EDIT_REQUESTS — client photo edit requests
-- ---------------------------------------------------------------------------

CREATE TABLE edit_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid REFERENCES projects(id) ON DELETE CASCADE,
  photographer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_name   text NOT NULL,
  client_email  text,
  photo_title   text NOT NULL,
  description   text NOT NULL DEFAULT '',
  status        edit_request_status NOT NULL DEFAULT 'requested',
  price_cents   integer,
  approved_at   timestamptz,
  delivered_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE edit_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "edit_requests_select_own"
  ON edit_requests FOR SELECT
  USING (photographer_id = auth.uid());

CREATE POLICY "edit_requests_insert_own"
  ON edit_requests FOR INSERT
  WITH CHECK (photographer_id = auth.uid());

CREATE POLICY "edit_requests_update_own"
  ON edit_requests FOR UPDATE
  USING (photographer_id = auth.uid())
  WITH CHECK (photographer_id = auth.uid());

CREATE POLICY "edit_requests_delete_own"
  ON edit_requests FOR DELETE
  USING (photographer_id = auth.uid());

CREATE INDEX idx_edit_requests_photographer ON edit_requests(photographer_id);
CREATE INDEX idx_edit_requests_status ON edit_requests(photographer_id, status);

CREATE TRIGGER edit_requests_set_updated_at
  BEFORE UPDATE ON edit_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 7. CALENDAR_EVENTS — standalone calendar blocks & events
--    (bookings and project shoot dates are joined at query time)
-- ---------------------------------------------------------------------------

CREATE TABLE calendar_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title         text NOT NULL,
  subtitle      text,
  date          date NOT NULL,
  time_start    time,
  time_end      time,
  all_day       boolean NOT NULL DEFAULT false,
  source_type   calendar_event_source NOT NULL DEFAULT 'block',
  status        calendar_event_status NOT NULL DEFAULT 'blocked',
  location      text,
  notes         text,
  booking_id    uuid REFERENCES bookings(id) ON DELETE SET NULL,
  project_id    uuid REFERENCES projects(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "calendar_events_select_own"
  ON calendar_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "calendar_events_insert_own"
  ON calendar_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "calendar_events_update_own"
  ON calendar_events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "calendar_events_delete_own"
  ON calendar_events FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid()
    )
  );

CREATE INDEX idx_calendar_events_workspace ON calendar_events(workspace_id);
CREATE INDEX idx_calendar_events_date ON calendar_events(workspace_id, date);

CREATE TRIGGER calendar_events_set_updated_at
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 8. CONTENT_POSTS — social media content hub posts
-- ---------------------------------------------------------------------------

CREATE TABLE content_posts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  photo_ids     uuid[] NOT NULL DEFAULT '{}',
  caption       text NOT NULL DEFAULT '',
  hashtags      text[] NOT NULL DEFAULT '{}',
  platforms     post_platform[] NOT NULL DEFAULT '{}',
  status        post_status NOT NULL DEFAULT 'draft',
  scheduled_at  timestamptz,
  published_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE content_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_posts_select_own"
  ON content_posts FOR SELECT
  USING (photographer_id = auth.uid());

CREATE POLICY "content_posts_insert_own"
  ON content_posts FOR INSERT
  WITH CHECK (photographer_id = auth.uid());

CREATE POLICY "content_posts_update_own"
  ON content_posts FOR UPDATE
  USING (photographer_id = auth.uid())
  WITH CHECK (photographer_id = auth.uid());

CREATE POLICY "content_posts_delete_own"
  ON content_posts FOR DELETE
  USING (photographer_id = auth.uid());

CREATE INDEX idx_content_posts_photographer ON content_posts(photographer_id);
CREATE INDEX idx_content_posts_status ON content_posts(photographer_id, status);
CREATE INDEX idx_content_posts_scheduled ON content_posts(scheduled_at) WHERE status = 'scheduled';

CREATE TRIGGER content_posts_set_updated_at
  BEFORE UPDATE ON content_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 9. QUESTIONNAIRES — questionnaire forms built by photographers
-- ---------------------------------------------------------------------------

CREATE TABLE questionnaires (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            text NOT NULL,
  description     text NOT NULL DEFAULT '',
  category        questionnaire_category NOT NULL DEFAULT 'custom',
  response_count  integer NOT NULL DEFAULT 0,
  sent            boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;

CREATE POLICY "questionnaires_select_own"
  ON questionnaires FOR SELECT
  USING (photographer_id = auth.uid());

CREATE POLICY "questionnaires_insert_own"
  ON questionnaires FOR INSERT
  WITH CHECK (photographer_id = auth.uid());

CREATE POLICY "questionnaires_update_own"
  ON questionnaires FOR UPDATE
  USING (photographer_id = auth.uid())
  WITH CHECK (photographer_id = auth.uid());

CREATE POLICY "questionnaires_delete_own"
  ON questionnaires FOR DELETE
  USING (photographer_id = auth.uid());

CREATE INDEX idx_questionnaires_photographer ON questionnaires(photographer_id);

CREATE TRIGGER questionnaires_set_updated_at
  BEFORE UPDATE ON questionnaires
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 10. QUESTIONNAIRE_FIELDS — individual fields within a questionnaire
-- ---------------------------------------------------------------------------

CREATE TABLE questionnaire_fields (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id    uuid NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
  type                text NOT NULL DEFAULT 'text',
  label               text NOT NULL,
  placeholder         text,
  help_text           text,
  required            boolean NOT NULL DEFAULT false,
  options             jsonb NOT NULL DEFAULT '[]',   -- [{id, label}]
  conditional_rule    jsonb,                          -- {dependsOnFieldId, showWhenValue}
  sort_order          integer NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE questionnaire_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "questionnaire_fields_select_own"
  ON questionnaire_fields FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM questionnaires q WHERE q.id = questionnaire_id AND q.photographer_id = auth.uid()
    )
  );

CREATE POLICY "questionnaire_fields_insert_own"
  ON questionnaire_fields FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM questionnaires q WHERE q.id = questionnaire_id AND q.photographer_id = auth.uid()
    )
  );

CREATE POLICY "questionnaire_fields_update_own"
  ON questionnaire_fields FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM questionnaires q WHERE q.id = questionnaire_id AND q.photographer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM questionnaires q WHERE q.id = questionnaire_id AND q.photographer_id = auth.uid()
    )
  );

CREATE POLICY "questionnaire_fields_delete_own"
  ON questionnaire_fields FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM questionnaires q WHERE q.id = questionnaire_id AND q.photographer_id = auth.uid()
    )
  );

CREATE INDEX idx_questionnaire_fields_questionnaire ON questionnaire_fields(questionnaire_id);

-- ---------------------------------------------------------------------------
-- 11. QUESTIONNAIRE_RESPONSES — client responses to questionnaires
-- ---------------------------------------------------------------------------

CREATE TABLE questionnaire_responses (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id  uuid NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
  client_name       text NOT NULL,
  client_email      text NOT NULL,
  answers           jsonb NOT NULL DEFAULT '{}',   -- {fieldId: value | value[]}
  submitted_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;

-- Photographer reads their own questionnaire responses
CREATE POLICY "questionnaire_responses_select_own"
  ON questionnaire_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM questionnaires q WHERE q.id = questionnaire_id AND q.photographer_id = auth.uid()
    )
  );

-- Public insert — clients submit without auth
CREATE POLICY "questionnaire_responses_insert_anon"
  ON questionnaire_responses FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_questionnaire_responses_questionnaire ON questionnaire_responses(questionnaire_id);

-- ---------------------------------------------------------------------------
-- MEDIA_FAVORITES — client favorites within a gallery
-- ---------------------------------------------------------------------------

CREATE TABLE media_favorites (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  media_id    uuid NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  client_email text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (media_id, client_email)
);

ALTER TABLE media_favorites ENABLE ROW LEVEL SECURITY;

-- Photographer can see all favorites on their gallery
CREATE POLICY "media_favorites_select_project_owner"
  ON media_favorites FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN workspaces w ON w.id = p.workspace_id
      WHERE p.id = project_id AND w.owner_id = auth.uid()
    )
  );

-- Clients favorite without auth
CREATE POLICY "media_favorites_insert_anon"
  ON media_favorites FOR INSERT
  WITH CHECK (true);

CREATE POLICY "media_favorites_delete_anon"
  ON media_favorites FOR DELETE
  USING (true);

CREATE INDEX idx_media_favorites_project ON media_favorites(project_id);
CREATE INDEX idx_media_favorites_client ON media_favorites(project_id, client_email);
