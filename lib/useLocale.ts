"use client";

import { useState, useEffect } from "react";

export type Locale = "en" | "fr";

const STORAGE_KEY = "vvault-locale";

/**
 * Reads locale from localStorage (set by landing page or docs language switcher).
 * Falls back to cookie `vvault_locale`, then to "en".
 */
export function useLocale(): [Locale, (l: Locale) => void] {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    // 1. Check localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "fr") {
        setLocaleState(stored);
        return;
      }
    } catch {}

    // 2. Check cookie
    const match = document.cookie.match(/(?:^|;\s*)vvault_locale=(\w+)/);
    if (match) {
      const val = match[1];
      if (val === "fr" || val === "en") {
        setLocaleState(val);
        try { localStorage.setItem(STORAGE_KEY, val); } catch {}
        return;
      }
    }

    // 3. Check current URL path
    if (window.location.pathname.startsWith("/fr")) {
      setLocaleState("fr");
      try { localStorage.setItem(STORAGE_KEY, "fr"); } catch {}
    }
  }, []);

  function setLocale(l: Locale) {
    setLocaleState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch {}
    // Also sync with docs key
    try { localStorage.setItem("vvault-docs-lang", l); } catch {}
  }

  return [locale, setLocale];
}
