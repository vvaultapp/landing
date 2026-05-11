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
import { getLandingContent, type Locale } from "@/components/landing/content";
import { trackLandingView } from "@/lib/analytics/client";
import { hasRejectedCookies } from "@/lib/cookieConsent";
import { useIsLocalhost } from "@/lib/useIsLocalhost";

type LandingPageProps = {
  locale?: Locale;
};

export function LandingPage({ locale = "en" }: LandingPageProps) {
  const content = getLandingContent(locale);
  const isLocalhost = useIsLocalhost();
  /* Localhost-only "white mode" toggle bound to the M key. Implemented
     via a single CSS class on `.landing-root` that drives a CSS filter
     in globals.css — no per-component theming refactor required. Press
     M anywhere on the page (outside form fields) to flip; press again
     to revert. */
  const [lightMode, setLightMode] = useState(false);

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

  /* Keyboard handler for the M-key light mode toggle. Localhost only.
     Listens at BOTH `document` and `window` so the event is caught
     wherever the browser routes it (some focus states route to one
     but not the other). Matches on both `e.key` and `e.code` so it
     works on every keyboard layout including AZERTY. Suppressed while
     the user is typing in an input / textarea / contenteditable so
     it doesn't hijack normal text entry. Cmd/Ctrl/Alt-M chords pass
     through so OS shortcuts (like Cmd+M minimize) still work. */
  useEffect(() => {
    if (!isLocalhost) return;
    function onKey(e: KeyboardEvent) {
      const isM = e.key === "m" || e.key === "M" || e.code === "KeyM";
      if (!isM) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      setLightMode((v) => !v);
    }
    /* Attach to document only — keydown bubbles to document from any
       element, so a single listener here catches every keypress on
       the page. Attaching to both document AND window would invoke
       the handler twice for the same event (toggling twice = net no
       change), which is the exact "doesn't work" symptom we want to
       avoid. */
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isLocalhost]);

  return (
    <div
      className={`landing-root min-h-screen bg-black font-sans text-[#f0f0f0] ${
        lightMode ? "landing-light" : ""
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
    </div>
  );
}
