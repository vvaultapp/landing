/**
 * send-activation-emails
 *
 * Hourly cron job (driven by pg_cron + pg_net — see
 * supabase/activation_emails_cron.sql) that walks through five
 * activation-email triggers and sends any pending emails via Resend.
 *
 * Triggers:
 *   1. 1h after signup, no first_upload_at      -> "Still empty"
 *   2. 24h after signup, no first_upload_at     -> "What your dashboard looks like..."
 *   3. 72h after signup, no first_upload_at     -> "Your catalog can wait"
 *   4. 7d after signup, no first_upload_at      -> "We miss you at vvault"
 *   5. 24h after first_upload_at, no payment    -> "Save 88.88% on your first month"
 *
 * Each schedule defines a 6-hour grace window past the ideal trigger
 * time so a delayed cron run still catches every user. Double-sends
 * are prevented by the UNIQUE (user_id, email_type) constraint on
 * activation_emails_sent — the candidate query excludes anyone
 * already in that table for the same email_type.
 *
 * Deployed with verify_jwt: false because pg_cron / pg_net can't
 * mint a JWT — auth is enforced via the X-Cron-Secret header check
 * below. Set CRON_SECRET as an Edge Function secret before scheduling.
 *
 * Dev/test: see supabase/functions/send-activation-emails/README.md
 * for one-off manual invocation, dry-run mode, and per-user override.
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { Resend } from "npm:resend@4";
import { TEMPLATES, type TemplateKey } from "./templates.ts";

const FROM_ADDRESS = "Edward from vvault <edward@vvault.app>";
const UNSUBSCRIBE_BASE = "https://vvault.app/unsubscribe";

type Schedule = {
  emailType: TemplateKey;
  /* Column on analytics_users that anchors the timer. */
  triggerColumn: "created_at" | "first_upload_at";
  /* Earliest age at which a user qualifies (e.g. 1 = 1 hour past
     trigger). Below this we hold off; above this we send. */
  minAgoHours: number;
  /* Latest age we'll still send. The window (max - min) is the
     "grace period" past the ideal time, so a missed cron run still
     catches the user on the next pass. UNIQUE constraint stops
     double-sends inside the window. */
  maxAgoHours: number;
  /* If true, only send when first_upload_at IS NULL. */
  requireNoUpload: boolean;
  /* If true, only send when paid_active_at IS NULL. */
  requireNoPaid: boolean;
};

const SCHEDULES: Schedule[] = [
  { emailType: "activation_1", triggerColumn: "created_at",      minAgoHours: 1,   maxAgoHours: 7,   requireNoUpload: true,  requireNoPaid: false },
  { emailType: "activation_2", triggerColumn: "created_at",      minAgoHours: 24,  maxAgoHours: 30,  requireNoUpload: true,  requireNoPaid: false },
  { emailType: "activation_3", triggerColumn: "created_at",      minAgoHours: 72,  maxAgoHours: 78,  requireNoUpload: true,  requireNoPaid: false },
  { emailType: "activation_4", triggerColumn: "created_at",      minAgoHours: 168, maxAgoHours: 174, requireNoUpload: true,  requireNoPaid: false },
  { emailType: "activation_5", triggerColumn: "first_upload_at", minAgoHours: 24,  maxAgoHours: 30,  requireNoUpload: false, requireNoPaid: true  },
];

type Candidate = {
  user_id: string;
  email: string;
  full_name: string | null;
};

type SupabaseClient = ReturnType<typeof createClient>;

