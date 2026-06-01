"use client";

import { useMemo } from "react";
import type { Locale } from "@/components/landing/content";
import type { LandingStatsResponse } from "@/components/landing/HeroSection";

/* Live KPI strip used by the legacy landing (components/landing/LandingPage).
   Kept out of HeroSection.tsx so the current homepage (which never renders it)
   doesn't bundle these big inline SVGs + the strip markup. The stats type is
   imported type-only, so there's no runtime coupling back to HeroSection. */

function StatCardIcon({ statKey }: { statKey: string }) {
  const iconClass = "h-full w-full";
  const gradId = `icon-grad-${statKey}`;

  const grad = (
    <defs>
      <linearGradient id={gradId} x1="0.5" y1="0" x2="0.5" y2="1">
        <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
        <stop offset="40%" stopColor="rgba(200,205,215,0.32)" />
        <stop offset="70%" stopColor="rgba(160,165,180,0.22)" />
        <stop offset="100%" stopColor="rgba(140,145,160,0.18)" />
      </linearGradient>
    </defs>
  );

  if (statKey === "emails") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className={iconClass}>
        {grad}
        <path fill={`url(#${gradId})`} d="M0 4a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2H2a2 2 0 0 1 -2 -2zm2 -1a1 1 0 0 0 -1 1v0.217l7 4.2 7 -4.2V4a1 1 0 0 0 -1 -1zm13 2.383 -4.708 2.825L15 11.105zm-0.034 6.876 -5.64 -3.471L8 9.583l-1.326 -0.795 -5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 0.966 -0.741M1 11.105l4.708 -2.897L1 5.383z" />
      </svg>
    );
  }
  if (statKey === "tracks") {
    const maskId = `mask-${statKey}`;
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className={iconClass}>
        <defs>
          <linearGradient id={gradId} x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
            <stop offset="40%" stopColor="rgba(200,205,215,0.32)" />
            <stop offset="70%" stopColor="rgba(160,165,180,0.22)" />
            <stop offset="100%" stopColor="rgba(140,145,160,0.18)" />
          </linearGradient>
          <mask id={maskId}>
            <path fill="white" d="M6 13c0 1.105 -1.12 2 -2.5 2S1 14.105 1 13s1.12 -2 2.5 -2 2.5 0.896 2.5 2m9 -2c0 1.105 -1.12 2 -2.5 2s-2.5 -0.895 -2.5 -2 1.12 -2 2.5 -2 2.5 0.895 2.5 2" />
            <path fill="white" fillRule="evenodd" d="M14 11V2h1v9zM6 3v10H5V3z" />
            <path fill="white" d="M5 2.905a1 1 0 0 1 0.9 -0.995l8 -0.8a1 1 0 0 1 1.1 0.995V3L5 4z" />
          </mask>
        </defs>
        <rect x="0" y="0" width="16" height="16" fill={`url(#${gradId})`} mask={`url(#${maskId})`} />
      </svg>
    );
  }
  if (statKey === "money") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className={iconClass}>
        {grad}
        <path fill={`url(#${gradId})`} d="M4 10.781c0.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27 -0.179 3.678 -1.438 3.678 -3.3 0 -1.59 -0.947 -2.51 -2.956 -3.028l-0.722 -0.187V3.467c1.122 0.11 1.879 0.714 2.07 1.616h1.47c-0.166 -1.6 -1.54 -2.748 -3.54 -2.875V1H7.591v1.233c-1.939 0.23 -3.27 1.472 -3.27 3.156 0 1.454 0.966 2.483 2.661 2.917l0.61 0.162v4.031c-1.149 -0.17 -1.94 -0.8 -2.131 -1.718zm3.391 -3.836c-1.043 -0.263 -1.6 -0.825 -1.6 -1.616 0 -0.944 0.704 -1.641 1.8 -1.828v3.495l-0.2 -0.05zm1.591 1.872c1.287 0.323 1.852 0.859 1.852 1.769 0 1.097 -0.826 1.828 -2.2 1.939V8.73z" />
      </svg>
    );
  }
  if (statKey === "review") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={iconClass}>
        {grad}
        <path fill={`url(#${gradId})`} fillRule="evenodd" d="M10.58 1.87a1.25 1.25 0 1 0 -2.16 1.26l2.133 3.656 -4.354 7.464H2a1.25 1.25 0 1 0 0 2.5h4.884l0.063 0H13a1.25 1.25 0 1 0 0 -2.5H9.093l3.973 -6.811 0.026 -0.044L15.58 3.13a1.25 1.25 0 1 0 -2.16 -1.26L12 4.305 10.58 1.87Zm4.5 7.714 2.72 4.666H22a1.25 1.25 0 1 1 0 2.5h-2.74l1.82 3.12a1.25 1.25 0 1 1 -2.16 1.26l-2.887 -4.95a1.228 1.228 0 0 1 -0.06 -0.104l-3.053 -5.232a1.25 1.25 0 1 1 2.16 -1.26Zm-9 9.832a1.25 1.25 0 0 0 -2.16 -1.26l-1 1.714a1.25 1.25 0 0 0 2.16 1.26l1 -1.714Z" clipRule="evenodd" />
      </svg>
    );
  }
  return null;
}

export function HeroLiveStats({
  locale,
  stats,
}: {
  locale: Locale;
  stats: LandingStatsResponse;
  loaded?: boolean;
}) {
  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US"),
    [locale],
  );
  const moneyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }),
    [locale],
  );

  const items = [
    {
      label: locale === "fr" ? "Emails envoyés" : "Emails sent",
      value: numberFormatter.format(stats.emailsSentTotal),
    },
    {
      label: locale === "fr" ? "Tracks stockés" : "Tracks stored",
      value: numberFormatter.format(stats.tracksTotal),
    },
    {
      label: locale === "fr" ? "Beats vendus" : "Beats sold",
      value: moneyFormatter.format(stats.moneyPaidTotalCents / 100),
    },
    {
      label: locale === "fr" ? "Note App Store" : "App Store rating",
      value: stats.appStoreReviewLabel,
    },
  ];

  return (
    <div className="pt-56 pb-6 sm:pt-56 sm:pb-8 lg:pt-64 lg:pb-10">
      <div className="mx-auto w-full max-w-[1100px] px-5 sm:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {items.map((item, i) => {
            const mobileLeftBorder = i % 2 === 1;
            const mobileTopBorder = i >= 2;
            const desktopLeftBorder = i > 0;
            return (
              <div
                key={item.label}
                className={[
                  "flex flex-col items-center gap-2.5 px-5 py-6 text-center sm:gap-3 sm:px-7 sm:py-8",
                  mobileLeftBorder ? "border-l border-white/[0.08]" : "",
                  mobileTopBorder
                    ? "border-t border-white/[0.08] md:border-t-0"
                    : "",
                  desktopLeftBorder ? "md:border-l md:border-white/[0.08]" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className="text-[12px] font-medium leading-tight text-white/50 sm:text-[12.5px]">
                  {item.label}
                </span>
                <span className="text-[1.85rem] font-light leading-[0.95] tabular-nums text-white sm:text-[2.4rem] lg:text-[2.75rem]">
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { StatCardIcon };
