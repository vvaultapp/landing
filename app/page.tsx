"use client";

import { useEffect } from "react";
import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { HeroStatementSection } from "@/components/landing/HeroStatementSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { UpdatesSection } from "@/components/landing/UpdatesSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

function FullBleedDivider() {
  return (
    <div className="relative left-1/2 my-40 w-screen -translate-x-1/2 border-t border-white/10" />
  );
}

export default function Homepage() {
  useEffect(() => {
    document.title = "Integrity | Revenue Operating System";
  }, []);

  return (
    <div className="landing-root min-h-screen bg-[#080808] font-sans text-[#f0f0f0]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-black"
      >
        Skip to content
      </a>
      <LandingNav />
      <main id="main-content">
        <HeroSection />
        <HeroStatementSection />
        <HowItWorksSection />
        <FullBleedDivider />
        <UpdatesSection />
        <FullBleedDivider />
        <PricingSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
