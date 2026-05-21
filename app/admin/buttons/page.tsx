/* Real button-click analytics — top level. Renders:
     1. Three KPI cards (total clicks, top button, % firing).
     2. A "Top 5" panel — the most-clicked buttons across every page.
     3. A grid of page cards, each linking to /admin/buttons/<slug> for
        the detailed breakdown of that page's buttons.
   Gated by a shared password (see ./auth.ts). */

import Link from "next/link";
import {
  BarChart3,
  Briefcase,
  Building2,
  ChevronRight,
  CircleUser,
  Clapperboard,
  Download,
  FileCheck2,
  FolderClosed,
  Home as HomeIcon,
  Layout,
  Link2,
  MailOpen,
  Megaphone,
  MessageSquareQuote,
  Star,
  Tag,
  Target,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";

import { RangePicker } from "./RangePicker";
import { Row } from "./Row";
import { isAuthed } from "./auth";
import { LoginForm } from "./LoginForm";
import {
  BUTTONS,
  DEFAULT_RANGE,
  PAGE_ORDER,
  RANGES,
  aggregate,
  fetchClicks,
  formatNumber,
  isValidRange,
  pageToSlug,
  rangeToDays,
  type Aggregated,
  type Range,
} from "./lib/buttons-catalog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type IconCmp = ComponentType<{ className?: string; strokeWidth?: number }>;

/* Icon + short blurb per page, used by the grid of cards. Kept in
   sync with PAGE_ORDER. */
const PAGE_META: Record<string, { icon: IconCmp; blurb: string }> = {
  Home: { icon: HomeIcon, blurb: "Hero, social proof, contact, final CTA" },
  "Pricing page": { icon: Tag, blurb: "Plan cards, compare table, billing toggle" },
  "Reviews page": { icon: Star, blurb: "Trustpilot + App Store outbound" },
  Download: { icon: Download, blurb: "App Store install" },
  "Contact page": { icon: MailOpen, blurb: "Discord / Instagram / email + help links" },
  "Certificate page": { icon: FileCheck2, blurb: "Hero + final CTA" },
  "Testimonials page": { icon: MessageSquareQuote, blurb: "Signup + Discord CTAs" },
  "Features — Studio": { icon: Clapperboard, blurb: "Studio feature page CTAs" },
  "Features — Library": { icon: FolderClosed, blurb: "Library feature page CTAs" },
  "Features — Analytics": { icon: BarChart3, blurb: "Analytics feature page CTAs" },
  "Features — Campaigns": { icon: Megaphone, blurb: "Campaigns feature page CTAs" },
  "Features — Contacts": { icon: Users, blurb: "Contacts feature page CTAs" },
  "Features — Opportunities": { icon: Target, blurb: "Opportunities feature page CTAs" },
  "Features — Sales": { icon: Briefcase, blurb: "Sales feature page CTAs" },
  "Features — Profile": { icon: CircleUser, blurb: "Profile feature page CTAs" },
  "Features — Link in Bio": { icon: Link2, blurb: "Link-in-Bio feature page CTAs" },
  "Footer (every page)": { icon: Layout, blurb: "Discord + Instagram (every page)" },
};

const FALLBACK_META: { icon: IconCmp; blurb: string } = {
  icon: Building2,
  blurb: "Tracked buttons on this page",
};

export default async function ButtonsDashboard({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; err?: string }>;
}) {
  const params = await searchParams;
  const authed = await isAuthed();
  if (!authed) return <LoginForm error={params.err === "1"} />;

  const range: Range = isValidRange(params.range) ? params.range : DEFAULT_RANGE;
  const days = rangeToDays(range);
  const rows = await fetchClicks(days);
  const ranking = aggregate(rows);

  const total = ranking.reduce((sum, r) => sum + r.clicks, 0);
  const buttonsFiring = ranking.filter((r) => r.clicks > 0).length;
  const topMax = Math.max(...ranking.map((r) => r.clicks), 0);

  /* Top 5 across all pages. Skip zero-click entries so a fresh range
     doesn't pad the panel with dead rows. */
  const topFive = [...ranking]
    .filter((r) => r.clicks > 0)
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5);

  /* Bucket by page so each card can show its own click total +
     tracked-button count. */
  const byPage = new Map<string, Aggregated[]>();
  for (const r of ranking) {
    const list = byPage.get(r.page) ?? [];
    list.push(r);
    byPage.set(r.page, list);
  }
  const orderedPages: { page: string; rows: Aggregated[] }[] = [];
  for (const page of PAGE_ORDER) {
    const list = byPage.get(page);
    if (list && list.length) orderedPages.push({ page, rows: list });
  }
  for (const [page, list] of byPage) {
    if (!PAGE_ORDER.includes(page)) orderedPages.push({ page, rows: list });
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-[#101112]">
      {/* Sticky glassmorphic top nav */}
      <header className="sticky top-0 z-50 border-b border-[#101112]/[0.06] bg-[#f7f7f7]/65 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex w-full max-w-[1100px] items-center px-6 py-4 sm:px-10">
          <span className="text-[13px] font-semibold uppercase tracking-[0.18em]">
            VVAULT
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1100px] px-6 pb-20 pt-10 sm:px-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="text-[34px] font-semibold leading-tight">
            Button click analytics
          </h1>
          <RangePicker current={range} ranges={RANGES} />
        </div>

        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Stat
            label="Total clicks"
            value={formatNumber(total)}
            sub={`across ${range}`}
          />
          <Stat
            label="Top button"
            value={topFive[0] ? topFive[0].name : "—"}
            sub={
              topFive[0]
                ? `${formatNumber(topFive[0].clicks)} click${topFive[0].clicks === 1 ? "" : "s"} · ${topFive[0].page}`
                : "no clicks in this range"
            }
          />
          <Stat
            label="Buttons firing"
            value={`${buttonsFiring} / ${BUTTONS.length}`}
            sub={
              BUTTONS.length - buttonsFiring > 0
                ? `${BUTTONS.length - buttonsFiring} button${BUTTONS.length - buttonsFiring === 1 ? "" : "s"} with zero clicks`
                : "every tracked button has data"
            }
          />
        </section>

        {/* Top 5 panel */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-[#101112]/[0.06] bg-white">
          <div className="border-b border-[#101112]/[0.06] px-6 py-5 sm:px-8">
            <h2 className="text-[16px] font-semibold">Top 5 across every page</h2>
            <p className="mt-1 text-[13px] text-[#101112]/55">
              The five most-clicked buttons in this range. Bars are relative
              to the leader.
            </p>
          </div>
          {topFive.length === 0 ? (
            <div className="px-6 py-10 text-center text-[13.5px] text-[#101112]/45 sm:px-8">
              No clicks recorded in this range yet.
            </div>
          ) : (
            <ol className="divide-y divide-[#101112]/[0.05]">
              {topFive.map((row, idx) => (
                <Row
                  key={row.buttonId}
                  row={row}
                  rank={idx + 1}
                  isWinner={idx === 0}
                  share={topMax > 0 ? (row.clicks / topMax) * 100 : 0}
                />
              ))}
            </ol>
          )}
        </section>

        {/* Per-page grid of cards */}
        <section className="mt-10">
          <h2 className="text-[18px] font-semibold">Browse by page</h2>
          <p className="mt-1 text-[13px] text-[#101112]/55">
            Click any page to drill into every button tracked on it.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {orderedPages.map(({ page, rows }) => {
              const meta = PAGE_META[page] ?? FALLBACK_META;
              const Icon = meta.icon;
              const slug = pageToSlug(page);
              const pageTotal = rows.reduce((s, r) => s + r.clicks, 0);
              return (
                <Link
                  key={page}
                  href={{
                    pathname: `/admin/buttons/${slug}`,
                    query: { range },
                  }}
                  className="group flex flex-col gap-5 rounded-2xl border border-[#101112]/[0.08] bg-white p-6 transition-colors hover:border-[#101112]/[0.18] hover:bg-white"
                >
                  <Icon
                    className="h-6 w-6 text-[#101112]/80"
                    strokeWidth={1.6}
                  />
                  <div className="flex flex-col gap-1">
                    <span className="text-[15.5px] font-semibold leading-snug">
                      {page}
                    </span>
                    <span className="text-[12.5px] text-[#101112]/55">
                      {meta.blurb}
                    </span>
                  </div>
                  <div className="mt-auto flex items-end justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="text-[20px] font-semibold leading-none tabular-nums">
                        {formatNumber(pageTotal)}
                      </span>
                      <span className="mt-1 text-[10.5px] uppercase tracking-[0.08em] text-[#101112]/45">
                        {pageTotal === 1 ? "click" : "clicks"} · {rows.length} tracked
                      </span>
                    </div>
                    <ChevronRight
                      className="h-5 w-5 text-[#101112]/30 transition-colors group-hover:text-[#101112]/70"
                      strokeWidth={1.8}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <p className="mt-10 text-center text-[11.5px] text-[#101112]/40">
          Live data from public.button_clicks. Clicks = raw events.
          Visitors = distinct browser sessions (multiple clicks in one visit
          count as one visitor).
        </p>
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-[#101112]/[0.06] bg-white px-5 py-5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#101112]/55">
        {label}
      </div>
      <div className="mt-2 truncate text-[26px] font-semibold leading-tight">
        {value}
      </div>
      <div className="mt-1.5 text-[12px] text-[#101112]/55">{sub}</div>
    </div>
  );
}
