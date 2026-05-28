/* Locale-aware price formatting for the landing.

   French convention is `1€` with the symbol on the right; English
   is `€1` with the symbol on the left. Numerals stay identical
   across locales so we just decide which side the symbol sits on.

   `amount` can be a string ("8.99") or a number (8.99). Passing a
   string lets you keep things like "8.99" exactly as written
   without worrying about toLocaleString rounding. */

import type { Locale } from "@/components/landing/content";

export function formatPrice(
  amount: number | string,
  locale: Locale = "en",
  options: { symbol?: string } = {},
): string {
  const symbol = options.symbol ?? "€";
  const value = typeof amount === "number" ? String(amount) : amount;
  return locale === "fr" ? `${value}${symbol}` : `${symbol}${value}`;
}
