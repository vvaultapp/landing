"use client";

import { useState, useEffect } from "react";
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
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

export function LandingCtaLink({
  children,
  loggedInHref = "/dashboard",
  loggedOutHref = "https://vvault.app/login",
  track,
  onClick,
  ...anchorProps
}: LandingCtaLinkProps) {
  const { user, loading } = useAuth();
  const baseHref = !loading && user ? loggedInHref : loggedOutHref;
  const [href, setHref] = useState(baseHref);

  useEffect(() => {
    setHref(appendAttributionParams(baseHref, "get"));
  }, [baseHref]);

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
