-- Add session_expires_at to device_codes
-- Set when device is activated, checked on every poll

ALTER TABLE device_codes
  ADD COLUMN IF NOT EXISTS session_expires_at TIMESTAMPTZ;
