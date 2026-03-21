"use client";

import { useEffect, useMemo, useState } from "react";
import type { LandingContent, Locale } from "@/components/landing/content";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";

type LandingStatsResponse = {
  emailsSentTotal: number;
  usersTotal: number;
  tracksTotal: number;
  moneyPaidTotalCents: number;
  appStoreReviewLabel: string;
};

const LANDING_STATS_FALLBACK: LandingStatsResponse = {
  emailsSentTotal: 0,
  usersTotal: 0,
  tracksTotal: 0,
  moneyPaidTotalCents: 0,
  appStoreReviewLabel: "4.9/5",
};

function toPositiveNumber(value: unknown, fallback = 0): number {
  const next = Number(value);
  if (!Number.isFinite(next) || next < 0) return fallback;
  return Math.floor(next);
}

function HeroLiveStats({ locale }: { locale: Locale }) {
  const [stats, setStats] = useState<LandingStatsResponse>(LANDING_STATS_FALLBACK);
  const [loaded, setLoaded] = useState(false);

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

  useEffect(() => {
    let active = true;

    const loadStats = async () => {
      try {
        const res = await fetch("/api/landing-stats", { cache: "no-store" });
        if (!res.ok) return;

        const payload = (await res.json()) as Partial<LandingStatsResponse>;
        if (!active) return;

        setStats({
          emailsSentTotal: toPositiveNumber(payload.emailsSentTotal, LANDING_STATS_FALLBACK.emailsSentTotal),
          usersTotal: toPositiveNumber(payload.usersTotal, LANDING_STATS_FALLBACK.usersTotal),
          tracksTotal: toPositiveNumber(payload.tracksTotal, LANDING_STATS_FALLBACK.tracksTotal),
          moneyPaidTotalCents: toPositiveNumber(
            payload.moneyPaidTotalCents,
            LANDING_STATS_FALLBACK.moneyPaidTotalCents,
          ),
          appStoreReviewLabel:
            typeof payload.appStoreReviewLabel === "string" && payload.appStoreReviewLabel.trim()
              ? payload.appStoreReviewLabel.trim()
              : LANDING_STATS_FALLBACK.appStoreReviewLabel,
        });
      } catch {
        // Keep fallback values when stats API is unavailable.
      } finally {
        if (active) setLoaded(true);
      }
    };

    void loadStats();

    return () => {
      active = false;
    };
  }, []);

  const statCards = [
    {
      key: "emails",
      label: locale === "fr" ? "Emails envoyés" : "Emails sent",
      value: numberFormatter.format(stats.emailsSentTotal),
    },
    {
      key: "users",
      label: locale === "fr" ? "Users" : "Users",
      value: numberFormatter.format(stats.usersTotal),
    },
    {
      key: "tracks",
      label: locale === "fr" ? "Tracks" : "Tracks",
      value: numberFormatter.format(stats.tracksTotal),
    },
    {
      key: "money",
      label: locale === "fr" ? "Total payé" : "Money paid",
      value: moneyFormatter.format(stats.moneyPaidTotalCents / 100),
    },
    {
      key: "reviews",
      label: locale === "fr" ? "Avis App Store" : "App Store review",
      value: stats.appStoreReviewLabel,
    },
  ];

  return (
    <div className="hero-seq-item mt-5 sm:pl-4 lg:pl-8" style={{ animationDelay: "1480ms" }}>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
        {statCards.map((card) => (
          <div
            key={card.key}
            className="relative overflow-hidden rounded-2xl border border-white/14 bg-[linear-gradient(125deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.04)_42%,rgba(242,184,74,0.22)_100%)] px-3 py-3 shadow-[0_1px_0_rgba(255,255,255,0.1)_inset,0_16px_30px_-24px_rgba(0,0,0,0.9)] backdrop-blur-sm sm:px-4"
          >
            <span className="block text-[10px] uppercase tracking-[0.16em] text-white/60">{card.label}</span>
            <span className={`mt-1 block text-base font-semibold text-white sm:text-lg${loaded ? "" : " animate-pulse text-white/65"}`}>
              {loaded ? card.value : "..."}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroAppMock({ content }: { content: LandingContent }) {
  return (
    <div className="relative mt-14 sm:mt-16">
      <div
        className="pointer-events-none absolute left-[calc(50%-50vw)] top-[-142px] bottom-[-104px] z-0 w-screen overflow-hidden hero-seq-item"
        style={{ animationDelay: "760ms" }}
      >
        <div className="h-full w-full rounded-b-[18px] bg-[linear-gradient(to_bottom,rgba(160,169,179,0)_0%,rgba(160,169,179,0.012)_16%,rgba(159,168,178,0.05)_33%,rgba(157,166,176,0.14)_52%,rgba(153,162,172,0.27)_72%,rgba(149,159,169,0.40)_88%,rgba(145,155,166,0.50)_100%)]" />
      </div>
      <div
        className="pointer-events-none absolute left-[calc(50%-50vw)] bottom-[-34px] z-[1] w-screen hero-seq-item"
        style={{ animationDelay: "760ms" }}
      >
        <div className="mx-auto h-[clamp(72px,9vw,132px)] w-[clamp(360px,44vw,840px)] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.08)_42%,rgba(255,255,255,0)_78%)] blur-[10px]" />
      </div>

      <div className="absolute inset-x-0 top-[112%] z-20 flex justify-center sm:top-[116%] lg:top-[100%]">
        <div className="flex items-center gap-4">
          <LandingCtaLink
            loggedInHref="https://vvault.app/signup"
            loggedOutHref="https://vvault.app/signup"
            className="hero-seq-item inline-flex items-center rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 sm:px-5 sm:py-2.5"
            style={{ animationDelay: "980ms" }}
          >
            {content.hero.primaryCtaLabel}
          </LandingCtaLink>
          <span className="hero-seq-item hidden text-sm font-medium text-white/82 lg:inline" style={{ animationDelay: "1040ms" }}>
            {content.hero.primaryCtaHint}
          </span>
        </div>
      </div>

      <div
        className="relative z-10 -ml-[18px] w-[calc(100%+36px)] sm:-ml-[32px] sm:w-[calc(100%+64px)] lg:-ml-[72px] lg:w-[calc(100%+144px)] hero-seq-item"
        style={{ animationDelay: "1080ms" }}
      >
        <img
          src="/app%20show-off.png"
          alt="vvault app interface"
          className="block h-auto w-full max-w-none select-none"
          loading="eager"
          decoding="async"
          draggable={false}
          onDragStart={(event) => event.preventDefault()}
        />
      </div>
    </div>
  );
}

type HeroSectionProps = {
  content: LandingContent;
  locale?: Locale;
  showOnyxUploader?: boolean;
};

export function HeroSection({ content, locale = "en", showOnyxUploader = true }: HeroSectionProps) {
  const secondaryTitle = content.hero.title[1]?.trim();

  return (
    <section className="pb-20 pt-44 sm:pb-28 sm:pt-52 lg:pb-36 lg:pt-58">
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <div className="max-w-[1280px] sm:pl-4 lg:pl-8">
          <h1 className="font-display text-[2.35rem] font-normal leading-[0.98] tracking-tight text-white sm:text-[3.35rem] lg:text-[4rem]">
            <span className="hero-line-reveal" style={{ animationDelay: "80ms" }}>
              {content.hero.title[0]}
            </span>
            {secondaryTitle ? (
              <span className="hero-line-reveal" style={{ animationDelay: "280ms" }}>
                {secondaryTitle}
              </span>
            ) : null}
          </h1>

          <div className="mt-7 flex items-end justify-between gap-6">
            <p className="max-w-[980px] text-sm leading-6 text-white/30 sm:text-base sm:leading-7">
              <span className="hero-line-reveal sm:whitespace-nowrap" style={{ animationDelay: "500ms" }}>
                {content.hero.description}
              </span>
            </p>

            {showOnyxUploader ? (
              <LandingCtaLink
                loggedInHref="https://onyx.vvault.app"
                loggedOutHref="https://onyx.vvault.app"
                className="hero-seq-item hero-seq-item-late group hidden shrink-0 items-center gap-2 text-base lg:inline-flex"
                style={{ animationDelay: "1760ms" }}
              >
                <span className="font-semibold text-white">{content.hero.newBadge}</span>
                <span className="text-white/42"> {content.hero.onyxLabel}</span>
                <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current text-white/42 stroke-[1.8] transition-transform duration-300 ease-out group-hover:translate-x-1">
                  <path d="M4 10h11M11 6l4 4-4 4" />
                </svg>
              </LandingCtaLink>
            ) : null}
          </div>
        </div>

        <div
          className="hero-seq-item mt-5 flex items-center gap-2 sm:pl-4 lg:pl-8"
          style={{ animationDelay: "1360ms" }}
        >
          <span className="text-sm tracking-[0.08em] text-[#f2b84a]">★★★★★</span>
          <span className="text-xs font-medium text-white/78 sm:text-sm">{content.hero.ratingLabel}</span>
        </div>

        <HeroLiveStats locale={locale} />

        <HeroAppMock content={content} />
      </div>
    </section>
  );
}
