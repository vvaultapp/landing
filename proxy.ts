import { NextResponse, type NextRequest } from "next/server";

const LOCALE_COOKIE = "vvault_locale";
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

type SupportedLocale = "en" | "fr";

function normalizeLocale(rawValue?: string | null): SupportedLocale | null {
  if (!rawValue) return null;
  const value = rawValue.toLowerCase();
  if (value.startsWith("fr")) return "fr";
  if (value.startsWith("en")) return "en";
  return null;
}

// The site language follows the DEVICE's primary language — the first entry in
// Accept-Language (which mirrors the user's OS/browser language setting),
// independent of geographic location. French → fr; English, or any other
// language (Portuguese, German, …) → en.
function deviceLocaleFromAcceptLanguage(headerValue?: string | null): SupportedLocale {
  if (!headerValue) return "en";
  const primary = headerValue.split(",")[0]?.trim().split(";")[0]?.trim().toLowerCase();
  return primary?.startsWith("fr") ? "fr" : "en";
}

function isBypassedPath(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname.includes(".")
  );
}

function setLocaleCookie(response: NextResponse, locale: SupportedLocale): NextResponse {
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: ONE_YEAR_IN_SECONDS,
  });
  return response;
}

export function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  if (isBypassedPath(pathname)) {
    return NextResponse.next();
  }

  const queryLocale = normalizeLocale(nextUrl.searchParams.get("lang"));
  if (queryLocale) {
    const target = request.nextUrl.clone();
    target.pathname = queryLocale === "fr" ? "/fr" : "/";
    target.searchParams.delete("lang");

    const redirected = NextResponse.redirect(target);
    return setLocaleCookie(redirected, queryLocale);
  }

  const cookieLocale = normalizeLocale(request.cookies.get(LOCALE_COOKIE)?.value);

  // /fr… routes are explicitly French — force the locale signal to match, so
  // every other page the visitor opens also renders French (global consistency).
  if (pathname === "/fr" || pathname.startsWith("/fr/")) {
    if (cookieLocale === "fr") return NextResponse.next();
    return setLocaleCookie(NextResponse.next(), "fr");
  }

  // Other non-root paths: set the locale cookie from the device language on the
  // first visit only — an existing cookie (or explicit user choice) wins.
  if (pathname !== "/") {
    if (cookieLocale) return NextResponse.next();
    const detected = deviceLocaleFromAcceptLanguage(request.headers.get("accept-language"));
    const response = NextResponse.next();
    return setLocaleCookie(response, detected);
  }

  // Root route: language follows the device's primary language (not location).
  if (cookieLocale === "fr") {
    return NextResponse.redirect(new URL("/fr", request.url));
  }
  if (cookieLocale === "en") {
    return NextResponse.next();
  }

  // No cookie yet — detect from the device language and persist it.
  const detected = deviceLocaleFromAcceptLanguage(request.headers.get("accept-language"));
  if (detected === "fr") {
    const redirected = NextResponse.redirect(new URL("/fr", request.url));
    return setLocaleCookie(redirected, "fr");
  }
  const response = NextResponse.next();
  return setLocaleCookie(response, "en");
}

export const config = {
  matcher: ["/:path*"],
};
