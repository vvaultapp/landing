-- Activation emails: pg_cron schedule.
--
-- DO NOT APPLY THIS UNTIL the function has been tested manually with
-- a fake user — once active, this fires every hour and starts hitting
-- real users in the trigger windows.
--
-- Prereqs (must already be true):
--   1. The activation_emails.sql migration has been applied (creates
--      activation_emails_sent and enables pg_net).
--   2. RESEND_API_KEY and CRON_SECRET are set as Edge Function secrets
--      via the Supabase dashboard (Project Settings -> Edge Functions
--      -> Secrets) or via `supabase secrets set`.
--   3. The send-activation-emails function is deployed.
--   4. You've replaced REPLACE_ME_WITH_CRON_SECRET below with the SAME
--      value you set in CRON_SECRET. (For higher security move it to
--      Supabase Vault later — see comment block at the bottom.)
--
-- To apply: paste this into the Supabase SQL editor or run via MCP /
-- CLI. To pause: select cron.unschedule('send-activation-emails-hourly').

select cron.schedule(
  'send-activation-emails-hourly',
  '0 * * * *',  -- every hour, on the hour, UTC
  $$
  select net.http_post(
    url := 'https://lgpvvtnbxqnmpjrnuyqi.supabase.co/functions/v1/send-activation-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', 'REPLACE_ME_WITH_CRON_SECRET'
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
  $$
);

-- ─────────────────────────────────────────────────────────────────────
-- Optional hardening: pull CRON_SECRET from Supabase Vault instead of
-- hard-coding it in the cron command (which lives in pg_catalog.cron.job
-- and is therefore visible to anyone with read access on that table).
--
-- 1. Insert the secret into vault:
--      select vault.create_secret('YOUR_CRON_SECRET_VALUE', 'cron_secret_send_activation_emails');
--
-- 2. Replace the schedule body with:
--      select net.http_post(
--        url := 'https://lgpvvtnbxqnmpjrnuyqi.supabase.co/functions/v1/send-activation-emails',
--        headers := jsonb_build_object(
--          'Content-Type', 'application/json',
--          'x-cron-secret',
--          (select decrypted_secret
--             from vault.decrypted_secrets
--             where name = 'cron_secret_send_activation_emails')
--        ),
--        body := '{}'::jsonb,
--        timeout_milliseconds := 60000
--      );
-- ─────────────────────────────────────────────────────────────────────
