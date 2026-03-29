"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LandingContent, Locale } from "@/components/landing/content";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";

type LandingNavProps = {
  locale: Locale;
  content: LandingContent;
  showPrimaryLinks?: boolean;
};

export function LandingNav({ locale, content, showPrimaryLinks = true }: LandingNavProps) {
  const homeHref = locale === "fr" ? "/fr" : "/";
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const progress = Math.min(window.scrollY / 100, 1);
      setScrollProgress(progress);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 border-b pt-[env(safe-area-inset-top)] sm:pt-0"
      style={{
        borderColor: `rgba(255, 255, 255, ${0.1 * scrollProgress})`,
        backgroundColor: `rgba(0, 0, 0, ${0.55 * scrollProgress})`,
        backdropFilter: `blur(${14 * scrollProgress}px)`,
        WebkitBackdropFilter: `blur(${14 * scrollProgress}px)`,
        transition: "border-color 0.3s ease, background-color 0.3s ease, backdrop-filter 0.3s ease, -webkit-backdrop-filter 0.3s ease",
      }}
    >
      <div className="mx-auto flex h-[62px] w-full max-w-[1320px] items-center px-5 sm:h-[56px] sm:px-8 lg:px-10">
        <Link
          href={homeHref}
          className="shrink-0 rounded-xl text-[14px] font-semibold tracking-[0.18em] uppercase text-white"
          aria-label={content.ui.homepageAriaLabel}
        >
          vvault
        </Link>

        {showPrimaryLinks ? (
          <nav aria-label="Primary" className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
            {content.nav.map((item) => {
              const isExternal = item.href.startsWith("http://") || item.href.startsWith("https://");
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noreferrer" : undefined}
                  className="whitespace-nowrap rounded-full px-3 py-1.5 text-[14px] font-medium text-white/60 transition-colors duration-200 hover:text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        ) : (
          <div className="ml-auto hidden lg:block" />
        )}

        <div className="ml-auto hidden items-center gap-3 lg:flex">
          <LandingCtaLink
            loggedInHref="https://vvault.app/login"
            loggedOutHref="https://vvault.app/login"
            className="inline-flex items-center px-3 py-1.5 text-[14px] font-medium text-white/70 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
          >
            Log In
          </LandingCtaLink>
          <LandingCtaLink
            loggedInHref="https://vvault.app/signup"
            loggedOutHref="https://vvault.app/signup"
            className="inline-flex items-center rounded-2xl bg-[#e8e8e8] px-5 py-2 text-[14px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
          >
            Get Started
          </LandingCtaLink>
        </div>

        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <LandingCtaLink
            loggedInHref="https://vvault.app/login"
            loggedOutHref="https://vvault.app/login"
            className="inline-flex items-center px-3 py-1.5 text-[13px] font-medium text-white/70 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
          >
            Log In
          </LandingCtaLink>
          <LandingCtaLink
            loggedInHref="https://vvault.app/signup"
            loggedOutHref="https://vvault.app/signup"
            className="inline-flex items-center rounded-2xl bg-[#e8e8e8] px-4 py-2 text-[12px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
          >
            Get Started
          </LandingCtaLink>
        </div>
      </div>
    </header>
  );
}
