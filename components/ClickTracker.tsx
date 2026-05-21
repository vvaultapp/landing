"use client";

import { useEffect } from "react";
import { trackButtonClick } from "@/lib/analytics/client";

/* Document-wide click listener that picks up any element with a
   `data-track-id` attribute and fires `trackButtonClick`. This means
   adding tracking to a new button is a one-attribute change instead
   of wrapping every onClick.

   Conventions for the data attributes:
   - `data-track-id`     — required. The canonical button_id, e.g.
                           "home.hero.see_pricing". Use `<page>.<section>.<role>`.
   - `data-track-surface`— optional. Defaults to "landing.<page>" inferred
                           from the page segment of the button id.
   - `data-track-plan`   — optional. Set to "free" / "pro" / "ultra" for
                           pricing-card CTAs so the dashboard can break
                           down conversions by plan. */

function inferSurface(buttonId: string): string {
  // "home.hero.see_pricing" -> "landing.home"
  // "pricing.compare.pro"   -> "landing.pricing"
  const seg = buttonId.split(".")[0];
  return seg ? `landing.${seg}` : "landing";
}

export function ClickTracker({ locale = "en" }: { locale?: "en" | "fr" }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (event: MouseEvent) => {
      const start = event.target as Element | null;
      if (!start) return;
      const el =
        start instanceof Element
          ? (start.closest("[data-track-id]") as HTMLElement | null)
          : null;
      if (!el) return;
      const buttonId = el.dataset.trackId;
      if (!buttonId) return;
      const surface = el.dataset.trackSurface || inferSurface(buttonId);
      const planId = el.dataset.trackPlan || null;
      const href =
        el.tagName === "A" ? (el as HTMLAnchorElement).getAttribute("href") : null;
      trackButtonClick({
        buttonId,
        surface,
        locale,
        planId,
        href: href || null,
      });
    };
    document.addEventListener("click", handler, { passive: true, capture: true });
    return () => document.removeEventListener("click", handler, { capture: true } as AddEventListenerOptions);
  }, [locale]);
  return null;
}
