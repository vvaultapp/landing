"use client";

import { useEffect } from "react";
import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { getLandingContent } from "@/components/landing/content";
import { trackLandingView } from "@/lib/analytics/client";

export function FrSignupPage() {
  const content = getLandingContent("fr");

  useEffect(() => {
    document.documentElement.lang = "fr";
    void trackLandingView("get");
  }, []);

  return (
    <div className="landing-root min-h-screen bg-[#0e0e0e] font-sans text-[#f0f0f0]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-[#0e0e0e]"
      >
        {content.skipToContentLabel}
      </a>
      <LandingNav locale="fr" content={content} showPrimaryLinks={false} />
      <main id="main-content">
        <HeroSection content={content} showOnyxUploader={false} />
      </main>
      <LandingFooter locale="fr" content={content} />
    </div>
  );
}
