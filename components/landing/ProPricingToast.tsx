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
        className="relative overflow-hidden rounded-2xl"
        style={{
          /* Identical to the pricing-page Pro card: navy gradient
             from #0d378f at the bottom fading up to transparent at
             ~70% (so the top of the toast sits on clean black),
             layered over a #000000 base. */
          background:
            "linear-gradient(to top, rgba(13, 55, 143, 0.85) 0%, rgba(13, 55, 143, 0.50) 20%, rgba(12, 40, 110, 0.22) 40%, rgba(12, 33, 82, 0.06) 58%, rgba(0, 0, 0, 0) 70%), #000000",
          /* Same outline shadow + downward-biased outer halo the Pro
             card uses. The halo extends downward from the toast, into
             the area below — same visual relationship as the Pro card
             on the pricing page. */
          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,0.14), 0 40px 80px 0 rgba(28, 95, 200, 0.18), 0 80px 160px 10px rgba(13, 55, 143, 0.10)",
        }}
      >
        <div className="relative px-5 py-4">
          <button
            type="button"
            onClick={close}
            aria-label={fr ? "Fermer" : "Close"}
            className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full text-white/45 transition-colors duration-150 hover:bg-white/[0.08] hover:text-white"
          >
            <svg
              viewBox="0 0 16 16"
              className="h-3 w-3 fill-none stroke-current stroke-[1.5]"
              strokeLinecap="round"
            >
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
          <div className="pr-6">
            <h3 className="text-2xl font-light leading-none text-white">
              Pro
            </h3>
            <p className="mt-3 text-[13px] font-medium leading-snug text-white/55">
              {fr ? "Va plus loin avec Pro" : "Go further with Pro"}
            </p>
            <p className="mt-2 text-[12.5px] leading-snug text-white/45">
              {fr
                ? "Envois et tracking illimités, ventes à 5%, Wavematch."
                : "Unlimited sends, full tracking, 5% sales fee, Wavematch."}
            </p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[2rem] font-light leading-none text-white tabular-nums">
                  €7.49
                </span>
                <span className="text-[14px] font-medium text-white/45">
                  {fr ? "par mois" : "per month"}
                </span>
              </div>
            </div>
            <Link
              href="/pricing"
              onClick={close}
              className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-[#4397f8] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#2c75d4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4397f8]/35"
            >
              {fr ? "Voir les tarifs" : "See pricing"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
