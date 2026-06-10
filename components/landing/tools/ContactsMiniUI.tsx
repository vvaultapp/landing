"use client";

import type { Locale } from "@/components/landing/content";

type Row = {
  initial: string;
  name: string;
  tag: string;
  tagColor: string;
  score: number;
  bg: string;
};

export function ContactsMiniUI({ locale = "en" }: { locale?: Locale }) {
  const fr = locale === "fr";
  const rows: Row[] = [
    {
      initial: "M",
      name: "Metro Boomin",
      tag: fr ? "Producteur" : "Producer",
      tagColor: "#a78bfa",
      score: 94,
      bg: "hsl(265,40%,28%)",
    },
    {
      initial: "L",
      name: "Lyrical Lemonade",
      tag: fr ? "Label" : "Label",
      tagColor: "#60a5fa",
      score: 81,
      bg: "hsl(215,45%,28%)",
    },
    {
      initial: "S",
      name: "Southside",
      tag: fr ? "A&R" : "A&R",
      tagColor: "#fbbf24",
      score: 76,
      bg: "hsl(35,45%,28%)",
    },
  ];

  return (
    <div className="flex h-full flex-col gap-1.5">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-semibold text-white/30">
          {fr ? "Contacts" : "Contacts"}
        </span>
        <span className="text-[9.5px] text-white/30">
          {fr ? "3 sur 247" : "3 of 247"}
        </span>
      </div>
      {rows.map((r) => (
        <div
          key={r.name}
          className="group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-white/[0.03]"
          style={{
            background: "rgba(255,255,255,0.018)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10.5px] font-semibold text-white/85"
            style={{ background: r.bg }}
          >
            {r.initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11.5px] font-medium text-white/82">
              {r.name}
            </p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span
                className="rounded-full px-1.5 text-[8.5px] font-medium leading-[14px]"
                style={{
                  background: `${r.tagColor}14`,
                  color: r.tagColor,
                  border: `1px solid ${r.tagColor}26`,
                }}
              >
                {r.tag}
              </span>
            </div>
          </div>
          {/* engagement score bar */}
          <div className="flex shrink-0 flex-col items-end gap-0.5">
            <span className="text-[10px] font-semibold tabular-nums text-white/65">
              {r.score}
            </span>
            <div
              className="h-[3px] w-12 overflow-hidden rounded-full"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${r.score}%`,
                  background: `linear-gradient(90deg, ${r.tagColor}, ${r.tagColor}99)`,
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
