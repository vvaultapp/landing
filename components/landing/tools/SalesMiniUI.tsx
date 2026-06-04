"use client";

import Image from "next/image";
import type { Locale } from "@/components/landing/content";

export function SalesMiniUI({ locale = "en" }: { locale?: Locale }) {
  const fr = locale === "fr";

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-semibold text-white/30">
          {fr ? "Marketplace" : "Marketplace"}
        </span>
        <span
          className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold leading-none"
          style={{
            background: "rgba(52,211,153,0.08)",
            color: "rgba(52,211,153,0.85)",
            border: "1px solid rgba(52,211,153,0.18)",
          }}
        >
          {fr ? "0% sur Ultra" : "0% on Ultra"}
        </span>
      </div>

      {/* track row */}
      <div
        className="flex items-center gap-2 rounded-xl px-2.5 py-2"
        style={{
          background: "rgba(255,255,255,0.018)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div
          className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg"
          style={{ boxShadow: "0 4px 10px rgba(0,0,0,0.4)" }}
        >
          <Image
            src="/covers/pack-1.jpg"
            alt="Dark Melodies"
            fill
            sizes="36px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10.5px] font-semibold text-white/85">
            Dark Melodies Vol.3
          </p>
          <p className="text-[9px] text-white/40">Melody Pack · 140 BPM</p>
        </div>
        <span
          className="rounded-full px-1.5 py-0.5 text-[9.5px] font-medium text-white/65"
          style={{ border: "1px solid rgba(255,255,255,0.12)" }}
        >
          €29.99
        </span>
      </div>

      {/* checkout pill */}
      <div className="mt-auto flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[10px]"
        style={{
          background: "rgba(52,211,153,0.04)",
          border: "1px solid rgba(52,211,153,0.14)",
        }}
      >
        <span className="flex items-center gap-1 text-emerald-300/85">
          <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor">
            <path d="M14 4L5.5 12.5 2 9" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {fr ? "Vendu via Stripe" : "Sold via Stripe"}
        </span>
        <span className="text-emerald-300/55 tabular-nums">€29.99</span>
      </div>
    </div>
  );
}
