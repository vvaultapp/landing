/* Shared catalog + data helpers used by both the main /admin/buttons
   dashboard and the per-page detail route (/admin/buttons/[slug]).
   Keeping this in one place means the page grid, the slug → page
   mapping, and the click-aggregation logic stay in lockstep. */

import "server-only";
import { createClient } from "@supabase/supabase-js";

export type Range = "1d" | "7d" | "14d" | "30d" | "60d" | "90d";
export const RANGES: Range[] = ["1d", "7d", "14d", "30d", "60d", "90d"];
export const DEFAULT_RANGE: Range = "1d";

export function rangeToDays(r: Range): number {
  return Number(r.replace("d", ""));
}

export function isValidRange(r: string | undefined): r is Range {
  return !!r && (RANGES as string[]).includes(r);
}

export type ClickRow = {
  button_id: string;
  surface: string | null;
  plan_id: string | null;
  created_at: string;
  session_id: string | null;
};

export type ButtonDef = {
  buttonId: string;
  name: string;
  page: string;
  /** Hint shown under the name, e.g. "Top nav" / "Hero" / "Final CTA". */
  spot?: string;
};

/* Every button we instrument across the landing pages. The dashboard's
   per-page sections + "Top 5" panel both derive from this list.
   - Buttons already tracked via the older trackButtonClick / `track={}`
     paths keep their original IDs (nav.*, hero.*, toast.*, pricing_page.*)
     so historical rows aren't orphaned.
   - New entries use the `<page>.<section>.<role>` convention, all wired
     via the global ClickTracker + `data-track-id` attribute. */
export const BUTTONS: ButtonDef[] = [
  // --- Home page ---
  { buttonId: "nav.get_started", name: "Get Started", page: "Home", spot: "Top nav" },
  { buttonId: "nav.log_in", name: "Log in", page: "Home", spot: "Top nav" },
  { buttonId: "hero.continue_google", name: "Continue with Google", page: "Home", spot: "Hero" },
  { buttonId: "hero.start_for_free", name: "Start for free", page: "Home", spot: "Hero" },
  { buttonId: "home.hero.see_pricing", name: "See pricing", page: "Home", spot: "Hero pill" },
  { buttonId: "home.trustpilot_card", name: "Trustpilot card", page: "Home", spot: "Social proof → /reviews" },
  { buttonId: "home.see_pricing_under_metrics", name: "See pricing", page: "Home", spot: "Under live-metrics strip" },
  { buttonId: "home.contact.discord", name: "Discord", page: "Home", spot: "Contact section" },
  { buttonId: "home.contact.instagram", name: "Instagram", page: "Home", spot: "Contact section" },
  { buttonId: "home.contact.email", name: "Email", page: "Home", spot: "Contact section" },
  { buttonId: "home.certificate_teaser.view", name: "Certificate teaser", page: "Home", spot: "Certificate section" },
  { buttonId: "home.final_cta.signup", name: "Final CTA — primary", page: "Home", spot: "Bottom" },
  { buttonId: "home.final_cta.secondary", name: "Final CTA — secondary", page: "Home", spot: "Bottom" },
  { buttonId: "toast.join_pro", name: "Join Pro now", page: "Home", spot: "Pro promo toast" },

  // --- Pricing page ---
  { buttonId: "pricing_page.card_free", name: "Free card CTA", page: "Pricing page", spot: "Plan card" },
  { buttonId: "pricing_page.card_pro", name: "Pro card CTA", page: "Pricing page", spot: "Plan card" },
  { buttonId: "pricing_page.card_ultra", name: "Ultra card CTA", page: "Pricing page", spot: "Plan card" },
  { buttonId: "pricing_page.compare_free", name: "Compare — Free CTA", page: "Pricing page", spot: "Compare-plans sticky" },
  { buttonId: "pricing_page.compare_pro", name: "Compare — Pro CTA", page: "Pricing page", spot: "Compare-plans sticky" },
  { buttonId: "pricing_page.compare_ultra", name: "Compare — Ultra CTA", page: "Pricing page", spot: "Compare-plans sticky" },
  { buttonId: "pricing.mngmt.contact_sales", name: "MNGMT — Contact sales", page: "Pricing page", spot: "MNGMT card" },
  { buttonId: "pricing.toggle_billing", name: "Annual / Monthly toggle", page: "Pricing page", spot: "Billing toggle" },
  { buttonId: "pricing.final_cta.start_free", name: "Start for free", page: "Pricing page", spot: "Final CTA" },

  // --- Download page ---
  { buttonId: "download.app_store", name: "Download on App Store", page: "Download" },

  // --- Contact page ---
  { buttonId: "contact.card.discord", name: "Discord card", page: "Contact page" },
  { buttonId: "contact.card.instagram", name: "Instagram card", page: "Contact page" },
  { buttonId: "contact.card.email", name: "Email card", page: "Contact page" },
  { buttonId: "contact.help_center", name: "Help center", page: "Contact page", spot: "Help links" },
  { buttonId: "contact.docs", name: "Documentation", page: "Contact page", spot: "Help links" },
  { buttonId: "contact.pricing_link", name: "Pricing", page: "Contact page", spot: "Help links" },

  // --- Certificate page ---
  { buttonId: "certificate.hero_cta", name: "Hero CTA", page: "Certificate page" },
  { buttonId: "certificate.final_cta", name: "Final CTA", page: "Certificate page" },

  // --- Testimonials page ---
  { buttonId: "testimonials.cta_signup", name: "Signup CTA", page: "Testimonials page" },
  { buttonId: "testimonials.cta_discord", name: "Discord CTA", page: "Testimonials page" },

  // --- Reviews page ---
  { buttonId: "reviews.trustpilot", name: "View on Trustpilot", page: "Reviews page" },
  { buttonId: "reviews.app_store", name: "View on the App Store", page: "Reviews page" },

  // --- Features pages (1 entry per page, hero + final CTA) ---
  { buttonId: "features_studio.hero_cta", name: "Hero CTA", page: "Features — Studio" },
  { buttonId: "features_studio.final_cta", name: "Final CTA", page: "Features — Studio" },
  { buttonId: "features_library.hero_cta", name: "Hero CTA", page: "Features — Library" },
  { buttonId: "features_library.final_cta", name: "Final CTA", page: "Features — Library" },
  { buttonId: "features_analytics.hero_cta", name: "Hero CTA", page: "Features — Analytics" },
  { buttonId: "features_analytics.final_cta", name: "Final CTA", page: "Features — Analytics" },
  { buttonId: "features_campaigns.hero_cta", name: "Hero CTA", page: "Features — Campaigns" },
  { buttonId: "features_campaigns.final_cta", name: "Final CTA", page: "Features — Campaigns" },
  { buttonId: "features_contacts.hero_cta", name: "Hero CTA", page: "Features — Contacts" },
  { buttonId: "features_contacts.final_cta", name: "Final CTA", page: "Features — Contacts" },
  { buttonId: "features_opportunities.hero_cta", name: "Hero CTA", page: "Features — Opportunities" },
  { buttonId: "features_opportunities.final_cta", name: "Final CTA", page: "Features — Opportunities" },
  { buttonId: "features_sales.hero_cta", name: "Hero CTA", page: "Features — Sales" },
  { buttonId: "features_sales.final_cta", name: "Final CTA", page: "Features — Sales" },
  { buttonId: "features_profile.hero_cta", name: "Hero CTA", page: "Features — Profile" },
  { buttonId: "features_profile.final_cta", name: "Final CTA", page: "Features — Profile" },
  { buttonId: "features_link-in-bio.hero_cta", name: "Hero CTA", page: "Features — Link in Bio" },
  { buttonId: "features_link-in-bio.final_cta", name: "Final CTA", page: "Features — Link in Bio" },

  // --- Cross-site footer ---
  { buttonId: "footer.social.discord", name: "Discord", page: "Footer (every page)" },
  { buttonId: "footer.social.instagram", name: "Instagram", page: "Footer (every page)" },
];

