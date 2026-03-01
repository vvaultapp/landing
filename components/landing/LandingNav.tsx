"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { LandingContent, Locale } from "@/components/landing/content";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";

type LandingNavProps = {
  locale: Locale;
  content: LandingContent;
};

function LanguageSwitch({
  locale,
  content,
}: {
  locale: Locale;
  content: LandingContent;
}) {
  const isEn = locale === "en";
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (rootRef.current.contains(event.target as Node)) return;
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const switchLocale = (nextLocale: Locale) => {
    setOpen(false);
    const targetPath = nextLocale === "fr" ? "/fr" : "/";
    if (window.location.pathname === targetPath && locale === nextLocale) {
      return;
    }

    document.cookie = `vvault_locale=${nextLocale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
    window.location.assign(targetPath);
  };

  return (
    <div
      ref={rootRef}
      aria-label={content.ui.languageSwitcherAriaLabel}
      className="relative"
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={content.ui.languageSwitcherAriaLabel}
        className="inline-flex items-center gap-1.5 rounded-xl bg-white/[0.02] px-3 py-1.5 text-[11px] font-semibold tracking-[0.06em] text-white/88 transition-colors hover:bg-white/[0.05] focus:outline-none"
      >
        <span>{isEn ? content.ui.languageEnglish : content.ui.languageFrench}</span>
        <svg
          viewBox="0 0 20 20"
          className={`h-3.5 w-3.5 fill-none stroke-current stroke-[1.9] text-white/60 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="M5 8l5 5 5-5" />
        </svg>
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-2 min-w-[112px] overflow-hidden rounded-xl bg-[#111111] p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
          <button
            type="button"
            onClick={() => switchLocale("en")}
            className={`block w-full rounded-lg px-3 py-2 text-left text-[12px] font-medium transition-colors focus:outline-none ${
              isEn ? "bg-white/[0.08] text-white" : "text-white/75 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            {content.ui.languageEnglish}
          </button>
          <button
            type="button"
            onClick={() => switchLocale("fr")}
            className={`mt-1 block w-full rounded-lg px-3 py-2 text-left text-[12px] font-medium transition-colors focus:outline-none ${
              isEn ? "text-white/75 hover:bg-white/[0.06] hover:text-white" : "bg-white/[0.08] text-white"
            }`}
          >
            {content.ui.languageFrench}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function LandingNav({ locale, content }: LandingNavProps) {
  const homeHref = locale === "fr" ? "/fr" : "/";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0e0e0e]/85 pt-[env(safe-area-inset-top)] backdrop-blur-[20px] sm:pt-0">
      <div className="mx-auto flex h-[74px] w-full max-w-[1320px] items-center gap-3 px-5 sm:h-[66px] sm:px-8 lg:px-10">
        <Link
          href={homeHref}
          className="shrink-0 rounded-xl text-[13px] font-semibold tracking-[0.18em] uppercase text-white"
          aria-label={content.ui.homepageAriaLabel}
        >
          vvault
        </Link>

        <nav aria-label="Primary" className="ml-auto hidden items-center gap-5 lg:flex">
          {content.nav.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-full px-3 py-1.5 text-sm text-white/30 transition-colors duration-200 hover:bg-white/[0.05] hover:text-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitch locale={locale} content={content} />
          <LandingCtaLink
            loggedInHref="https://vvault.app/login"
            loggedOutHref="https://vvault.app/login"
            className="inline-flex items-center rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
          >
            {content.ui.login}
          </LandingCtaLink>
        </div>

        <div className="ml-auto lg:hidden">
          <LanguageSwitch locale={locale} content={content} />
        </div>

        <LandingCtaLink
          loggedInHref="https://vvault.app/login"
          loggedOutHref="https://vvault.app/login"
          className="inline-flex items-center rounded-2xl bg-white px-4 py-2 text-[12px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 lg:hidden"
        >
          {content.ui.login}
        </LandingCtaLink>
      </div>

      <nav aria-label="Mobile primary" className="border-t border-white/10 lg:hidden">
        <div className="mx-auto flex w-full max-w-[1320px] gap-2 overflow-x-auto px-5 py-3 sm:px-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {content.nav.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="shrink-0 rounded-full px-3 py-1.5 text-xs text-white/64 transition-colors duration-200 hover:bg-white/[0.05] hover:text-white/84"
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
