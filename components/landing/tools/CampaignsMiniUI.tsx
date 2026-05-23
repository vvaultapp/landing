"use client";

import type { Locale } from "@/components/landing/content";

const RECIPIENTS = [
  { name: "Metro Boomin", initial: "M", color: "hsl(160,45%,28%)" },
  { name: "Southside", initial: "S", color: "hsl(220,45%,28%)" },
  { name: "Wheezy", initial: "W", color: "hsl(280,45%,28%)" },
];

export function CampaignsMiniUI({ locale = "en" }: { locale?: Locale }) {
  const fr = locale === "fr";

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-semibold text-white/30">
          {fr ? "Nouvelle campagne" : "New campaign"}
        </span>
        <span className="flex items-center gap-1 text-[9.5px] text-white/40">
          <span className="h-1 w-1 rounded-full bg-emerald-400/80" />
          Gmail
        </span>
      </div>

      {/* TO field */}
      <div
        className="rounded-lg px-2.5 py-1.5"
        style={{
          background: "rgba(255,255,255,0.018)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <span className="text-[9px] font-medium text-white/30">
          {fr ? "À" : "To"}
        </span>
        <div className="mt-1 flex flex-wrap items-center gap-1">
          {RECIPIENTS.map((r) => (
            <span
              key={r.name}
              className="inline-flex items-center gap-1 rounded-full bg-white/[0.05] py-0.5 pl-0.5 pr-1.5"
            >
              <span
                className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[7.5px] font-semibold text-white/85"
                style={{ background: r.color }}
              >
                {r.initial}
              </span>
              <span className="text-[9px] text-white/65">{r.name}</span>
            </span>
          ))}
          <span className="text-[9px] text-white/30">
            {fr ? "+12 autres" : "+12 more"}
          </span>
        </div>
      </div>

      {/* Subject */}
      <div
        className="rounded-lg px-2.5 py-1.5"
        style={{
          background: "rgba(255,255,255,0.018)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <span className="text-[9px] font-medium text-white/30">
          {fr ? "Objet" : "Subject"}
        </span>
        <p className="mt-0.5 truncate text-[10.5px] text-white/75">
          {fr
            ? "Nouveau pack : Dark Melodies Vol.3"
            : "New pack: Dark Melodies Vol.3"}
        </p>
      </div>

      {/* Send row */}
      <div className="mt-auto flex items-center justify-between">
        <span className="text-[9.5px] text-white/35">
          {fr ? "Prêt à envoyer" : "Ready to send"}
        </span>
        <button
          type="button"
          className="rounded-full bg-white px-2.5 py-1 text-[9.5px] font-semibold text-black shadow-[0_4px_10px_-2px_rgba(255,255,255,0.18)]"
        >
          {fr ? "Envoyer" : "Send"}
        </button>
      </div>
    </div>
  );
}
