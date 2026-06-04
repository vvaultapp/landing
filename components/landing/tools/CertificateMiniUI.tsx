"use client";

import type { Locale } from "@/components/landing/content";

export function CertificateMiniUI({ locale = "en" }: { locale?: Locale }) {
  const fr = locale === "fr";

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      {/* medallion */}
      <div className="relative flex h-[88px] w-[88px] items-center justify-center sm:h-[100px] sm:w-[100px]">
        {/* outer rotating conic ring (subtle, decorative) */}
        <div
          className="absolute inset-0 rounded-full opacity-65"
          style={{
            background:
              "conic-gradient(from 90deg, #fbbf24 0deg, transparent 90deg, #f59e0b 180deg, transparent 270deg, #fbbf24 360deg)",
            filter: "blur(6px)",
            animation: "prism-dot-spin 12s linear infinite",
          }}
        />
        {/* inner medallion */}
        <div
          className="relative flex h-full w-full items-center justify-center rounded-full"
          style={{
            background:
              "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.18) 0%, rgba(20,20,22,1) 60%)",
            border: "1px solid rgba(251,191,36,0.45)",
            boxShadow:
              "inset 0 1px 0 0 rgba(255,255,255,0.1), 0 10px 28px -6px rgba(251,191,36,0.28)",
          }}
        >
          {/* checkmark badge */}
          <svg
            viewBox="0 0 24 24"
            className="h-9 w-9 sm:h-10 sm:w-10"
            fill="none"
          >
            <defs>
              <linearGradient id="cert-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fde68a" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <circle
              cx="12"
              cy="12"
              r="8.5"
              stroke="url(#cert-grad)"
              strokeWidth={1.6}
            />
            <path
              d="M8.5 12.2l2.5 2.5 4.6-4.9"
              stroke="url(#cert-grad)"
              strokeWidth={1.8}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* hash + timestamp */}
      <div
        className="w-full rounded-xl px-3 py-2 font-mono text-[9.5px] tabular-nums leading-relaxed text-white/45"
        style={{
          background: "rgba(255,255,255,0.018)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex items-center justify-between text-[8.5px] text-white/30">
          <span>SHA-256</span>
          <span>2026 · 04 · 12</span>
        </div>
        <p className="mt-1 break-all text-[9.5px] text-amber-300/65">
          0x7a3f…b81e92
        </p>
      </div>
      <p className="text-center text-[10.5px] text-white/55">
        {fr ? "Preuve horodatée d'authorship" : "Timestamped authorship proof"}
      </p>
    </div>
  );
}
