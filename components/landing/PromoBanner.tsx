"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Locale } from "@/components/landing/content";
import { useBillingCurrency } from "@/lib/useBillingCurrency";

/* Full-bleed promo strip that sits at the very TOP of the landing page, as a
   SEPARATE band ABOVE the nav bar (not behind it). It is a plain in-flow block
   (NOT fixed/sticky), so it scrolls away with the page; the nav sits just below
   it and slides up to pin at the top as the strip scrolls out — driven by the
   `--promo-h` custom property this component keeps in sync with scroll.

   - Background is a pre-optimised AVIF/WebP gradient (public/promo-banner-*),
     served full-width via a hand-built <picture> srcset. AVIF tops out at ~79KB
     even for 4K displays and is ~2KB on mobile, so it loads effectively
     instantly. The 7000×1400 source PNG is never shipped to the browser.
   - Copy + currency are locale/region aware: "Get Pro at €1" / "$1" /
     "Passe à Pro pour 1 €" / "1 $".
   - A live countdown (days / hours / minutes / seconds) ticks down to the promo
     deadline.
   - The whole strip is a link to /pricing. Hovering anywhere on it underlines
     the price text (instant, no fade). */

/* Layout-effect on the client (set --promo-h before first paint so the nav
   never flashes on top of the strip); plain effect on the server. */
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type PromoBannerProps = {
  locale?: Locale;
};

/* Promo deadline. Starts at ~20 days out — set this to the real campaign end
   date to re-arm the countdown. */
const PROMO_END = new Date("2026-07-14T23:59:59Z").getTime();

/* Static first-paint duration (exactly 20 days) so SSR and the first client
   render agree — avoids a hydration mismatch. The real remaining time replaces
   it one frame after mount. */
const INITIAL_MS = 20 * 24 * 60 * 60 * 1000;

const WIDTHS = [1280, 1920, 2560, 3840];
const srcset = (ext: string) =>
  WIDTHS.map((w) => `/promo-banner-${w}.${ext} ${w}w`).join(", ");

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function Segment({ value, label }: { value: number; label: string }) {
  return (
    <span className="flex items-baseline gap-[2px]">
      <span className="text-[13px] font-bold tabular-nums group-hover:underline sm:text-[17px] lg:text-[19px]">{pad(value)}</span>
      <span className="text-[9px] font-semibold uppercase opacity-75 group-hover:underline sm:text-[10px] lg:text-[11px]">{label}</span>
    </span>
  );
}

export function PromoBanner({ locale = "en" }: PromoBannerProps) {
  const fr = locale === "fr";
  const { currency } = useBillingCurrency();
  const symbol = currency === "usd" ? "$" : "€";
  const priceLabel = fr ? `Passe à Pro pour 1 ${symbol}` : `Get Pro at ${symbol}1`;
  const endsInLabel = fr ? "se termine dans" : "ends in";

  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  /* The strip is position:fixed (see render) so it can't rubber-band away from
     the equally-fixed nav during iOS overscroll — that divergence is what made
     the nav slide over the banner. To still "scroll away", we translate it up
     in lockstep with the in-flow spacer that reserves its place, and publish
     `--promo-h` (its remaining visible height) so the nav sits right under it
     and rises with it, pinning at the top once it's gone. Cleaned up on unmount
     so other routes (no strip) keep `--promo-h` unset → nav pinned as normal. */
  const rootRef = useRef<HTMLAnchorElement>(null);
  useIsoLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const docEl = document.documentElement;
    let height = el.offsetHeight;
    const apply = () => {
      // Clamp to [0, height] so overscroll (scrollY < 0, or > content) can't
      // push past the strip — keeps everything rock-steady on the bounce.
      const scrolled = Math.min(height, Math.max(0, window.scrollY));
      docEl.style.setProperty("--promo-h", `${height - scrolled}px`);
      el.style.transform = scrolled > 0 ? `translate3d(0, ${-scrolled}px, 0)` : "";
    };
    apply();
    window.addEventListener("scroll", apply, { passive: true });
    // ResizeObserver keeps `height` exact across breakpoints, font swaps and
    // content reflow (more reliable than a window resize listener).
    const ro = new ResizeObserver(() => {
      height = el.offsetHeight;
      apply();
    });
    ro.observe(el);
    return () => {
      window.removeEventListener("scroll", apply);
      ro.disconnect();
      docEl.style.removeProperty("--promo-h");
    };
  }, []);

  const remaining = now === null ? INITIAL_MS : Math.max(0, PROMO_END - now);
  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const units = [
    { value: days, label: fr ? "j" : "d" },
    { value: hours, label: "h" },
    { value: minutes, label: "m" },
    { value: seconds, label: "s" },
  ];

  return (
    <>
    {/* In-flow spacer reserving the fixed strip's height (same responsive
        heights), so page content starts below it and it scrolls away with the
        page. */}
    <div aria-hidden className="min-h-[62px] lg:min-h-[68px]" />
    <a
      ref={rootRef}
      href="/pricing"
      data-track-id="promo-banner.pricing"
      aria-label={`${priceLabel} — ${endsInLabel} ${days}${fr ? "j" : "d"} ${hours}h ${minutes}m ${seconds}s`}
      className="group fixed inset-x-0 top-0 z-40 block overflow-hidden focus-visible:outline-none"
    >
      {/* Optimised gradient background — decorative, so aria-hidden. */}
      <picture>
        <source type="image/avif" srcSet={srcset("avif")} sizes="100vw" />
        <source type="image/webp" srcSet={srcset("webp")} sizes="100vw" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/promo-banner-1920.webp"
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>

      {/* Content — a short, self-contained strip (no nav clearance; the nav now
          sits below it). Single centred row at every width. */}
      <div className="relative flex min-h-[62px] items-center justify-center px-4 py-2 sm:px-5 lg:min-h-[68px]">
        <div className="flex flex-row items-center justify-center gap-2 whitespace-nowrap text-white underline-offset-[3px] [text-shadow:0_2px_18px_rgba(7,16,60,0.35)] sm:gap-5">
          <span className="text-[14px] font-semibold tracking-tight group-hover:underline sm:text-[19px] lg:text-[21px]">
            {priceLabel}
          </span>

          <span className="h-4 w-px bg-white/35 sm:h-7" />

          <span className="flex items-center gap-2 sm:gap-3">
            <span className="hidden text-[11px] font-medium uppercase tracking-wide opacity-80 group-hover:underline sm:inline sm:text-[12px]">
              {endsInLabel}
            </span>
            <span className="flex items-center gap-1 sm:gap-2">
              {units.map((u, i) => (
                <span key={u.label} className="flex items-center gap-1 sm:gap-2">
                  {i > 0 && <span className="text-[12px] opacity-45 group-hover:underline sm:text-[15px]">:</span>}
                  <Segment value={u.value} label={u.label} />
                </span>
              ))}
            </span>
          </span>
        </div>
      </div>
    </a>
    </>
  );
}
