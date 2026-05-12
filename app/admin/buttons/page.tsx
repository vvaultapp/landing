/* Real button-click analytics. Reads rows from public.button_clicks
   (server-side, service role) and ranks the 11 tracked landing CTAs by
   click count. URL: /admin/buttons?range=30d
   Gated by a shared password (see ./auth.ts). */

import { createClient } from "@supabase/supabase-js";
import { RangePicker } from "./RangePicker";
import { isAuthed } from "./auth";
import { LoginForm } from "./LoginForm";

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

type ButtonDef = {
  buttonId: string;
  name: string;
  location: string;
};

const BUTTONS: ButtonDef[] = [
  { buttonId: "nav.get_started", name: "Get Started", location: "Top nav" },
  { buttonId: "nav.log_in", name: "Log in", location: "Top nav" },
  { buttonId: "hero.continue_google", name: "Continue with Google", location: "Hero" },
  { buttonId: "hero.start_for_free", name: "Start for free", location: "Hero" },
  { buttonId: "toast.join_pro", name: "Join Pro now", location: "Pro notification" },
  { buttonId: "pricing_page.card_free", name: "Sign up — Free", location: "Pricing page" },
  { buttonId: "pricing_page.card_pro", name: "Join Pro now", location: "Pricing page" },
  { buttonId: "pricing_page.card_ultra", name: "Join Ultra now", location: "Pricing page" },
  { buttonId: "pricing_page.compare_free", name: "Get Started — Free", location: "Compare plans" },
  { buttonId: "pricing_page.compare_pro", name: "Get Started — Pro", location: "Compare plans" },
  { buttonId: "pricing_page.compare_ultra", name: "Get Started — Ultra", location: "Compare plans" },
];

async function fetchClicks(days: number): Promise<ClickRow[]> {
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

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

function formatRelative(iso: string | null): string {
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

type Aggregated = ButtonDef & {
  clicks: number;
  uniqueVisitors: number;
  lastClicked: string | null;
};

function aggregate(rows: ClickRow[]): Aggregated[] {
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
  }).sort((a, b) => b.clicks - a.clicks);
}

const LOCATION_COLORS: Record<string, string> = {
  "Top nav": "bg-[#101112]/[0.08] text-[#101112]/75",
  Hero: "bg-[#1d6ad6]/10 text-[#1d6ad6]",
  "Pro notification": "bg-[#4397f8]/12 text-[#1f5fbf]",
  "Pricing page": "bg-[#0ea968]/10 text-[#0a7d4d]",
  "Compare plans": "bg-[#d18004]/12 text-[#9a5c00]",
};

export default async function ButtonsDashboard({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; err?: string }>;
}) {
  const params = await searchParams;
  const authed = await isAuthed();
  if (!authed) return <LoginForm error={params.err === "1"} />;

  const rawRange = (params.range || "30d") as Range;
  const range: Range = (RANGES.includes(rawRange) ? rawRange : "30d") as Range;
  const days = rangeToDays(range);
  const rows = await fetchClicks(days);
  const ranking = aggregate(rows);
  const total = ranking.reduce((sum, r) => sum + r.clicks, 0);
  const topMax = ranking[0]?.clicks || 0;
  const top = ranking[0];
  const buttonsFiring = ranking.filter((r) => r.clicks > 0).length;

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-[#101112]">
      {/* Sticky glassmorphic top nav — pinned to the viewport top with
          a blurred translucent surface so it floats above the page. */}
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
          <Stat label="Total clicks" value={formatNumber(total)} sub={`across ${range}`} />
          <Stat
            label="Top button"
            value={top && top.clicks > 0 ? top.name : "—"}
            sub={
              top && top.clicks > 0
                ? `${formatNumber(top.clicks)} click${top.clicks === 1 ? "" : "s"} from ${top.location.toLowerCase()}`
                : "no clicks yet"
            }
          />
          <Stat
            label="Buttons firing"
            value={`${buttonsFiring} / ${BUTTONS.length}`}
            sub={
              BUTTONS.length - buttonsFiring > 0
                ? `${BUTTONS.length - buttonsFiring} button${BUTTONS.length - buttonsFiring === 1 ? "" : "s"} with zero clicks`
                : "all tracked buttons have data"
            }
          />
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-[#101112]/[0.06] bg-white">
          <div className="border-b border-[#101112]/[0.06] px-6 py-5 sm:px-8">
            <h2 className="text-[16px] font-semibold">Ranking</h2>
            <p className="mt-1 text-[13px] text-[#101112]/55">
              Best performing at the top, worst at the bottom. The bar under
              each name shows how its click count compares to the leader.
            </p>
          </div>

          <ol className="divide-y divide-[#101112]/[0.05]">
            {ranking.map((row, idx) => {
              const share = topMax > 0 ? (row.clicks / topMax) * 100 : 0;
              const isWinner = idx === 0 && row.clicks > 0;
              const locationClass =
                LOCATION_COLORS[row.location] || "bg-[#101112]/[0.06] text-[#101112]/70";
              return (
                <li
                  key={row.buttonId}
                  className="flex items-center gap-4 px-6 py-4 sm:px-8"
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold tabular-nums ${
                      isWinner
                        ? "bg-black text-white"
                        : row.clicks === 0
                          ? "bg-[#101112]/[0.04] text-[#101112]/35"
                          : "bg-[#101112]/[0.06] text-[#101112]/65"
                    }`}
                  >
                    {idx + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-[15px] font-semibold">
                        {row.name}
                      </span>
                      <span
                        className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-[0.06em] ${locationClass}`}
                      >
                        {row.location}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#101112]/[0.05]">
                      <div
                        className={`h-full rounded-full ${
                          row.clicks === 0
                            ? "bg-transparent"
                            : isWinner
                              ? "bg-black"
                              : "bg-[#101112]/55"
                        }`}
                        style={{ width: `${share}%` }}
                      />
                    </div>
                    <div className="mt-1.5 text-[11.5px] text-[#101112]/45">
                      {row.clicks === 0
                        ? "no clicks in this range"
                        : `Clicked by ${formatNumber(row.uniqueVisitors)} different visitor${row.uniqueVisitors === 1 ? "" : "s"} · most recent click ${formatRelative(row.lastClicked)}`}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-[22px] font-semibold leading-none tabular-nums">
                      {formatNumber(row.clicks)}
                    </div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.08em] text-[#101112]/45">
                      clicks
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <p className="mt-10 text-center text-[11.5px] text-[#101112]/40">
          Live data from public.button_clicks. &quot;Clicks&quot; is the raw
          total. &quot;Different visitors&quot; counts distinct browser
          sessions, so one person clicking the same button twice in the same
          visit still counts as one visitor.
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
      <div className="mt-2 truncate text-[28px] font-semibold leading-tight">
        {value}
      </div>
      <div className="mt-1.5 text-[12px] text-[#101112]/55">{sub}</div>
    </div>
  );
}
