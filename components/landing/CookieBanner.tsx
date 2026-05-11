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
 * Visual: white card, light heading, two stacked pill buttons —
 * primary "Accept all" (dark) and secondary "Reject non-essential
 * cookies" (outlined). Slightly rounded corners (20px).
 *
 * Behavior on appearance:
 *   - Banner fades in + glides up 20px over ~420ms.
 *   - A dim backdrop fades in alongside it on every viewport
 *     (mobile AND desktop), and blocks pointer events for everything
 *     behind it — nothing on the page is clickable or hoverable
 *     until the visitor picks a choice.
 *
 * Placement:
 *   - Desktop (sm+): floats near the bottom-right of the viewport
 *     (`bottom-6 right-6`, max-width 400px), nicely rounded card.
 *   - Mobile (<sm): floats at the bottom, horizontally centered with
 *     small side margins so it has clear breathing room from the
 *     screen edges (not edge-to-edge anymore — the user wanted it
 *     centered). All four corners rounded.
 *
 * SSR-safe: renders null on the first paint and only mounts after
 * we've read localStorage on the client.
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
    <>
      {/* Dim backdrop — covers the entire viewport, fades in smoothly,
          and blocks pointer events for everything behind it. Sits at
          z-55 just below the banner (z-60). pointer-events-auto means
          clicks land here (and do nothing) instead of falling through
          to the page beneath — exactly what we want while the visitor
          is deciding. */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[55] bg-black/55 animate-[cookieBackdropIn_500ms_ease-out_both]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={fr ? "Préférences cookies" : "Cookie preferences"}
        className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-[440px] animate-[cookieBannerIn_420ms_cubic-bezier(0.16,1,0.3,1)_both] sm:inset-x-auto sm:left-auto sm:bottom-6 sm:right-6 sm:max-w-[400px]"
      >
        <div className="relative rounded-[20px] bg-white text-[#0e0e0e] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.45)]">
          <div className="px-6 pb-6 pt-6 sm:px-7 sm:pt-7 sm:pb-7">
            <h2 className="text-[22px] font-medium leading-tight tracking-tight sm:text-[24px]">
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
    </>
  );
}
