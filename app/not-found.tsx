"use client";

import Link from "next/link";
import { useLocaleContext } from "@/components/LocaleProvider";

/* Client component on purpose: the global not-found boundary is prerendered
   into EVERY route's shell, so reading cookies() here (the old behaviour)
   silently forced the entire site into per-request dynamic rendering. The
   locale now comes from the client-side LocaleProvider instead. */
export default function NotFound() {
  const { locale } = useLocaleContext();
  const fr = locale === "fr";

  const heading = fr ? "Page introuvable" : "Page not found";
  const message = fr
    ? "La page que tu cherches n'existe pas ou a peut-être été déplacée."
    : "The page you're looking for doesn't exist or may have been moved.";
  const backHome = fr ? "Retour à l'accueil" : "Back to home";
  const helpCenter = fr ? "Centre d'aide" : "Help center";
  const homeHref = fr ? "/fr" : "/";

  return (
    <div className="landing-root min-h-screen bg-[rgb(var(--bg))] font-sans text-[rgb(var(--fg))]">
      <main className="relative z-10 mx-auto flex min-h-screen max-w-[720px] flex-col items-center justify-center px-5 text-center">
        <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-[rgb(var(--fg)_/_0.3)]">404</p>
        <h1 className="mt-4 text-3xl font-medium tracking-tight text-[rgb(var(--fg))] sm:text-[2.8rem]">
          {heading}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-[rgb(var(--fg)_/_0.4)]">
          {message}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={homeHref}
            className="inline-flex items-center rounded-full bg-[rgb(var(--inv))] px-6 py-2.5 text-[14px] font-semibold text-[rgb(var(--inv-fg))] hover:opacity-90"
          >
            {backHome}
          </Link>
          <Link
            href="/help"
            className="inline-flex items-center rounded-full bg-[rgb(var(--ov)_/_0.06)] px-6 py-2.5 text-[14px] font-medium text-[rgb(var(--fg))] hover:bg-[rgb(var(--ov)_/_0.1)]"
          >
            {helpCenter}
          </Link>
        </div>
      </main>
    </div>
  );
}
