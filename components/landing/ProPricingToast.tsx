"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ProPricingToastProps = {
  locale?: "en" | "fr";
};

const SESSION_DISMISSED_KEY = "vvault-pro-toast-dismissed";

/**
 * Scroll-triggered Pro plan promo toast.
 *
 * Trigger: an IntersectionObserver watches `#certificate-teaser`. The
 * toast slides in at the bottom-right of the page the moment any pixel
 * of that section enters the viewport.
 *
 * Persistence: the toast survives the current page session but is
 * NOT marked dismissed across reloads. The previous version stored a
 * sessionStorage flag the first time the toast showed and never showed
 * it again — that was the "doesn't re-appear after refresh" symptom.
 * The flag is now only written when the user explicitly clicks the X
 * close button. Reloading the page and scrolling back to the
 * Certificate section re-triggers the observer and the toast comes
 * back, exactly as expected.
 *
 * Pricing: shows the MONTHLY price (€8.99) so the headline number is
 * an accurate "what you'll pay if you don't commit to annual" — the
 * same shape the pricing page Pro card shows when the toggle is off.
 *
 * CTA: links to `https://vvault.app/signup?plan=pro`, which is the
 * exact same destination as the pricing page's "Join Pro now" button
 * for a logged-out visitor — they sign up and the plan-selector
 * lands on Pro automatically.
 *
 * Visual: identical language to the pricing-page Pro card — same navy
 * gradient bg, same downward-biased outer halo, same white-on-navy
 * outline. Top-right "Recommended" label so the card reads as the
 * marketing equivalent of the Pro card's middle-column emphasis.
 */
export function ProPricingToast({ locale = "en" }: ProPricingToastProps) {
  const [shown, setShown] = useState(false);
  const [closedByUser, setClosedByUser] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_DISMISSED_KEY) === "1") {
        setClosedByUser(true);
        return;
      }
    } catch {}
    const target = document.getElementById("certificate-teaser");
    if (!target) return;
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

  if (closedByUser || !shown) return null;

  const fr = locale === "fr";

  function close() {
    try {
      sessionStorage.setItem(SESSION_DISMISSED_KEY, "1");
    } catch {}
    setClosedByUser(true);
  }

  return (
    <div
      role="dialog"
      aria-label={fr ? "Promotion Pro" : "Pro plan promo"}
      className="fixed bottom-4 right-4 z-[60] w-[calc(100%-2rem)] max-w-[380px] animate-[proToastIn_360ms_cubic-bezier(0.22,1,0.36,1)_both] sm:bottom-6 sm:right-6"
    >
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          /* Identical to the pricing-page Pro card: navy gradient
             from #0d378f at the bottom fading up to transparent at
             ~70% so the upper portion sits on clean black, over a
             #000000 base. */
          background:
            "linear-gradient(to top, rgba(13, 55, 143, 0.85) 0%, rgba(13, 55, 143, 0.50) 20%, rgba(12, 40, 110, 0.22) 40%, rgba(12, 33, 82, 0.06) 58%, rgba(0, 0, 0, 0) 70%), #000000",
          /* Same outline + downward-biased outer halo as the Pro
             card. The halo radiates from below the toast, picking up
             where the toast itself ends — the same visual rhythm the
             pricing page uses. */
          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,0.14), 0 40px 80px 0 rgba(28, 95, 200, 0.18), 0 80px 160px 10px rgba(13, 55, 143, 0.10)",
        }}
      >
        <div className="relative p-6 sm:p-7">
          {/* "Recommended" pill — top-right, but inset enough that
              it doesn't hug the close button or the card edge. */}
          <span className="absolute right-12 top-5 inline-flex items-center gap-1.5 rounded-full bg-[#4397f8]/15 px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#7fb6ff]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#4397f8] shadow-[0_0_8px_1px_rgba(67,151,248,0.7)]" />
            {fr ? "Recommandé" : "Recommended"}
          </span>
          <button
            type="button"
            onClick={close}
            aria-label={fr ? "Fermer" : "Close"}
            className="absolute right-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-full text-white/45 transition-colors duration-150 hover:bg-white/[0.08] hover:text-white"
          >
            <svg
              viewBox="0 0 16 16"
              className="h-3 w-3 fill-none stroke-current stroke-[1.5]"
              strokeLinecap="round"
            >
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>

          <h3 className="mt-2 text-2xl font-light leading-none text-white">
            Pro
          </h3>
          <p className="mt-3 text-[13.5px] font-medium leading-snug text-white/65">
            {fr ? "Va plus loin avec Pro" : "Go further with Pro"}
          </p>
          <p className="mt-2 text-[13px] leading-snug text-white/45">
            {fr
              ? "Envois et tracking illimités, ventes à 5%, Wavematch."
              : "Unlimited sends, full tracking, 5% sales fee, Wavematch."}
          </p>

          <div className="mt-5 flex items-baseline gap-1.5">
            <span className="text-[2rem] font-light leading-none text-white tabular-nums">
              €8.99
            </span>
            <span className="text-[14px] font-medium text-white/45">
              {fr ? "par mois" : "per month"}
            </span>
          </div>

          <Link
            href="https://vvault.app/signup?plan=pro"
            onClick={close}
            className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-[#4397f8] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#2c75d4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4397f8]/35"
          >
            {fr ? "Rejoindre Pro" : "Join Pro now"}
          </Link>
        </div>
      </div>
    </div>
  );
}
