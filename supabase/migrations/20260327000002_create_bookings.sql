-- ============================================================
-- Create bookings table
-- ============================================================

create type booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled');

create table bookings (
  id             uuid primary key default gen_random_uuid(),
  workspace_id   uuid not null references workspaces(id) on delete cascade,
  client_name    text not null,
  client_email   text,
  shoot_date     date not null,
  shoot_time     text,
  package_type   text,
  amount_cents   integer,
  location       text,
  notes          text,
  status         booking_status not null default 'pending',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Index for fast workspace + date lookups
create index bookings_workspace_id_idx on bookings(workspace_id);
create index bookings_shoot_date_idx on bookings(shoot_date);

-- RLS
alter table bookings enable row level security;

-- Workspace owner can manage their bookings
create policy "bookings_select_own" on bookings
  for select using (
    workspace_id in (
      select id from workspaces where owner_id = auth.uid()
    )
  );

create policy "bookings_insert_own" on bookings
  for insert with check (
    workspace_id in (
      select id from workspaces where owner_id = auth.uid()
    )
  );

create policy "bookings_update_own" on bookings
  for update using (
    workspace_id in (
      select id from workspaces where owner_id = auth.uid()
    )
  );

create policy "bookings_delete_own" on bookings
  for delete using (
    workspace_id in (
      select id from workspaces where owner_id = auth.uid()
    )
  );

-- Auto-update updated_at
create or replace function update_bookings_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger bookings_updated_at
  before update on bookings
  for each row execute function update_bookings_updated_at();
