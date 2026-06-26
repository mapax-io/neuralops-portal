-- Rename code column to device_id and make it a UUID
-- Drop old code column and add device_id as UUID primary lookup key

ALTER TABLE device_codes
  DROP COLUMN IF EXISTS code;

ALTER TABLE device_codes
  ADD COLUMN IF NOT EXISTS device_id UUID;

-- Make it unique so upsert on conflict works
CREATE UNIQUE INDEX IF NOT EXISTS device_codes_device_id_idx
  ON device_codes (device_id);

-- Remove the old expiry logic — device_id registrations don't expire
ALTER TABLE device_codes
  DROP COLUMN IF EXISTS expires_at;
