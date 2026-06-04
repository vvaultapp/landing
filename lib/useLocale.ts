"use client";

import { useLocaleContext, type Locale } from "@/components/LocaleProvider";

export type { Locale };

/**
 * Site language hook. Backed by the global <LocaleProvider> (seeded on the
 * server from the `vvault_locale` cookie), so every consumer renders the same
 * language from first paint — no flash, no drift. `setLocale` updates the
 * cookie + localStorage so the choice persists everywhere.
 */
export function useLocale(): [Locale, (l: Locale) => void] {
  const { locale, setLocale } = useLocaleContext();
  return [locale, setLocale];
}
