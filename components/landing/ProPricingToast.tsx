"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { trackButtonClick } from "@/lib/analytics/client";
import { formatPrice } from "@/lib/formatPrice";

type ProPricingToastProps = {
  locale?: "en" | "fr";
};

/**
 * Scroll-triggered Pro plan promo toast.
 *
 * Trigger: an IntersectionObserver watches `#certificate-teaser`. The
 * toast slides in at the bottom-right of the page the moment any pixel
 * of that section enters the viewport.
 *
 * Re-appearance guarantee: there is NO storage flag of any kind. Every
 * fresh page load starts with `shown: false` and `closedByUser: false`;
 * scrolling the CertificateTeaser section back into view fires the
 * observer and the toast comes back. The X button hides the toast for
 * the CURRENT page view only (via local React state) — refresh and the
 * toast is eligible to appear again immediately. This is intentional
 * per spec ("REALLY appears every time the user gets to that section").
 *
 * Refresh behavior: browsers restore scroll position on reload, so the
 * section may already be in view at mount. We don't want the toast to
 * pop in immediately in that case — it should only show when the user
 * actively scrolls into the section. We track an `armed` flag that
 * flips true only after the section has been observed OUT of viewport
 * at least once, and only fire the toast on intersections after that.
 *
 * Pricing: shows the MONTHLY price (€8.99) — the same number the
 * pricing-page Pro card shows when the annual/monthly toggle is off.
 *
 * CTA: links to `https://vvault.app/signup?plan=pro`, the same
 * destination as the pricing-page "Join Pro now" button for a
 * logged-out visitor.
 */
export function ProPricingToast({ locale = "en" }: ProPricingToastProps) {
  const [shown, setShown] = useState(false);
  const [closedByUser, setClosedByUser] = useState(false);

  useEffect(() => {
    const target = document.getElementById("certificate-teaser");
    if (!target) return;
    // armed = the section has been observed out of viewport at least
    // once since mount. Only after that do we treat a subsequent
    // intersection as a real scroll-in event. This keeps the toast
    // from popping up on refresh when the browser restores scroll to
    // a position where the section is already visible.
    let armed = false;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            armed = true;
          } else if (armed) {
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
    setClosedByUser(true);
  }

  return (
    <>
      {/* Mobile-only dark floor beneath the toast. Solid black slab
          sized to cover the toast's full height plus the space below
          it, so the visual wraps cleanly to the viewport bottom and no
          page content shows beside or below the card. Hidden on sm+
          where the desktop layout doesn't need it. */}
      <div
        aria-hidden="true"
        className="pro-toast-floor pointer-events-none fixed inset-x-0 bottom-0 z-[59] h-[380px] animate-[proToastIn_360ms_cubic-bezier(0.22,1,0.36,1)_both] sm:hidden"
      />
      <div
        role="dialog"
        aria-label={fr ? "Promotion Pro" : "Pro plan promo"}
        className="fixed bottom-4 right-4 z-[60] w-[calc(100%-2rem)] max-w-[380px] animate-[proToastIn_360ms_cubic-bezier(0.22,1,0.36,1)_both] sm:bottom-6 sm:right-6"
      >
      <div
        /* `pro-toast-shadow` is defined in globals.css. Identical halo
           on mobile and desktop; mobile clipping is masked by the
           `.pro-toast-floor` strip rendered above. */
        className="pro-toast-shadow relative overflow-hidden rounded-2xl"
        style={{
          /* Identical to the pricing-page Pro card: navy gradient
             from #0d378f at the bottom fading up to transparent at
             ~70% so the upper portion sits on clean black, over a
             #000000 base. */
          background:
            "linear-gradient(to top, rgba(13, 55, 143, 0.85) 0%, rgba(13, 55, 143, 0.50) 20%, rgba(12, 40, 110, 0.22) 40%, rgba(12, 33, 82, 0.06) 58%, rgba(0, 0, 0, 0) 70%), #000000",
        }}
      >
        <div className="relative p-6 sm:p-7">
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

          {/* "Recommended" sits inline to the right of "Pro", minimal
              styling: small, sentence-case, no pill / no glow / no
              uppercase tracking — just a quiet brand-blue label. */}
          <div className="flex items-baseline gap-2.5">
            <h3 className="text-2xl font-light leading-none text-white">
              Pro
            </h3>
            <span className="text-[12px] font-medium leading-none text-[#7fb6ff]">
              {fr ? "Recommandé" : "Recommended"}
            </span>
          </div>
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
              {formatPrice("1", locale)}
            </span>
            <span className="text-[14px] font-medium text-white/45">
              {fr ? "le premier mois" : "first month"}
            </span>
          </div>
          <p className="mt-1 text-[11.5px] text-white/35">
            {fr
              ? `puis ${formatPrice("8.99", locale)} par mois`
              : `then ${formatPrice("8.99", locale)} per month`}
          </p>

          <Link
            href="https://vvault.app/signup?plan=pro"
            onClick={() => {
              trackButtonClick({
                buttonId: "toast.join_pro",
                surface: "landing.pro_toast",
                locale,
                planId: "pro",
                href: "https://vvault.app/signup?plan=pro",
              });
              close();
            }}
            className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-[#4397f8] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#2c75d4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4397f8]/35"
          >
            {fr ? "Rejoindre Pro" : "Join Pro now"}
          </Link>
        </div>
      </div>
      </div>
    </>
  );
}
