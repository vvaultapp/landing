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
 * Cookie consent banner. Renders only when the user hasn't yet decided
 * (no `vvault-cookie-consent` entry in localStorage). Once the user
 * accepts or rejects, the choice is persisted and the banner removes
 * itself — including on every subsequent visit, until storage is
 * cleared.
 *
 * SSR-safe: the banner is rendered as `null` on the first paint and
 * only conditionally mounted after we've read localStorage on the
 * client, so production HTML stays clean and there's no flash of the
 * banner before the decision can be read.
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
      {/* Dim backdrop covering the rest of the page so the banner reads
          as the focal element. Heavily opaque (85% black) — the rest of
          the page is clearly dimmed, the banner is the only thing the
          eye lands on. pointer-events-none keeps it from blocking
          interaction with the banner buttons; the page is fully bright
          and interactive again the moment the user picks. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[55] bg-black/85"
      />
      <div
        role="dialog"
        aria-modal="false"
        aria-label={fr ? "Préférences cookies" : "Cookie preferences"}
        className="fixed bottom-4 left-4 right-4 z-[60] sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-[420px]"
      >
        <div
          className="relative overflow-hidden rounded-2xl px-5 py-4 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.65)] sm:px-6 sm:py-5"
          style={{
            background: "#1c1c20",
          }}
        >
        <h2 className="text-[14px] font-semibold text-white sm:text-[15px]">
          {fr ? "Cookies" : "Cookies"}
        </h2>
        <p className="mt-2 text-[12.5px] leading-relaxed text-white/60 sm:text-[13px]">
          {fr ? (
            <>
              On utilise des cookies pour comprendre comment vvault est utilisé.
              Aucun n&apos;est nécessaire au fonctionnement du site.{" "}
              <Link
                href="/privacy"
                className="text-white/85 underline underline-offset-2 transition-colors hover:text-white"
              >
                En savoir plus
              </Link>
              .
            </>
          ) : (
            <>
              We use cookies to understand how vvault is used. None of them are
              required for the site to work.{" "}
              <Link
                href="/privacy"
                className="text-white/85 underline underline-offset-2 transition-colors hover:text-white"
              >
                Learn more
              </Link>
              .
            </>
          )}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => choose("reject")}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-white/[0.10] bg-transparent px-5 py-2 text-[13px] font-semibold text-white/80 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 sm:flex-none sm:px-6"
          >
            {fr ? "Refuser" : "Reject"}
          </button>
          <button
            type="button"
            onClick={() => choose("accept")}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-white px-5 py-2 text-[13px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:flex-none sm:px-6"
          >
            {fr ? "Accepter" : "Accept"}
          </button>
        </div>
        </div>
      </div>
    </>
  );
}
