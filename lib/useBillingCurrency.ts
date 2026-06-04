"use client";

import { useEffect, useState } from "react";
import { fetchJsonCached } from "@/lib/fetchJsonCached";

/* Lightweight, shared client hook that resolves the visitor's billing currency
   (EUR in Europe, USD elsewhere) from the same geo-aware /api/billing/prices
   endpoint the pricing page uses. Lets site-wide chrome (e.g. the nav promo
   pill) show the right currency symbol without duplicating geo logic.

   Forwards the dev-only ?currency=eur|usd / ?country=XX override so previews
   stay consistent with the pricing page; ignored by the API in production. */
export type BillingCurrency = "eur" | "usd";

export function useBillingCurrency(): { currency: BillingCurrency; promoActive: boolean } {
  const [state, setState] = useState<{ currency: BillingCurrency; promoActive: boolean }>({
    currency: "eur",
    promoActive: true,
  });

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const sp = new URLSearchParams(window.location.search);
        const out = new URLSearchParams();
        const cur = sp.get("currency");
        if (cur) out.set("currency", cur);
        const ctry = sp.get("country");
        if (ctry) out.set("country", ctry);
        // Send the browser's timezone so the API can resolve EUR/USD by
        // location even when there's no edge geo header (e.g. localhost).
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (tz) out.set("tz", tz);
        } catch {
          /* Intl unavailable — fall back to server geo / USD. */
        }
        const qs = out.toString() ? `?${out.toString()}` : "";
        const json = (await fetchJsonCached(`/api/billing/prices${qs}`)) as {
          proMonthly?: { currency?: string };
          offers?: { proMonthlyIntro?: { active?: boolean } };
        };
        const currency = (json?.proMonthly?.currency || "eur").toLowerCase() as BillingCurrency;
        const promoActive = Boolean(json?.offers?.proMonthlyIntro?.active);
        if (alive) setState({ currency, promoActive });
      } catch {
        // keep defaults
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
