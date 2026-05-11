"use client";

import { useEffect, useState } from "react";
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
import { CookieBanner } from "@/components/landing/CookieBanner";
import { ProPricingToast } from "@/components/landing/ProPricingToast";
import { getLandingContent, type Locale } from "@/components/landing/content";
import { trackLandingView } from "@/lib/analytics/client";
import { hasRejectedCookies } from "@/lib/cookieConsent";
import { useIsLocalhost } from "@/lib/useIsLocalhost";
import {
  getLandingTheme,
  LANDING_THEME_EVENT,
  type LandingTheme,
} from "@/lib/theme";

type LandingPageProps = {
  locale?: Locale;
};

export function LandingPage({ locale = "en" }: LandingPageProps) {
  const content = getLandingContent(locale);
  const isLocalhost = useIsLocalhost();
  /* Landing-page theme. Persisted in localStorage via `lib/theme.ts`
     and applied as the `landing-light` class on `.landing-root` (see
     globals.css). The footer's Light/Dark toggle calls `setLandingTheme`
     which dispatches `vvault-theme-change`; the listener below picks
     it up so the page re-renders with the new class in lockstep with
     the click. Defaults to "dark" (SSR-safe). */
  const [theme, setTheme] = useState<LandingTheme>("dark");

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
    /* Cookie consent gate: skip the analytics call when the visitor
       has explicitly rejected non-essential cookies. Production users
       never see the banner yet (it's localhost-only), so `getCookieConsent`
       returns null there and `hasRejectedCookies()` is false → tracking
       runs as before, no change in production behavior. */
    if (hasRejectedCookies()) return;
    void trackLandingView("get");
  }, []);

  /* Sync theme state with localStorage. Reads the saved value on
     mount, then listens for `vvault-theme-change` so any in-page
     toggle (the footer button) re-renders LandingPage with the new
     class. SSR-safe — initial state is "dark", which matches what
     production users see when localStorage is empty. */
  useEffect(() => {
    setTheme(getLandingTheme());
    function onThemeChange(e: Event) {
      const detail = (e as CustomEvent<LandingTheme>).detail;
      if (detail === "light" || detail === "dark") setTheme(detail);
    }
    window.addEventListener(LANDING_THEME_EVENT, onThemeChange);
    return () => window.removeEventListener(LANDING_THEME_EVENT, onThemeChange);
  }, []);

  return (
    <div
      className={`landing-root min-h-screen bg-black font-sans text-[#f0f0f0] ${
        theme === "light" ? "landing-light" : ""
      }`}
    >
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
      {/* Cookie banner — currently localhost-only while we test the
          consent flow. Once verified we'll flip the gate so it shows
          for every visitor before we land any new tracking that
          requires explicit opt-in. */}
      {isLocalhost && <CookieBanner locale={locale} />}
      {/* Pro plan promo toast — triggered when the CertificateTeaser
          section enters the viewport. Localhost only while we tune
          copy and frequency. */}
      {isLocalhost && <ProPricingToast locale={locale} />}
    </div>
  );
}
