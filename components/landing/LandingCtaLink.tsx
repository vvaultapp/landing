"use client";

import { useState, useEffect } from "react";
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import {
  appendAttributionParams,
  trackButtonClick,
} from "@/lib/analytics/client";

type LandingCtaLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  children: ReactNode;
  loggedInHref?: string;
  loggedOutHref?: string;
  /** Optional click tracking. Logged to public.button_clicks. */
  track?: {
    buttonId: string;
    surface: string;
    locale?: "en" | "fr";
    planId?: string | null;
  };
};

/**
 * Lazily answer "is there a session?" WITHOUT pulling the Supabase SDK into
 * the first-load bundle. Previously this component used `useAuth()`, which
 * statically imports `@/lib/supabaseClient` — that alone shipped the entire
 * Supabase client (~186KB: auth + realtime + postgrest) on the marketing
 * landing AND opened a realtime socket + an auth round-trip on every visit,
 * just to decide a link's href.
 *
 * Instead we dynamic-import the client once (shared, cached promise) AFTER
 * hydration and read the session LOCALLY (`getSession`, no network call, no
 * socket). The result is memoised so N CTAs share a single import + read.
 */
let sessionPromise: Promise<boolean> | null = null;
function hasSessionLazy(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (!sessionPromise) {
    sessionPromise = import("@/lib/supabaseClient")
      .then(({ supabase }) => supabase.auth.getSession())
      .then(({ data }) => Boolean(data.session))
      .catch(() => false);
  }
  return sessionPromise;
}

export function LandingCtaLink({
  children,
  loggedInHref = "/dashboard",
  loggedOutHref = "https://vvault.app/login",
  track,
  onClick,
  ...anchorProps
}: LandingCtaLinkProps) {
  // Start with the logged-out destination (correct for the overwhelming
  // majority of marketing visitors) so SSR + first paint are stable and the
  // Supabase SDK stays out of the critical bundle. Upgrade to the logged-in
  // destination only after a deferred, local session check resolves.
  const [href, setHref] = useState(loggedOutHref);

  useEffect(() => {
    let active = true;
    setHref(appendAttributionParams(loggedOutHref, "get"));
    hasSessionLazy().then((loggedIn) => {
      if (active && loggedIn) {
        setHref(appendAttributionParams(loggedInHref, "get"));
      }
    });
    return () => {
      active = false;
    };
  }, [loggedInHref, loggedOutHref]);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (track) {
      trackButtonClick({
        buttonId: track.buttonId,
        surface: track.surface,
        locale: track.locale,
        planId: track.planId,
        href,
      });
    }
    if (onClick) onClick(e);
  };

  return (
    <a {...anchorProps} href={href} onClick={handleClick}>
      {children}
    </a>
  );
}
