/* CTA click analytics dashboard — mirrors the paywall analytics
   layout (4 stat cards, daily bars, breakdown table) but for landing
   button clicks logged into public.button_clicks. Server-rendered and
   reads via the Supabase service role; the table has no public SELECT
   policy. URL: /admin/buttons?range=30d */

import { createClient } from "@supabase/supabase-js";
import { RangePicker } from "./RangePicker";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Range = "7d" | "14d" | "30d" | "60d" | "90d";
const RANGES: Range[] = ["7d", "14d", "30d", "60d", "90d"];

function rangeToDays(r: Range): number {
  return Number(r.replace("d", ""));
}

type ClickRow = {
  button_id: string;
  surface: string | null;
  plan_id: string | null;
  created_at: string;
  session_id: string | null;
};

async function fetchClicks(days: number): Promise<ClickRow[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return [];
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
  const since = new Date(Date.now() - days * 86400_000).toISOString();
  const { data, error } = await supabase
    .from("button_clicks")
    .select("button_id, surface, plan_id, created_at, session_id")
    .gte("created_at", since)
    .order("created_at", { ascending: true })
    .limit(50_000);
  if (error || !data) return [];
  return data as ClickRow[];
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatRelative(iso: string): string {
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

function bucketByDay(rows: ClickRow[], days: number) {
  /* Bucket keys are UTC-date strings (YYYY-MM-DD) so they match the
     prefix slice of `created_at`, which Postgres / Supabase serializes
     as a UTC timestamp. Using local midnight would put the boundary
     in a different UTC day for any non-UTC server. */
  const buckets = new Map<string, number>();
  const now = new Date();
  const todayUtcMidnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(todayUtcMidnight - i * 86400_000);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const r of rows) {
    const key = r.created_at.slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) || 0) + 1);
  }
  return Array.from(buckets.entries()).map(([day, count]) => ({ day, count }));
}

type ButtonRow = {
  buttonId: string;
  surface: string;
  clicks: number;
  uniqueSessions: number;
  lastClicked: string | null;
};

function groupByButton(rows: ClickRow[]): ButtonRow[] {
  const byKey = new Map<string, ButtonRow>();
  for (const r of rows) {
    const key = `${r.button_id}::${r.surface || ""}`;
    let existing = byKey.get(key);
    if (!existing) {
      existing = {
        buttonId: r.button_id,
        surface: r.surface || "—",
        clicks: 0,
        uniqueSessions: 0,
        lastClicked: null,
      };
      byKey.set(key, existing);
    }
    existing.clicks += 1;
    if (!existing.lastClicked || r.created_at > existing.lastClicked) {
      existing.lastClicked = r.created_at;
    }
  }
  // Compute unique sessions per button
  for (const [key, row] of byKey.entries()) {
    const [bid, surface] = key.split("::");
    const sessions = new Set<string>();
    for (const r of rows) {
      if (r.button_id === bid && (r.surface || "") === surface && r.session_id) {
        sessions.add(r.session_id);
      }
    }
    row.uniqueSessions = sessions.size;
  }
  return Array.from(byKey.values()).sort((a, b) => b.clicks - a.clicks);
}

