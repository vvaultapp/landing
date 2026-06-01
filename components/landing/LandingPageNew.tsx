"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureSection } from "@/components/landing/MinimalSections";
import CookieConsentBanner from "@/components/legal/CookieConsentBanner";
import { getLandingContent, type Locale } from "@/components/landing/content";
import { getLandingNewContent } from "@/components/landing/contentNew";
import { trackLandingView } from "@/lib/analytics/client";

/* Below-the-fold sections are code-split and loaded after the hero hydrates,
   so the homepage's critical first-load JS stays small (just the hero + nav).
   The embedded pricing page especially is heavy (plans + Trustpilot + Wins
   wall). Min-height placeholders reserve space so there's no layout jump.
   Hero + features remain server-rendered for SEO and LCP. */
const PricingPage = dynamic(() => import("@/app/pricing/Content"), {
  ssr: false,
  loading: () => <div className="min-h-[1200px]" aria-hidden="true" />,
});
const FinalCtaSectionNew = dynamic(
  () =>
    import("@/components/landing/FinalCtaSectionNew").then(
      (m) => m.FinalCtaSectionNew,
    ),
  { ssr: false, loading: () => <div className="min-h-[420px]" aria-hidden="true" /> },
);
const LandingFooter = dynamic(
  () =>
    import("@/components/landing/LandingFooter").then((m) => m.LandingFooter),
  { ssr: false, loading: () => <div className="min-h-[280px]" aria-hidden="true" /> },
);

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
