"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getCookieConsent,
  setCookieConsent,
  type CookieConsentDecision,
} from "@/lib/cookieConsent";

type CookieBannerProps = {
  locale?: "en" | "fr";
};

/**
 * Cookie consent banner.
 *
 * Visual: a white card with stacked Accept / Reject buttons, modeled on
 * the Revolut consent banner — clean, light, easy to scan, with a
 * clear primary (Accept all, dark) and a clear secondary (Reject
 * non-essential, outlined) action.
 *
 * Placement:
 *   - Desktop (sm+): floats near the bottom-right of the viewport as a
 *     compact card. The rest of the page is NOT dimmed — the banner
 *     is unobtrusive and the user can read the page while deciding.
 *   - Mobile (<sm): full-width bottom sheet that stems from the very
 *     bottom edge of the device. `padding-bottom: env(safe-area-inset-
 *     bottom)` extends the white surface into the home-indicator /
 *     Safari-toolbar area so the banner reads as flush with the
 *     screen edge — no thin black strip below.
 *
 * SSR-safe: renders null on the first paint and only mounts after
 * we've read localStorage on the client, so production HTML stays
 * clean and there's no flash of the banner before the stored
 * decision can be read.
 */
export function CookieBanner({ locale = "en" }: CookieBannerProps) {
  const [hydrated, setHydrated] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setHydrated(true);
    if (getCookieConsent() === null) {
      setVisible(true);
    }
  }, []);

  if (!hydrated || !visible) return null;

  const fr = locale === "fr";

  const choose = (decision: CookieConsentDecision) => {
    setCookieConsent(decision);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={fr ? "Préférences cookies" : "Cookie preferences"}
      className="fixed inset-x-0 bottom-0 z-[60] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:max-w-[400px]"
    >
      <div
        className="relative bg-white text-[#0e0e0e] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.35)] rounded-t-[28px] sm:rounded-[28px]"
        style={{
          /* Mobile only: extend the white surface into the safe-area
             so the banner appears flush with the device's bottom edge
             (no black strip behind the Safari toolbar / home indicator). */
          paddingBottom: "max(env(safe-area-inset-bottom), 0px)",
        }}
      >
        <div className="px-6 pb-6 pt-7 sm:px-7 sm:pt-7 sm:pb-7">
          <h2 className="text-[22px] font-bold leading-tight tracking-tight sm:text-[24px]">
            {fr ? "Choisis tes cookies" : "Choose your cookies"}
          </h2>
          <p className="mt-3 text-[14.5px] leading-relaxed text-[#0e0e0e]/70 sm:text-[15px]">
            {fr
              ? "Les cookies nous aident à comprendre comment vvault est utilisé. Aucun n'est nécessaire au fonctionnement du site."
              : "Cookies help us understand how vvault is used. None are required for the site to work."}
          </p>
          <Link
            href="/privacy"
            className="mt-1 inline-block text-[14.5px] font-medium leading-relaxed text-[#0e0e0e] underline underline-offset-[3px] decoration-[#0e0e0e]/40 hover:decoration-[#0e0e0e] sm:text-[15px]"
          >
            {fr ? "En savoir plus" : "Learn more"}
          </Link>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => choose("accept")}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#0e0e0e] px-5 py-3.5 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-[#222] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e0e0e]/40"
            >
              {fr ? "Tout accepter" : "Accept all"}
            </button>
            <button
              type="button"
              onClick={() => choose("reject")}
              className="inline-flex w-full items-center justify-center rounded-full border-[1.5px] border-[#0e0e0e] bg-white px-5 py-3.5 text-[15px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-[#0e0e0e]/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e0e0e]/30"
            >
              {fr ? "Refuser les non essentiels" : "Reject non-essential cookies"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