export default async function ButtonsDashboard({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const params = await searchParams;
  const rawRange = (params.range || "30d") as Range;
  const range: Range = (RANGES.includes(rawRange) ? rawRange : "30d") as Range;
  const days = rangeToDays(range);
  const rows = await fetchClicks(days);
  const total = rows.length;
  const uniqueSessions = new Set(rows.map((r) => r.session_id).filter(Boolean)).size;
  const distinctButtons = new Set(rows.map((r) => r.button_id)).size;
  const distinctSurfaces = new Set(rows.map((r) => r.surface || "")).size;
  const buckets = bucketByDay(rows, days);
  const maxBucket = buckets.reduce((m, b) => Math.max(m, b.count), 0);
  const grouped = groupByButton(rows);

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-[#101112]">
      <header className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 py-6 sm:px-10">
        <div className="flex items-center gap-6">
          <span className="text-[13px] font-semibold uppercase tracking-[0.18em]">
            VVAULT
          </span>
          <nav className="flex items-center gap-2 text-[14px] font-medium">
            <span className="inline-flex items-center rounded-full bg-black px-4 py-1.5 text-white">
              Button clicks
            </span>
            <a
              href="https://vvault-dashboard-redesign-preview.vercel.app"
              className="inline-flex items-center rounded-full px-4 py-1.5 text-[#101112]/70 hover:bg-black/[0.05] hover:text-[#101112]"
            >
              Paywall analytics
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] px-6 pb-20 sm:px-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[34px] font-semibold leading-tight">
              Button click analytics
            </h1>
            <p className="mt-2 max-w-[680px] text-[14px] leading-relaxed text-[#101112]/55">
              Every CTA click across the landing — top-nav Get Started and Log
              In, hero Continue with Google and Start for free, the Pro promo
              toast, the pricing cards, and the compare-plans header.
            </p>
          </div>
          <RangePicker current={range} ranges={RANGES} />
        </div>

        <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Total clicks"
            value={formatNumber(total)}
            sub={`across ${range}`}
            color="black"
          />
          <StatCard
            label="Unique sessions"
            value={formatNumber(uniqueSessions)}
            sub={total > 0 ? `${((uniqueSessions / total) * 100).toFixed(1)}% of clicks` : "—"}
            color="green"
          />
          <StatCard
            label="Buttons tracked"
            value={formatNumber(distinctButtons)}
            sub={`${distinctSurfaces} surface${distinctSurfaces === 1 ? "" : "s"}`}
            color="blue"
          />
          <StatCard
            label="Avg / day"
            value={formatNumber(Math.round(total / days))}
            sub={total > 0 ? `peak ${formatNumber(maxBucket)} on best day` : "—"}
            color="amber"
          />
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(16,17,18,0.04),0_4px_24px_rgba(16,17,18,0.04)] sm:p-8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[15px] font-semibold">
              Daily &mdash; total clicks
            </h2>
            <span className="text-[12px] text-[#101112]/45">
              {days} day buckets &middot; max {formatNumber(maxBucket)}
            </span>
          </div>
          <div className="mt-6 flex h-[180px] items-end gap-1.5">
            {buckets.map((b) => {
              const h = maxBucket > 0 ? Math.max(2, (b.count / maxBucket) * 100) : 2;
              return (
                <div
                  key={b.day}
                  title={`${b.day} — ${b.count} clicks`}
                  className="flex-1 rounded-sm bg-[#e3e4e6] transition-colors hover:bg-[#cdd0d3]"
                  style={{ height: `${h}%` }}
                />
              );
            })}
          </div>
          <div className="mt-3 flex justify-between text-[11px] text-[#101112]/45">
            <span>{buckets[0] ? formatDateShort(buckets[0].day) : "—"}</span>
            <span>
              {buckets[buckets.length - 1]
                ? formatDateShort(buckets[buckets.length - 1].day)
                : "—"}
            </span>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(16,17,18,0.04),0_4px_24px_rgba(16,17,18,0.04)]">
          <div className="border-b border-[#101112]/[0.06] px-6 py-5 sm:px-8">
            <h2 className="text-[15px] font-semibold">Breakdown by button</h2>
            <p className="mt-1 text-[13px] text-[#101112]/55">
              Each row is one button on one surface. Sorted by click count.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-[#101112]/[0.06] text-[11px] uppercase tracking-[0.08em] text-[#101112]/45">
                  <th className="px-6 py-3 text-left font-medium sm:px-8">Button</th>
                  <th className="px-6 py-3 text-left font-medium sm:px-8">Surface</th>
                  <th className="px-6 py-3 text-right font-medium sm:px-8">Clicks</th>
                  <th className="px-6 py-3 text-right font-medium sm:px-8">Sessions</th>
                  <th className="px-6 py-3 text-right font-medium sm:px-8">Last clicked</th>
                </tr>
              </thead>
              <tbody>
                {grouped.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-[14px] text-[#101112]/45 sm:px-8"
                    >
                      No clicks yet in the last {range}. As soon as visitors
                      click a tracked button, it will appear here.
                    </td>
                  </tr>
                ) : (
                  grouped.map((row) => (
                    <tr
                      key={`${row.buttonId}-${row.surface}`}
                      className="border-b border-[#101112]/[0.04] last:border-0"
                    >
                      <td className="px-6 py-3.5 font-mono text-[13px] sm:px-8">
                        {row.buttonId}
                      </td>
                      <td className="px-6 py-3.5 text-[13px] text-[#101112]/65 sm:px-8">
                        {row.surface}
                      </td>
                      <td className="px-6 py-3.5 text-right tabular-nums sm:px-8">
                        {formatNumber(row.clicks)}
                      </td>
                      <td className="px-6 py-3.5 text-right tabular-nums text-[#101112]/65 sm:px-8">
                        {formatNumber(row.uniqueSessions)}
                      </td>
                      <td className="px-6 py-3.5 text-right text-[13px] text-[#101112]/55 sm:px-8">
                        {row.lastClicked ? formatRelative(row.lastClicked) : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <p className="mt-10 text-center text-[12px] text-[#101112]/40">
          Reads server-side via the Supabase service role. No public SELECT
          policy on public.button_clicks.
        </p>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: "black" | "green" | "blue" | "amber";
}) {
  const colorClass =
    color === "green"
      ? "text-[#0ea968]"
      : color === "blue"
        ? "text-[#1d6ad6]"
        : color === "amber"
          ? "text-[#d18004]"
          : "text-[#101112]";
  return (
    <div className="rounded-2xl bg-white px-5 py-5 shadow-[0_1px_2px_rgba(16,17,18,0.04),0_4px_24px_rgba(16,17,18,0.04)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#101112]/55">
        {label}
      </div>
      <div className={`mt-2 text-[36px] font-semibold leading-none tabular-nums ${colorClass}`}>
        {value}
      </div>
      <div className="mt-3 text-[12px] text-[#101112]/55">{sub}</div>
    </div>
  );
}
