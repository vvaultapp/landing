"use client";

import { useMemo } from "react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { appendAttributionParams } from "@/lib/analytics/client";

type LandingCtaLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  children: ReactNode;
  loggedInHref?: string;
  loggedOutHref?: string;
};

export function LandingCtaLink({
  children,
  loggedInHref = "/dashboard",
  loggedOutHref = "https://vvault.app/login",
  ...anchorProps
}: LandingCtaLinkProps) {
  const { user, loading } = useAuth();
  const baseHref = !loading && user ? loggedInHref : loggedOutHref;
  const href = useMemo(() => appendAttributionParams(baseHref, "get"), [baseHref]);

  return (
    <a {...anchorProps} href={href}>
      {children}
    </a>
  );
}
