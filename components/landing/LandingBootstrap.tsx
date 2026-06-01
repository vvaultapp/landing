"use client";

import { useEffect } from "react";
import { trackLandingView } from "@/lib/analytics/client";
import type { Locale } from "@/components/landing/content";

/**
 * Tiny client island for the landing page's mount-time side effects, so the
 * page itself (and all the static sections it composes) can be a Server
 * Component that ships zero JS. Renders nothing.
 */
export function LandingBootstrap({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.title =
      locale === "fr"
        ? "vvault | Le workspace musical pour producteurs"
        : "vvault | The music workspace for producers";
    document.documentElement.lang = locale;
    try {
      localStorage.setItem("vvault-locale", locale);
      localStorage.setItem("vvault-docs-lang", locale);
    } catch {}
  }, [locale]);

  useEffect(() => {
    void trackLandingView("get");
  }, []);

  return null;
}
