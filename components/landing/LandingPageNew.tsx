"use client";

import { useEffect } from "react";
import { LandingNav } from "@/components/landing/LandingNav";
import {
  HeroSection,
  HeroLiveStats,
  useLandingStats,
} from "@/components/landing/HeroSection";
import { ProblemGapSection } from "@/components/landing/ProblemGapSection";
import { ToolsGallerySection } from "@/components/landing/ToolsGallerySection";
import { WorkflowSection } from "@/components/landing/WorkflowSection";
import { HeroStatementSection } from "@/components/landing/HeroStatementSection";
import PricingPage from "@/app/pricing/Content";
import { FaqSection } from "@/components/landing/FaqSection";
import { ContactSection } from "@/components/landing/ContactSection";
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
  const { stats } = useLandingStats();

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
    /* Same anonymous CNIL-compliant landing-view tracker as the
       legacy home — works for the /new route too. We don't pass a
       variant here because trackLandingView's signature is "get"
       only; differentiation between / and /new is done server-side
       via the URL stored on the analytic row. */
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
        <HeroSection content={content} locale={locale} />
        <ProblemGapSection content={contentNew} />
        <ToolsGallerySection content={contentNew} locale={locale} />
        <WorkflowSection content={contentNew} />
        <HeroStatementSection content={content} locale={locale} />
        <PricingPage locale={locale} embedded />
        <FaqSection content={content} />
        <ContactSection locale={locale} />
        <HeroLiveStats locale={locale} stats={stats} />
        <FinalCtaSectionNew content={contentNew} />
      </main>
      <LandingFooter locale={locale} content={content} />
      <CookieConsentBanner />
    </div>
  );
}