/* The order pages appear on the dashboard. */
export const PAGE_ORDER: string[] = [
  "Home",
  "Pricing page",
  "Reviews page",
  "Download",
  "Contact page",
  "Certificate page",
  "Testimonials page",
  "Features — Studio",
  "Features — Library",
  "Features — Analytics",
  "Features — Campaigns",
  "Features — Contacts",
  "Features — Opportunities",
  "Features — Sales",
  "Features — Profile",
  "Features — Link in Bio",
  "Footer (every page)",
];

/* URL-safe slug for a page name. Used by /admin/buttons/[slug]. */
export function pageToSlug(page: string): string {
  return page
    .toLowerCase()
    .replace(/\s+—\s+/g, "-") // "Features — Studio" → "features-studio"
    .replace(/\(.*\)/g, "") // strip parentheticals ("Footer (every page)" → "Footer ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

/* Reverse map. Returns the canonical page name for a slug, or null
   if no page matches. */
export function slugToPage(slug: string): string | null {
  const lc = slug.toLowerCase();
  for (const page of PAGE_ORDER) {
    if (pageToSlug(page) === lc) return page;
  }
  return null;
}

export type Aggregated = ButtonDef & {
  clicks: number;
  uniqueVisitors: number;
  lastClicked: string | null;
};

export async function fetchClicks(days: number): Promise<ClickRow[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) return [];
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
  const since = new Date(Date.now() - days * 86400_000).toISOString();
  const trackedIds = BUTTONS.map((b) => b.buttonId);
  const { data, error } = await supabase
    .from("button_clicks")
    .select("button_id, surface, plan_id, created_at, session_id")
    .in("button_id", trackedIds)
    .gte("created_at", since)
    .order("created_at", { ascending: true })
    .limit(50_000);
  if (error || !data) return [];
  return data as ClickRow[];
}

export function aggregate(rows: ClickRow[]): Aggregated[] {
  const byId = new Map<
    string,
    { clicks: number; sessions: Set<string>; lastClicked: string | null }
  >();
  for (const def of BUTTONS) {
    byId.set(def.buttonId, { clicks: 0, sessions: new Set(), lastClicked: null });
  }
  for (const r of rows) {
    const bucket = byId.get(r.button_id);
    if (!bucket) continue;
    bucket.clicks += 1;
    if (r.session_id) bucket.sessions.add(r.session_id);
    if (!bucket.lastClicked || r.created_at > bucket.lastClicked) {
      bucket.lastClicked = r.created_at;
    }
  }
  return BUTTONS.map((def) => {
    const b = byId.get(def.buttonId)!;
    return {
      ...def,
      clicks: b.clicks,
      uniqueVisitors: b.sessions.size,
      lastClicked: b.lastClicked,
    };
  });
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function formatRelative(iso: string | null): string {
  if (!iso) return "never";
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = now - then;
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
}
