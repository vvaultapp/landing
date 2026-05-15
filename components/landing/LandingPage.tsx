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
    /* Fire the first-party landing-view tracker for every visit. This
       is anonymous internal audience measurement (random anon_id, no
       third-party identifiers — Meta Pixel cookies fbp/fbc are only
       attached if the visitor consented and the pixel actually loaded),
       which qualifies for the CNIL audience-measurement exemption and
       does not require consent.
       Previously this was gated on `consent.analytics`, which meant
       only "Accept all" visitors were counted while signups were
       tracked downstream regardless — that artificially inflated
       LP→Signup CVR by ~2-3x. Third-party trackers (GA4 Consent Mode,
       Meta Pixel) continue to respect the consent state separately via
       `applyConsentToTrackers`. */
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
