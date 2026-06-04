import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureSection } from "@/components/landing/MinimalSections";
import { FinalCtaSectionNew } from "@/components/landing/FinalCtaSectionNew";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { DeferredPricing } from "@/components/landing/DeferredPricing";
import { LandingBootstrap } from "@/components/landing/LandingBootstrap";
import CookieConsentBanner from "@/components/legal/CookieConsentBanner";
import { getLandingContent, type Locale } from "@/components/landing/content";
import { getLandingNewContent } from "@/components/landing/contentNew";

type LandingPageNewProps = {
  locale?: Locale;
};

/**
 * Server Component shell. Only the genuinely-interactive pieces are client
 * components (LandingNav, HeroSection, the deferred pricing, the cookie
 * banner, and the small LandingBootstrap effects island). The static sections
 * (features, final CTA, footer) render server-side and ship no JS, which is
 * what keeps the homepage's first-load bundle small.
 */
export function LandingPageNew({ locale = "en" }: LandingPageNewProps) {
  const content = getLandingContent(locale);
  const contentNew = getLandingNewContent(locale);

  return (
    <div className="landing-root min-h-screen bg-black font-sans text-[#f0f0f0]">
      <LandingBootstrap locale={locale} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-[#0e0e0e]"
      >
        {content.skipToContentLabel}
      </a>
      <LandingNav locale={locale} content={content} showPrimaryLinks={true} />
      <main id="main-content" className="pb-20 sm:pb-0">
        {/* 1 — Hero (headline + signup + product video) */}
        <HeroSection content={content} locale={locale} />
        {/* 2 — Features (server-rendered; videos are client islands) */}
        <FeatureSection locale={locale} />
        {/* 7 — Wins wall + 8 — Pricing (deferred client island) */}
        <DeferredPricing locale={locale} />
        {/* 9 — Final CTA (server-rendered) */}
        <FinalCtaSectionNew content={contentNew} />
      </main>
      {/* 10 — Footer (server-rendered) */}
      <LandingFooter locale={locale} content={content} />
      <CookieConsentBanner />
    </div>
  );
}
