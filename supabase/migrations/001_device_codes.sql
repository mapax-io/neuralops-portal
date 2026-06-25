-- Device codes table
-- Used for local NeuralOps instance activation

create table if not exists public.device_codes (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  user_id     uuid references auth.users(id) on delete cascade,
  user_email  text,
  is_used     boolean not null default false,
  expires_at  timestamptz not null,
  verified_at timestamptz,
  created_at  timestamptz not null default now()
);

-- Index for fast polling lookups
create index device_codes_code_idx on public.device_codes (code);
create index device_codes_expires_idx on public.device_codes (expires_at);

-- Only edge functions (service role) can read/write this table
alter table public.device_codes enable row level security;

-- No public access — all access goes through edge functions using service role key
create policy "No public access" on public.device_codes
  for all using (false);

-- Auto-clean expired codes older than 1 hour (optional, run as a cron)
-- delete from public.device_codes where expires_at < now() - interval '1 hour';
