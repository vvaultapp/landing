"use client";

import { useEffect } from "react";
import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { HeroStatementSection } from "@/components/landing/HeroStatementSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { getLandingContent, type Locale } from "@/components/landing/content";

type LandingPageProps = {
  locale?: Locale;
};

export function LandingPage({ locale = "en" }: LandingPageProps) {
  const content = getLandingContent(locale);

  useEffect(() => {
    document.title =
      locale === "fr"
        ? "vvault | La bonne façon d'envoyer ta musique"
        : "vvault | The proper way to send your music";
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <div className="landing-root min-h-screen bg-[#0e0e0e] font-sans text-[#f0f0f0]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-[#0e0e0e]"
      >
        {content.skipToContentLabel}
      </a>
      <LandingNav locale={locale} content={content} />
      <main id="main-content">
        <HeroSection content={content} />
        <HeroStatementSection content={content} />
        <HowItWorksSection content={content} />
        <PricingSection content={content} />
        <FinalCtaSection content={content} />
      </main>
      <LandingFooter locale={locale} content={content} />
    </div>
  );
}
