import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = 300;

type LandingManualStatsRow = {
  money_paid_total_cents?: number | string | null;
  app_store_review_label?: string | null;
};

const DEFAULT_MANUAL_STATS: { money_paid_total_cents: number; app_store_review_label: string } = {
  money_paid_total_cents: 0,
  app_store_review_label: "4.9/5",
};

const AVATAR_PAGE_SIZE = 1000;

function toPositiveInteger(value: unknown, fallback = 0): number {
  const next = Number(value);
  if (!Number.isFinite(next) || next < 0) return fallback;
  return Math.floor(next);
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Supabase service environment variables are missing." }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const [profilesRes, tracksRes, emailsRes, manualRes] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("links").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("email_sends").select("id", { count: "exact", head: true }),
    supabase
      .from("landing_manual_stats")
      .select("money_paid_total_cents, app_store_review_label")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (profilesRes.error) {
    console.error("[landing-stats] profiles count failed:", profilesRes.error.message);
  }
  if (tracksRes.error) {
    console.error("[landing-stats] tracks count failed:", tracksRes.error.message);
  }
  if (emailsRes.error) {
    console.error("[landing-stats] email sends count failed:", emailsRes.error.message);
  }
  const avatarRows: Array<{ picture?: string | null }> = [];
  let from = 0;

  for (;;) {
    const to = from + AVATAR_PAGE_SIZE - 1;
    const avatarsRes = await supabase
      .from("profiles")
      .select("picture")
      .not("picture", "is", null)
      .neq("picture", "")
      .range(from, to);

    if (avatarsRes.error) {
      console.error("[landing-stats] avatars query failed:", avatarsRes.error.message);
      break;
    }

    const rows = (avatarsRes.data ?? []) as Array<{ picture?: string | null }>;
    avatarRows.push(...rows);
    if (rows.length < AVATAR_PAGE_SIZE) break;
    from += AVATAR_PAGE_SIZE;
  }

  const manualStatsMissingTable = manualRes.error?.code === "PGRST205" || manualRes.status === 404;
  if (manualRes.error && !manualStatsMissingTable) {
    console.error("[landing-stats] manual stats query failed:", manualRes.error.message);
  }

  const manualStats = (manualRes.data ?? null) as LandingManualStatsRow | null;
  const moneyPaidTotalCents = toPositiveInteger(
    manualStats?.money_paid_total_cents,
    DEFAULT_MANUAL_STATS.money_paid_total_cents,
  );
  const appStoreReviewLabel =
    typeof manualStats?.app_store_review_label === "string" && manualStats.app_store_review_label.trim()
      ? manualStats.app_store_review_label.trim()
      : DEFAULT_MANUAL_STATS.app_store_review_label;

  const avatarUrls = Array.from(
    new Set(
      avatarRows
        .map((row) => (typeof row?.picture === "string" ? row.picture.trim() : ""))
        .filter((value) => value.length > 0),
    ),
  ).slice(0, 30);

  return NextResponse.json(
    {
      emailsSentTotal: toPositiveInteger(emailsRes.count, 0),
      usersTotal: toPositiveInteger(profilesRes.count, 0),
      tracksTotal: toPositiveInteger(tracksRes.count, 0),
      moneyPaidTotalCents,
      appStoreReviewLabel,
      avatarUrls,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    },
  );
}
