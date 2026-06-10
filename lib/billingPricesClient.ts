"use client";

import { fetchJsonCached } from "@/lib/fetchJsonCached";
import {
  billingCurrencyForCountry,
  billingCurrencyForTimeZone,
  type BillingCurrency,
} from "@/lib/billing/checkoutCurrency";

/* Client-side billing currency + prices.

   /api/billing/prices is now a STATIC, CDN-cached route that returns the
   price table for BOTH currencies; the client picks EUR/USD locally from the
   browser timezone (the exact same rule the server used). This means:
   - the currency is known SYNCHRONOUSLY on first client render (no fetch
     round-trip before the right symbol shows), and
   - the price payload itself comes from the edge cache instead of a
     per-request lambda. */

/** Resolve the visitor's billing currency synchronously (no network).
    ?currency= / ?country= overrides are honoured for previews. */
export function resolveClientBillingCurrency(): BillingCurrency {
  try {
    const sp = new URLSearchParams(window.location.search);
    const cur = sp.get("currency")?.trim().toLowerCase();
    if (cur === "eur" || cur === "usd") return cur;
    const country = sp.get("country");
    if (country && country.trim()) return billingCurrencyForCountry(country);
  } catch {
    /* no window / bad URL — fall through to timezone */
  }
  try {
    return billingCurrencyForTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  } catch {
    return "eur";
  }
}

/** Fetch the (static, both-currency) price table and return the slice for
    the visitor's currency — same shape the old geo-aware endpoint returned. */
export async function fetchBillingPricesForClient(): Promise<unknown> {
  const json = (await fetchJsonCached("/api/billing/prices")) as {
    byCurrency?: Record<string, unknown>;
  };
  return json?.byCurrency?.[resolveClientBillingCurrency()] ?? null;
}
