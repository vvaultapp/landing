"use client";

import { useEffect } from "react";
import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { HeroStatementSection } from "@/components/landing/HeroStatementSection";
import { CertificateTeaser } from "@/components/landing/CertificateTeaser";
import { FaqSection } from "@/components/landing/FaqSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import CookieConsentBanner from "@/components/legal/CookieConsentBanner";
import { ProPricingToast } from "@/components/landing/ProPricingToast";
import { getLandingContent, type Locale } from "@/components/landing/content";
import { trackLandingView } from "@/lib/analytics/client";
import { readConsent } from "@/lib/consent";

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
    // Persist locale so sub-pages and docs can read it
    try {
      localStorage.setItem("vvault-locale", locale);
      localStorage.setItem("vvault-docs-lang", locale);
    } catch {}
  }, [locale]);

  useEffect(() => {
    /* Cookie consent gate: only fire the landing-view tracker when the
       visitor has explicitly granted analytics consent. The banner
       defaults to "denied" until the user decides, matching the CNIL
       default-deny stance the webapp uses. */
    const consent = readConsent();
    if (!consent.analytics) return;
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
        <SocialProofSection locale={locale} />
        <FeatureShowcase locale={locale} />
        <HeroStatementSection content={content} locale={locale} />
        <CertificateTeaser locale={locale} />
        <FaqSection content={content} />
        <ContactSection locale={locale} />
        <FinalCtaSection content={content} />
      </main>
      <LandingFooter locale={locale} content={content} />
      {/* Cookie consent banner — exact same component as the webapp
          uses on /signup. localStorage state lives under
          `vvault:consent.v1`, and we also write a cross-subdomain
          cookie at `.vvault.app` so a decision made here is read on
          `vvault.app/signup` without re-prompting. */}
      <CookieConsentBanner />
      {/* Pro plan promo toast — fires every time the CertificateTeaser
          section enters the viewport. No storage flag, so a refresh
          re-arms it. Shown to every visitor (production + localhost)
          per spec. */}
      <ProPricingToast locale={locale} />
    </div>
  );
}
