"use client";

import { useEffect, useState } from "react";
import { resolveClientBillingCurrency } from "@/lib/billingPricesClient";
import type { BillingCurrency } from "@/lib/billing/checkoutCurrency";

export type { BillingCurrency };

/* Lightweight, shared client hook that resolves the visitor's billing currency
   (EUR in Europe, USD elsewhere). The currency is now resolved SYNCHRONOUSLY
   from the browser timezone (same rule the old geo endpoint applied
   server-side), so site-wide chrome (e.g. the nav promo pill) shows the right
   symbol on the very first client render — no fetch round-trip.

   `promoActive` stays optimistically true (the €1/$1 intro offer is always on
   in production; the pricing page re-confirms it from the static price table). */
export function useBillingCurrency(): { currency: BillingCurrency; promoActive: boolean } {
  const [currency, setCurrency] = useState<BillingCurrency>("eur");

  useEffect(() => {
    // Resolved in an effect (not the useState initializer) so the server
    // HTML ("eur") and the hydration render match — the correction for USD
    // visitors lands one frame later, with no hydration mismatch.
    setCurrency(resolveClientBillingCurrency());
  }, []);

  return { currency, promoActive: true };
}
