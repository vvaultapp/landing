"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { Locale } from "@/components/landing/content";

/* Pages that have explicit mirrored routes under `/fr/…`. For any
   other page we just flip the locale in localStorage and reload in
   place — content is served from a shared `Content.tsx` that reads
   locale via `useLocale()`, so the same URL renders the right
   language after reload. */
const FR_MIRRORED_ROUTES = new Set(["/", "/signup"]);

type Props = {
  /** Passed from a server-rendered context if the page knows the locale
      up-front (e.g. LandingPage). Optional — when absent the component
      reads it from localStorage on mount. */
  initialLocale?: Locale;
  ariaLabel?: string;
  enLabel?: string;
  frLabel?: string;
};

export function FooterLanguageSwitcher({
  initialLocale,
  ariaLabel = "Language",
  enLabel = "EN",
  frLabel = "FR",
}: Props) {
  const pathname = usePathname() || "/";

  /* We DERIVE the active locale rather than storing a frozen initial
     state. When the parent page's `useLocale()` updates (it's a
     localStorage-backed hook whose effect runs after first paint),
     `initialLocale` changes on re-render — and the switcher follows,
     so the pill always matches what the page is actually displaying.
     Falling back to a localStorage read covers footers that don't
     pass initialLocale (e.g. BlogFooter on /for/*). */
  const [storageLocale, setStorageLocale] = useState<Locale | null>(null);

  useEffect(() => {
    /* Keep the localStorage mirror fresh even if the parent provides
       initialLocale — covers cross-tab updates too. */
    const read = () => {
      try {
        const stored = localStorage.getItem("vvault-locale");
        if (stored === "en" || stored === "fr") {
          setStorageLocale(stored);
          return;
        }
      } catch {}
      if (pathname.startsWith("/fr")) setStorageLocale("fr");
      else setStorageLocale(null);
    };
    read();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "vvault-locale") read();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [pathname]);

  /* Resolution order: the page's own prop (truth when the page knows
     its locale) → localStorage (for pages that don't pass it) → URL
     heuristic (/fr prefix) → 'en'. */
  const locale: Locale =
    initialLocale ?? storageLocale ?? (pathname.startsWith("/fr") ? "fr" : "en");

  const switchTo = (target: Locale) => {
    if (target === locale) return;
    try {
      localStorage.setItem("vvault-locale", target);
      localStorage.setItem("vvault-docs-lang", target);
    } catch {}

    const logical = pathname.startsWith("/fr")
      ? pathname.replace(/^\/fr/, "") || "/"
      : pathname;

    if (FR_MIRRORED_ROUTES.has(logical)) {
      const next =
        target === "fr" ? (logical === "/" ? "/fr" : `/fr${logical}`) : logical;
      if (next !== pathname) {
        window.location.href = next;
        return;
      }
    }
    window.location.reload();
  };

  return (
    <div
      className="flex items-center gap-1 rounded-xl border border-white/[0.06] px-1 py-0.5"
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        onClick={() => switchTo("en")}
        aria-pressed={locale === "en"}
        className={`rounded-xl px-2.5 py-1 text-xs font-medium transition-colors duration-200 ${
          locale === "en"
            ? "bg-white/10 text-white/90"
            : "text-white/40 hover:text-white/70"
        }`}
      >
        {enLabel}
      </button>
      <button
        type="button"
        onClick={() => switchTo("fr")}
        aria-pressed={locale === "fr"}
        className={`rounded-xl px-2.5 py-1 text-xs font-medium transition-colors duration-200 ${
          locale === "fr"
            ? "bg-white/10 text-white/90"
            : "text-white/40 hover:text-white/70"
        }`}
      >
        {frLabel}
      </button>
    </div>
  );
}
