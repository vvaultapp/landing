/* Per-page detail. Renders the click data for every button tracked
   on one source page (Home, Pricing, Features — Studio, etc.).
   Reached by clicking a page card on the main /admin/buttons grid. */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { RangePicker } from "../RangePicker";
import { Row } from "../Row";
import { isAuthed } from "../auth";
import { LoginForm } from "../LoginForm";
import {
  BUTTONS,
  DEFAULT_RANGE,
  RANGES,
  aggregate,
  fetchClicks,
  formatNumber,
  isValidRange,
  rangeToDays,
  slugToPage,
  type Range,
} from "../lib/buttons-catalog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ButtonsByPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ range?: string; err?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const authed = await isAuthed();
  if (!authed) return <LoginForm error={sp.err === "1"} />;

  const page = slugToPage(slug);
  if (!page) notFound();

  const range: Range = isValidRange(sp.range) ? sp.range : DEFAULT_RANGE;
  const days = rangeToDays(range);

  /* Only include this page's buttons in the dashboard math so the
     "X / Y firing" counter reflects the page itself, not the whole
     catalog. */
  const pageButtons = BUTTONS.filter((b) => b.page === page);
  const pageButtonIds = new Set(pageButtons.map((b) => b.buttonId));
  const allRows = await fetchClicks(days);
  const pageRows = allRows.filter((r) => pageButtonIds.has(r.button_id));

  const aggregated = aggregate(pageRows).filter((r) => pageButtonIds.has(r.buttonId));
  const sorted = [...aggregated].sort((a, b) => b.clicks - a.clicks);

  const total = sorted.reduce((s, r) => s + r.clicks, 0);
  const firing = sorted.filter((r) => r.clicks > 0).length;
  const max = Math.max(...sorted.map((r) => r.clicks), 0);

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
        <Link
          href={{ pathname: "/admin/buttons", query: { range } }}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#101112]/55 transition-colors hover:text-[#101112]"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          All pages
        </Link>

        <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[32px] font-semibold leading-tight">{page}</h1>
            <p className="mt-2 text-[13.5px] text-[#101112]/55">
              Every button tracked on this page, sorted by clicks in the
              selected range.
            </p>
          </div>
          <RangePicker current={range} ranges={RANGES} />
        </div>

        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Stat
            label="Page clicks"
            value={formatNumber(total)}
            sub={`across ${range}`}
          />
          <Stat
            label="Top button"
            value={sorted[0] && sorted[0].clicks > 0 ? sorted[0].name : "—"}
            sub={
              sorted[0] && sorted[0].clicks > 0
                ? `${formatNumber(sorted[0].clicks)} click${sorted[0].clicks === 1 ? "" : "s"}`
                : "no clicks in this range"
            }
          />
          <Stat
            label="Buttons firing"
            value={`${firing} / ${pageButtons.length}`}
            sub={
              pageButtons.length - firing > 0
                ? `${pageButtons.length - firing} button${pageButtons.length - firing === 1 ? "" : "s"} with zero clicks`
                : "every tracked button has data"
            }
          />
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-[#101112]/[0.06] bg-white">
          <div className="border-b border-[#101112]/[0.06] px-6 py-5 sm:px-8">
            <h2 className="text-[16px] font-semibold">Ranking</h2>
            <p className="mt-1 text-[13px] text-[#101112]/55">
              Best performing at the top, worst at the bottom. Bars are
              relative to the leader on this page.
            </p>
          </div>
          <ol className="divide-y divide-[#101112]/[0.05]">
            {sorted.map((row, idx) => (
              <Row
                key={row.buttonId}
                row={row}
                rank={idx + 1}
                isWinner={idx === 0 && row.clicks > 0}
                share={max > 0 ? (row.clicks / max) * 100 : 0}
              />
            ))}
          </ol>
        </section>

        <p className="mt-10 text-center text-[11.5px] text-[#101112]/40">
          Live data from public.button_clicks. Clicks = raw events.
          Visitors = distinct browser sessions.
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
