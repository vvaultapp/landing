"use client";

import { useEffect } from "react";
import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureSection } from "@/components/landing/MinimalSections";
import PricingPage from "@/app/pricing/Content";
import { FinalCtaSectionNew } from "@/components/landing/FinalCtaSectionNew";
import { LandingFooter } from "@/components/landing/LandingFooter";
import CookieConsentBanner from "@/components/legal/CookieConsentBanner";
import { getLandingContent, type Locale } from "@/components/landing/content";
import { getLandingNewContent } from "@/components/landing/contentNew";
import { trackLandingView } from "@/lib/analytics/client";

type LandingPageNewProps = {
  locale?: Locale;
};

export function LandingPageNew({ locale = "en" }: LandingPageNewProps) {
  const content = getLandingContent(locale);
  const contentNew = getLandingNewContent(locale);

  useEffect(() => {
    document.title =
      locale === "fr"
        ? "vvault | Le workspace musical pour producteurs"
        : "vvault | The music workspace for producers";
    document.documentElement.lang = locale;
    try {
      localStorage.setItem("vvault-locale", locale);
      localStorage.setItem("vvault-docs-lang", locale);
    } catch {}
  }, [locale]);

  useEffect(() => {
    void trackLandingView("get");
  }, []);

  return (
    <div className="landing-root min-h-screen bg-black font-sans text-[#f0f0f0]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-[#0e0e0e]"
      >
        {content.skipToContentLabel}
      </a>
      <LandingNav locale={locale} content={content} showPrimaryLinks={true} />
      <main id="main-content" className="pb-20 sm:pb-0">
        {/* 1 — Hero (headline + signup + product video slot) */}
        <HeroSection content={content} locale={locale} />
        {/* 2 — Features (a headline, then a pair of media — repeated) */}
        <FeatureSection locale={locale} />
        {/* 7 — Wins wall + 8 — Pricing (Wins renders inside pricing) */}
        <PricingPage locale={locale} embedded />
        {/* 9 — Final CTA */}
        <FinalCtaSectionNew content={contentNew} />
      </main>
      {/* 10 — Footer */}
      <LandingFooter locale={locale} content={content} />
      <CookieConsentBanner />
    </div>
  );
}
