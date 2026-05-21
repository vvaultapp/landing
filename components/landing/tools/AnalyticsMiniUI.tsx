"use client";

import type { Locale } from "@/components/landing/content";

export function AnalyticsMiniUI({ locale = "en" }: { locale?: Locale }) {
  const fr = locale === "fr";

  const kpis = [
    { label: fr ? "Envoyés" : "Sent", value: "1,247", delta: "+12%", dot: "#fbbf24" },
    { label: fr ? "Ouverts" : "Opens", value: "76%", delta: "+8%", dot: "#34d399" },
    { label: fr ? "Écoutes" : "Plays", value: "612", delta: "+24%", dot: "#60a5fa" },
  ];

  const activity = [
    { who: "Metro", what: fr ? "a ouvert" : "opened", time: "2m", color: "#34d399" },
    { who: "Southside", what: fr ? "a écouté" : "played", time: "4m", color: "#60a5fa" },
    { who: "Wheezy", what: fr ? "a téléchargé" : "downloaded", time: "12m", color: "#c084fc" },
  ];

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-white/30">
          Analytics
        </span>
        <span className="flex items-center gap-1 text-[9.5px] text-white/40">
          <span className="h-1 w-1 animate-pulse rounded-full bg-amber-400/80" />
          {fr ? "En direct" : "Live"}
        </span>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-1.5">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-lg px-2 py-1.5"
            style={{
              background: "rgba(255,255,255,0.018)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div className="flex items-center gap-1">
              <span
                className="h-1 w-1 rounded-full"
                style={{ background: k.dot }}
              />
              <span className="text-[9px] text-white/35">{k.label}</span>
            </div>
            <p className="mt-1 text-[14px] font-semibold tabular-nums text-white">
              {k.value}
            </p>
            <p className="text-[8.5px] font-medium text-emerald-400/70">
              {k.delta}
            </p>
          </div>
        ))}
      </div>

      {/* Activity feed */}
      <div className="mt-1 space-y-0.5">
        {activity.map((a, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[10px]"
          >
            <span
              className="h-1 w-1 shrink-0 rounded-full"
              style={{ background: a.color }}
            />
            <span className="font-medium text-white/72">{a.who}</span>
            <span className="text-white/30">{a.what}</span>
            <span className="ml-auto text-[9px] text-white/25">{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
