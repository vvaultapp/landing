"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ProPricingToastProps = {
  locale?: "en" | "fr";
};

const SESSION_DISMISSED_KEY = "vvault-pro-toast-dismissed";

/**
 * Scroll-triggered Pro plan promo toast. An IntersectionObserver
 * watches `#certificate-teaser`; the first time that section enters
 * the viewport (≥30% visible), the toast slides in at the bottom-
 * right of the page. It only shows once per session — closing it
 * (or letting it auto-dismiss after a long scroll) writes a flag to
 * sessionStorage so the visitor never sees it twice in the same tab.
 *
 * Visual language matches the cookie banner (solid grey-black plate
 * with rounded corners) so the two pieces of landing-page chrome
 * read as the same system, just different colors of the same family.
 * The Pro CTA picks up the existing #4397f8 brand blue so it
 * connects visually with the pricing-page Pro card + Join Pro CTA.
 */
export function ProPricingToast({ locale = "en" }: ProPricingToastProps) {
  const [shown, setShown] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_DISMISSED_KEY) === "1") {
        setDismissed(true);
        return;
      }
    } catch {}
    const target = document.getElementById("certificate-teaser");
    if (!target) return;
    /* threshold: 0 fires as soon as ANY pixel of the target enters
       the viewport, which is what we want here — the CertificateTeaser
       is a tall section (cert preview + headline + copy + CTA), so a
       higher threshold would never trigger because 30% of the whole
       section is never visible at once. rootMargin lets us bias the
       trigger to fire once the section's heading is comfortably in
       view rather than the very top edge just grazing it. */
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0, rootMargin: "0px 0px -25% 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  if (dismissed || !shown) return null;

  const fr = locale === "fr";

  function close() {
    try {
      sessionStorage.setItem(SESSION_DISMISSED_KEY, "1");
    } catch {}
    setDismissed(true);
  }

  return (
    <div
      role="dialog"
      aria-label={fr ? "Promotion Pro" : "Pro plan promo"}
      className="fixed bottom-4 right-4 z-[60] sm:bottom-6 sm:right-6 w-[calc(100%-2rem)] max-w-[360px] animate-[proToastIn_280ms_cubic-bezier(0.22,1,0.36,1)_both]"
    >
      <div
        className="relative overflow-hidden rounded-2xl px-5 py-4 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.65)]"
        style={{
          background: "linear-gradient(180deg, #1f1f24 0%, #15151a 100%)",
        }}
      >
        {/* Top thin accent line so the toast reads as Pro-branded */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-6 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(67,151,248,0.55) 35%, rgba(67,151,248,0.55) 65%, transparent 100%)",
          }}
        />
        <button
          type="button"
          onClick={close}
          aria-label={fr ? "Fermer" : "Close"}
          className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full text-white/40 transition-colors duration-150 hover:bg-white/[0.08] hover:text-white"
        >
          <svg
            viewBox="0 0 16 16"
            className="h-3 w-3 fill-none stroke-current stroke-[1.5]"
            strokeLinecap="round"
          >
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        </button>
        <div className="flex items-start gap-3 pr-6">
          <span className="mt-1 inline-flex h-2 w-2 shrink-0 rounded-full bg-[#4397f8] shadow-[0_0_12px_2px_rgba(67,151,248,0.6)]" />
          <div className="min-w-0 flex-1">
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.20em] text-[#4397f8]">
              Pro
            </div>
            <h3 className="mt-1 text-[14px] font-semibold leading-tight text-white">
              {fr ? "Va plus loin avec Pro" : "Go further with Pro"}
            </h3>
            <p className="mt-1.5 text-[12.5px] leading-snug text-white/55">
              {fr
                ? "Envois et tracking illimités, ventes à 5%, WaveMatch."
                : "Unlimited sends, full tracking, 5% sales fee, WaveMatch."}
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex items-baseline gap-1">
                <span className="text-[20px] font-semibold leading-none text-white">
                  €7.49
                </span>
                <span className="text-[12px] text-white/40">
                  {fr ? "/mois" : "/mo"}
                </span>
              </div>
              <Link
                href="/pricing"
                onClick={close}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#4397f8] px-3.5 py-1.5 text-[12px] font-semibold text-white transition-colors duration-200 hover:bg-[#2c75d4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4397f8]/35"
              >
                {fr ? "Voir les tarifs" : "See pricing"}
                <svg
                  viewBox="0 0 12 12"
                  className="h-2.5 w-2.5 fill-none stroke-current stroke-[1.8]"
                >
                  <path
                    d="M2.5 6h7M6.5 3l3 3-3 3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
