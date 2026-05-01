# send-activation-emails

Hourly cron job that sends 5 onboarding emails based on signup time
and upload/payment state. See `index.ts` for full trigger logic.

## Required secrets

Both must be set on the Supabase project before the function can run.
Set them via the dashboard (Project Settings → Edge Functions →
Secrets) or via the CLI (`supabase secrets set` from a linked repo):

| Name              | Purpose                                    |
| ----------------- | ------------------------------------------ |
| `RESEND_API_KEY`  | Resend API key for outbound mail           |
| `CRON_SECRET`     | Shared secret between the cron job and the function (auth header) |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are auto-injected by
the Edge Functions runtime — do not set them yourself.

## Manual testing flow

The function is publicly callable (no JWT) but rejects requests
without the `x-cron-secret` header, so you can hit it from your
laptop without minting a service-role token.

### 1. Dry-run with no candidates change

Sanity check that the function compiles, talks to Supabase, and
returns the expected summary shape. With no users in any window,
all `candidates` should be 0:

```sh
curl -X POST 'https://lgpvvtnbxqnmpjrnuyqi.supabase.co/functions/v1/send-activation-emails?dry=1' \
  -H "x-cron-secret: $CRON_SECRET"
```

### 2. Test against a single fake user

Insert a user that satisfies email 1's window (signed up 2 hours
ago, no upload), then dry-run scoped to just that user:

```sql
-- Pick any pre-existing test profile, OR create one. Make sure the
-- email field is YOUR inbox so you actually receive the test email.
update public.profiles
   set name = 'Edward Test', email = 'your-test-inbox@example.com'
 where id = '<test-user-uuid>';

update public.analytics_users
   set created_at = now() - interval '2 hours',
       first_upload_at = null,
       paid_active_at = null
 where user_id = '<test-user-uuid>';
```

Then dry-run the function for that user only:

```sh
curl -X POST 'https://lgpvvtnbxqnmpjrnuyqi.supabase.co/functions/v1/send-activation-emails?dry=1&user_id=<test-user-uuid>&email_type=activation_1' \
  -H "x-cron-secret: $CRON_SECRET"
```

You should see `"sent": 0, "skipped": 1, "candidates": 1` in the
response and a `[activation:dry] would send activation_1 to ...`
line in the function logs (Supabase dashboard → Edge Functions →
send-activation-emails → Logs).

### 3. Send a real email to yourself

Drop the `dry=1` flag — Resend gets called for real:

```sh
curl -X POST 'https://lgpvvtnbxqnmpjrnuyqi.supabase.co/functions/v1/send-activation-emails?user_id=<test-user-uuid>&email_type=activation_1' \
  -H "x-cron-secret: $CRON_SECRET"
```

Verify:

- An email lands in your inbox
- `select * from activation_emails_sent where user_id = '<test-user-uuid>'`
  returns one row with `email_type = 'activation_1'` and a
  `resend_email_id`
- Re-running the same curl shows `"sent": 0, "candidates": 0`
  (already-sent users are filtered out)

### 4. Test each email type

Repeat step 3 for `activation_2` through `activation_5`, adjusting
the user's `created_at` (or `first_upload_at` for email 5) to fall
in each window. After each test:

```sql
-- Reset so you can re-test.
delete from activation_emails_sent where user_id = '<test-user-uuid>';
```

| Email type     | Trigger column on analytics_users | Window from now() | Other condition           |
| -------------- | --------------------------------- | ----------------- | ------------------------- |
| `activation_1` | `created_at`                      | 1–7 hours ago     | `first_upload_at IS NULL` |
| `activation_2` | `created_at`                      | 24–30 hours ago   | `first_upload_at IS NULL` |
| `activation_3` | `created_at`                      | 72–78 hours ago   | `first_upload_at IS NULL` |
| `activation_4` | `created_at`                      | 168–174 hours ago | `first_upload_at IS NULL` |
| `activation_5` | `first_upload_at`                 | 24–30 hours ago   | `paid_active_at IS NULL`  |

### 5. Activate cron

Once all five email types verify correctly, apply
`supabase/activation_emails_cron.sql` (after replacing the
`REPLACE_ME_WITH_CRON_SECRET` placeholder).

## Pausing the system

Two off-switches, in order of preference:

1. **Per-system kill switch** (preferred — also pauses other drip
   emails on this database):
   ```sql
   update drip_email_config set enabled = false;
   ```
   Function returns immediately on next run with
   `{ skipped: "drip emails globally disabled" }`.

2. **Unschedule cron** (stops invoking the function entirely):
   ```sql
   select cron.unschedule('send-activation-emails-hourly');
   ```
