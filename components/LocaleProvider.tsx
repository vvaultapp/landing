"use client";

import { createContext, useContext, useEffect, useState } from "react";

/* Single global source of truth for the site language (EN / FR).

   The locale is SEEDED ON THE SERVER from the `vvault_locale` cookie (passed in
   by the root layout) so the very first paint already renders the right
   language — no "flash of English" on French pages, no per-component drift.

   `setLocale` writes BOTH the cookie (read by the proxy + server layout) and
   localStorage (read cross-tab / by the docs), keeping every signal in sync so
   the language is genuinely global and consistent across every page. */
export type Locale = "en" | "fr";

type LocaleCtx = { locale: Locale; setLocale: (l: Locale) => void };

const LocaleContext = createContext<LocaleCtx>({ locale: "en", setLocale: () => {} });

function writeLocaleCookie(l: Locale) {
  try {
    document.cookie = `vvault_locale=${l}; path=/; max-age=31536000; samesite=lax`;
  } catch {
    /* cookies disabled — localStorage + context still work this session */
  }
}

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // Reconcile once on mount. Priority: explicit localStorage choice → the
  // vvault_locale cookie (set at the edge by the proxy for French visitors —
  // pages render statically now, so the server can't read it anymore) → the
  // static seed. The winner is mirrored back into the cookie.
  useEffect(() => {
    try {
      const stored = localStorage.getItem("vvault-locale");
      if ((stored === "en" || stored === "fr") && stored !== locale) {
        setLocaleState(stored);
        writeLocaleCookie(stored);
        return;
      }
      if (stored !== "en" && stored !== "fr") {
        const m = document.cookie.match(/(?:^|;\s*)vvault_locale=(en|fr)/);
        const fromCookie = m?.[1] as Locale | undefined;
        if (fromCookie && fromCookie !== locale) {
          setLocaleState(fromCookie);
          return;
        }
      }
    } catch {
      /* ignore */
    }
    writeLocaleCookie(locale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem("vvault-locale", l);
      localStorage.setItem("vvault-docs-lang", l);
    } catch {
      /* ignore */
    }
    writeLocaleCookie(l);
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocaleContext() {
  return useContext(LocaleContext);
}
