import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-static";
/* 60s edge cache. Lower than the previous 300s so the homepage KPIs
   (emails sent, tracks, beats sold) feel close to real-time without
   hammering Supabase on every visit. The client side fetches with
   `cache: "no-store"` and re-polls so a long-open tab still updates. */
export const revalidate = 60;

type LandingManualStatsRow = {
  money_paid_total_cents?: number | string | null;
  app_store_review_label?: string | null;
  trustpilot_score_label?: string | null;
};

type TrustpilotReviewRow = {
  name?: string | null;
  body_en?: string | null;
  body_fr?: string | null;
  rating?: number | null;
};

type TrustpilotReview = {
  name: string;
  bodyEn: string;
  bodyFr: string;
  rating: number;
};

const DEFAULT_MANUAL_STATS = {
  money_paid_total_cents: 0,
  app_store_review_label: "4.9/5",
  trustpilot_score_label: "4.7/5",
};

const AVATAR_PAGE_SIZE = 1000;

function toPositiveInteger(value: unknown, fallback = 0): number {
  const next = Number(value);
  if (!Number.isFinite(next) || next < 0) return fallback;
  return Math.floor(next);
}

function isMissingTableError(error: { code?: string } | null | undefined, status?: number): boolean {
  return error?.code === "PGRST205" || error?.code === "42P01" || status === 404;
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

  const [profilesRes, tracksRes, emailsRes, manualRes, reviewsRes] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("links").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("email_sends").select("id", { count: "exact", head: true }),
    supabase
      .from("landing_manual_stats")
      .select("money_paid_total_cents, app_store_review_label, trustpilot_score_label")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("landing_trustpilot_reviews")
      .select("name, body_en, body_fr, rating")
      .eq("hidden", false)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
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

  /* The two new tables/columns (trustpilot_score_label,
     landing_trustpilot_reviews) ship with a SQL migration that the
     team applies separately. Until that runs, the queries above
     return PGRST205 / 42P01. We swallow those specifically and fall
     back to defaults so the rest of the response still succeeds. */
  const manualStatsMissingColumn =
    manualRes.error && !isMissingTableError(manualRes.error, manualRes.status);
  if (manualStatsMissingColumn) {
    /* Retry without the new column so existing deployments keep
       working before the migration is applied. */
    const legacy = await supabase
      .from("landing_manual_stats")
      .select("money_paid_total_cents, app_store_review_label")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!legacy.error) {
      manualRes.data = legacy.data as typeof manualRes.data;
      manualRes.error = null;
    } else if (!isMissingTableError(legacy.error, legacy.status)) {
      console.error("[landing-stats] manual stats query failed:", legacy.error.message);
    }
  }

  if (
    reviewsRes.error &&
    !isMissingTableError(reviewsRes.error, reviewsRes.status)
  ) {
    console.error("[landing-stats] trustpilot reviews query failed:", reviewsRes.error.message);
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
  const trustpilotScoreLabel =
    typeof manualStats?.trustpilot_score_label === "string" && manualStats.trustpilot_score_label.trim()
      ? manualStats.trustpilot_score_label.trim()
      : DEFAULT_MANUAL_STATS.trustpilot_score_label;

  const trustpilotReviews: TrustpilotReview[] = ((reviewsRes.data ?? []) as TrustpilotReviewRow[])
    .map((row) => {
      const name = typeof row?.name === "string" ? row.name.trim() : "";
      const bodyEn = typeof row?.body_en === "string" ? row.body_en.trim() : "";
      const bodyFr = typeof row?.body_fr === "string" ? row.body_fr.trim() : "";
      const ratingRaw = Number(row?.rating);
      const rating = Number.isFinite(ratingRaw)
        ? Math.min(5, Math.max(1, Math.round(ratingRaw)))
        : 5;
      if (!name || !bodyEn) return null;
      return { name, bodyEn, bodyFr: bodyFr || bodyEn, rating };
    })
    .filter((row): row is TrustpilotReview => row !== null);

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
      trustpilotScoreLabel,
      trustpilotReviews,
      avatarUrls,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
      },
    },
  );
}