Deno.serve(async (req: Request) => {
  /* Auth gate. verify_jwt: false means anyone with the URL can hit
     the function, so we require a shared secret in the header. The
     CRON_SECRET env var is set as a function secret in the Supabase
     dashboard; pg_cron's net.http_post call sends the same value. */
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (!cronSecret) {
    return jsonResponse(500, { error: "CRON_SECRET not configured" });
  }
  if (req.headers.get("x-cron-secret") !== cronSecret) {
    return jsonResponse(401, { error: "unauthorized" });
  }

  /* Parse query params for testing helpers:
       ?dry=1               -> log who WOULD be sent, don't hit Resend
                              and don't insert into activation_emails_sent
       ?user_id=<uuid>      -> restrict the candidate query to a single
                              user (still honors window + send-once
                              constraints, used for QA on a fake user)
       ?email_type=<key>    -> only run one schedule, e.g. "activation_5"
                              (skips all the others that pass) */
  const url = new URL(req.url);
  const dryRun = url.searchParams.get("dry") === "1";
  const overrideUser = url.searchParams.get("user_id");
  const onlyEmailType = url.searchParams.get("email_type") as TemplateKey | null;

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(500, { error: "Supabase env not available" });
  }
  if (!resendKey) {
    return jsonResponse(500, { error: "RESEND_API_KEY not configured" });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  const resend = new Resend(resendKey);

  /* Reuse the existing global drip-emails kill switch. If someone has
     already turned drip emails off via drip_email_config, respect it
     here too — one toggle pauses the whole system. Missing row /
     missing column just means "not yet configured", which we treat
     as enabled. */
  try {
    const { data: cfg } = await supabase
      .from("drip_email_config")
      .select("enabled")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (cfg && cfg.enabled === false) {
      return jsonResponse(200, { ok: true, skipped: "drip emails globally disabled" });
    }
  } catch (err) {
    console.warn("[activation] drip_email_config read failed (treating as enabled):", err);
  }

  const summary: Record<string, { candidates: number; sent: number; failed: number; skipped: number }> = {};

  for (const schedule of SCHEDULES) {
    if (onlyEmailType && schedule.emailType !== onlyEmailType) continue;

    summary[schedule.emailType] = { candidates: 0, sent: 0, failed: 0, skipped: 0 };

    let candidates: Candidate[];
    try {
      candidates = await findCandidates(supabase, schedule, overrideUser);
    } catch (err) {
      console.error(`[activation] candidate query failed for ${schedule.emailType}:`, err);
      continue;
    }
    summary[schedule.emailType].candidates = candidates.length;

    for (const cand of candidates) {
      const tpl = TEMPLATES[schedule.emailType];
      const firstName = derivFirstName(cand.full_name);
      const html = tpl.html
        .replaceAll("{{firstName}}", firstName)
        .replaceAll("{{unsubscribeUrl}}", `${UNSUBSCRIBE_BASE}?u=${cand.user_id}`);

      if (dryRun) {
        summary[schedule.emailType].skipped++;
        console.log(`[activation:dry] would send ${schedule.emailType} to ${cand.email} (firstName=${firstName})`);
        continue;
      }

      try {
        const result = await resend.emails.send({
          from: FROM_ADDRESS,
          to: [cand.email],
          subject: tpl.subject,
          html,
          headers: {
            /* RFC 2369 / 8058 — gives Gmail/Outlook the option to
               render a one-click unsubscribe button at the top of
               the message. Mailto fallback for older clients. */
            "List-Unsubscribe": `<${UNSUBSCRIBE_BASE}?u=${cand.user_id}>, <mailto:edward@vvault.app?subject=unsubscribe>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        });

        if (result.error) {
          throw new Error(typeof result.error === "string" ? result.error : JSON.stringify(result.error));
        }

        const { error: logError } = await supabase
          .from("activation_emails_sent")
          .insert({
            user_id: cand.user_id,
            email_type: schedule.emailType,
            resend_email_id: result.data?.id ?? null,
          });

        if (logError) {
          /* Most likely cause: another concurrent run already inserted
             a row (unique-violation on user_id+email_type). Email is
             already out, just log and move on. */
          console.warn(
            `[activation] insert into activation_emails_sent failed for ${cand.user_id}/${schedule.emailType}:`,
            logError,
          );
        }

        summary[schedule.emailType].sent++;
      } catch (err) {
        summary[schedule.emailType].failed++;
        console.error(
          `[activation] send failed for ${cand.user_id}/${schedule.emailType}:`,
          err instanceof Error ? err.message : err,
        );
      }
    }
  }

  return jsonResponse(200, { ok: true, dryRun, summary });
});

async function findCandidates(
  supabase: SupabaseClient,
  schedule: Schedule,
  overrideUser: string | null,
): Promise<Candidate[]> {
  const now = Date.now();
  const minIso = new Date(now - schedule.maxAgoHours * 3600 * 1000).toISOString();
  const maxIso = new Date(now - schedule.minAgoHours * 3600 * 1000).toISOString();

  /* Step 1: pull analytics_users matching the time window + the
     null-condition flags. We page in chunks of 500 to keep the
     query bounded; in practice each hourly run only sees a small
     slice of users (≤6h of signups). */
  let query = supabase
    .from("analytics_users")
    .select("user_id")
    .gte(schedule.triggerColumn, minIso)
    .lte(schedule.triggerColumn, maxIso)
    .limit(500);

  if (schedule.requireNoUpload) {
    query = query.is("first_upload_at", null);
  }
  if (schedule.requireNoPaid) {
    query = query.is("paid_active_at", null);
  }
  if (overrideUser) {
    query = query.eq("user_id", overrideUser);
  }

  const { data: users, error: usersErr } = await query;
  if (usersErr) throw usersErr;
  if (!users || users.length === 0) return [];

  const userIds = users.map((u) => (u as { user_id: string }).user_id);

  /* Step 2: subtract anyone we've already sent this email_type to.
     Uses the unique index on activation_emails_sent. */
  const { data: alreadySent, error: sentErr } = await supabase
    .from("activation_emails_sent")
    .select("user_id")
    .eq("email_type", schedule.emailType)
    .in("user_id", userIds);
  if (sentErr) throw sentErr;

  const sentSet = new Set((alreadySent ?? []).map((r) => (r as { user_id: string }).user_id));
  const eligible = userIds.filter((id) => !sentSet.has(id));
  if (eligible.length === 0) return [];

  /* Step 3: hydrate email + name from profiles. The join lives here
     rather than as a single SQL because supabase-js doesn't expose
     PostgREST embedded resources between tables that aren't FK-
     related (analytics_users.user_id has no formal FK to profiles.id). */
  const { data: profiles, error: profErr } = await supabase
    .from("profiles")
    .select("id, email, name")
    .in("id", eligible);
  if (profErr) throw profErr;

  const out: Candidate[] = [];
  for (const p of (profiles ?? []) as Array<{ id: string; email: string | null; name: string | null }>) {
    const email = (p.email ?? "").trim();
    if (!email || !email.includes("@")) continue;
    out.push({ user_id: p.id, email, full_name: p.name });
  }
  return out;
}

function derivFirstName(fullName: string | null): string {
  const trimmed = (fullName ?? "").trim();
  if (!trimmed) return "there";
  /* Take the first whitespace-separated word, fall back to "there"
     if the name is just whitespace or empty after trimming. The
     templates all open with "Hey {{firstName}}," — "Hey there,"
     reads more naturally than "Hey ," when no name is on file. */
  const first = trimmed.split(/\s+/)[0] ?? "";
  return first || "there";
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
