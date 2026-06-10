import type { Locale } from "@/components/landing/content";

/* Locale-aware price formatting.

   French (and most eurozone) convention puts the symbol AFTER the amount
   with a narrow no-break space — "1 €", "11,99 €" — while English puts it
   before — "€1", "$11.99". Intl.NumberFormat already knows both; we just
   pick the formatting locale from the UI locale instead of hardcoding
   en-US everywhere. */

export function formatMoney(
  unitAmount: number | null | undefined,
  currency: string,
  locale: Locale = "en",
): string {
  if (unitAmount === null || unitAmount === undefined) return "";
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(unitAmount / 100);
}

/** Same, but whole amounts drop the ",00"/".00" — "1 €" instead of "1,00 €". */
export function formatMoneyCompact(
  unitAmount: number | null | undefined,
  currency: string,
  locale: Locale = "en",
): string {
  if (unitAmount === null || unitAmount === undefined) return "";
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: unitAmount % 100 === 0 ? 0 : 2,
  }).format(unitAmount / 100);
}
