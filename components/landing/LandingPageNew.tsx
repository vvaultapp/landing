import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureSection } from "@/components/landing/MinimalSections";
import { FinalCtaSectionNew } from "@/components/landing/FinalCtaSectionNew";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { DeferredPricing } from "@/components/landing/DeferredPricing";
import { LandingBootstrap } from "@/components/landing/LandingBootstrap";
import CookieConsentBanner from "@/components/legal/CookieConsentBannerClient";
import { getLandingContent, type Locale } from "@/components/landing/content";
import { getLandingNewContent } from "@/components/landing/contentNew";
import { getHeroStats } from "@/lib/landing/heroStats";

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
export async function LandingPageNew({ locale = "en" }: LandingPageNewProps) {
  const content = getLandingContent(locale);
  const contentNew = getLandingNewContent(locale);
  // Server-fetched user count + inlined avatar data URIs, so the hero's
  // "Used by N" and the 5 profile circles are in the HTML at first paint —
  // never grey, the number always present. Cached (10-min) so this doesn't
  // add per-request latency. See lib/landing/heroStats.ts.
  const heroStats = await getHeroStats();

  return (
    <div className="landing-root min-h-screen bg-[rgb(var(--bg))] font-sans text-[rgb(var(--fg))]">
      <LandingBootstrap locale={locale} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-[rgb(var(--inv))] focus:px-3 focus:py-2 focus:text-sm focus:text-[rgb(var(--inv-fg))]"
      >
        {content.skipToContentLabel}
      </a>
      <LandingNav locale={locale} content={content} showPrimaryLinks={true} />
      <main id="main-content" className="pb-20 sm:pb-0">
        {/* 1 — Hero (headline + signup + product video) */}
        <HeroSection content={content} locale={locale} initialStats={heroStats} />
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
