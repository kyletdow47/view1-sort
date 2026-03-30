-- Enhance waitlist table with name, photographer_type, utm fields
ALTER TABLE waitlist
  ADD COLUMN IF NOT EXISTS name             text,
  ADD COLUMN IF NOT EXISTS photographer_type text,
  ADD COLUMN IF NOT EXISTS utm_source       text,
  ADD COLUMN IF NOT EXISTS utm_medium       text,
  ADD COLUMN IF NOT EXISTS utm_campaign     text,
  ADD COLUMN IF NOT EXISTS referral_code    text,
  ADD COLUMN IF NOT EXISTS source           text DEFAULT 'landing';

-- Allow anonymous reads so we can show the counter publicly
CREATE POLICY IF NOT EXISTS "waitlist_select_count" ON waitlist
  FOR SELECT USING (true);
