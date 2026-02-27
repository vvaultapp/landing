import type { AnchorHTMLAttributes, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

type LandingCtaLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  children: ReactNode;
  loggedInHref?: string;
  loggedOutHref?: string;
};

export function LandingCtaLink({
  children,
  loggedInHref = "/dashboard",
  loggedOutHref = "/book-call",
  ...anchorProps
}: LandingCtaLinkProps) {
  const { user, loading } = useAuth();
  const href = !loading && user ? loggedInHref : loggedOutHref;

  return (
    <a {...anchorProps} href={href}>
      {children}
    </a>
  );
}

