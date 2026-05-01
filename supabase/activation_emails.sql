-- Activation email sequence: schema migration.
--
-- Creates the dedup log used by the send-activation-emails Edge
-- Function and enables pg_net (the cron schedule we'll add separately
-- in activation_emails_cron.sql calls net.http_post to invoke the
-- function every hour).
--
-- Apply order:
--   1. Run THIS file in the Supabase SQL editor (or via MCP / CLI).
--   2. Set RESEND_API_KEY and CRON_SECRET as Edge Function secrets.
--   3. Deploy the function from supabase/functions/send-activation-emails.
--   4. Manually test the function (see README in that folder).
--   5. Only then apply activation_emails_cron.sql.

-- pg_cron schedules SQL only — to invoke an HTTPS endpoint we need
-- pg_net, which exposes net.http_post. Both are pre-installed on
-- Supabase but pg_net needs explicit `create extension`.
create extension if not exists pg_net with schema extensions;

-- One row per (user, email_type) we've ever attempted to send. The
-- UNIQUE constraint is the canonical "have we sent this yet?" check —
-- the function relies on it both to skip already-sent users in its
-- candidate query and as a safety net (a unique-violation insert
-- means another concurrent run already sent the same email).
create table if not exists public.activation_emails_sent (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  email_type text not null,
  resend_email_id text,
  sent_at timestamptz not null default now(),
  unique (user_id, email_type)
);

-- The unique constraint already creates an index, but naming it
-- explicitly so the planner picks it up cleanly in the EXISTS
-- subqueries the candidate-search code runs.
create index if not exists activation_emails_sent_user_email_type_idx
  on public.activation_emails_sent (user_id, email_type);

-- Service-role bypasses RLS, but enable it anyway so anon/auth
-- roles can't read the table — it contains internal sending state
-- (Resend message IDs etc.) that doesn't need to be exposed.
alter table public.activation_emails_sent enable row level security;
