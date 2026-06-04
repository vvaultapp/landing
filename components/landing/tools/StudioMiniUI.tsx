"use client";

import Image from "next/image";
import type { Locale } from "@/components/landing/content";

const PACK_COVERS = [
  "/covers/pack-1.jpg",
  "/covers/pack-2.jpg",
  "/covers/pack-3.jpg",
];

type Platform = { id: "tiktok" | "reels" | "shorts"; label: string; dot: string };

export function StudioMiniUI({ locale = "en" }: { locale?: Locale }) {
  const fr = locale === "fr";
  const platforms: Platform[] = [
    { id: "tiktok", label: "TikTok", dot: "#f472b6" },
    { id: "reels", label: "Reels", dot: "#a78bfa" },
    { id: "shorts", label: "Shorts", dot: "#ef4444" },
  ];

  return (
    <div className="flex h-full flex-col gap-2.5">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-semibold text-white/30">
          Studio
        </span>
        <span className="flex items-center gap-1 text-[10px] text-white/50">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink-400/80" />
          {fr ? "Programmé dans 2h" : "Scheduled in 2h"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {platforms.map((p, i) => (
          <div
            key={p.id}
            className="group relative aspect-[9/12] overflow-hidden rounded-xl transition-transform duration-300 hover:-translate-y-0.5"
            style={{
              boxShadow: "0 10px 24px -8px rgba(0,0,0,0.6)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <Image
              src={PACK_COVERS[i % PACK_COVERS.length]}
              alt={p.label}
              fill
              sizes="120px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* gradient veil */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/72 via-transparent to-black/20" />
            {/* play hint */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-black"
                style={{
                  background: "rgba(255,255,255,0.92)",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.45)",
                }}
              >
                <svg viewBox="0 0 16 16" className="ml-0.5 h-3 w-3" fill="currentColor">
                  <path d="M4 2.5v11l9-5.5z" />
                </svg>
              </div>
            </div>
            {/* platform chip */}
            <div className="absolute inset-x-1.5 bottom-1.5">
              <span
                className="flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-[9px] font-medium text-white/85"
                style={{
                  background: "rgba(0,0,0,0.55)",
                  backdropFilter: "blur(6px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: p.dot }}
                />
                {p.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-auto flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[10px]"
        style={{
          background: "rgba(244,114,182,0.06)",
          border: "1px solid rgba(244,114,182,0.18)",
        }}
      >
        <span className="text-pink-300/85">
          {fr ? "Posté à l'heure optimale" : "Posted at peak time"}
        </span>
        <span className="text-pink-300/55">19:32</span>
      </div>
    </div>
  );
}
