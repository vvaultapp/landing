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

function preferredLocaleFromAcceptLanguage(headerValue?: string | null): SupportedLocale | null {
  if (!headerValue) return null;

  const languages = headerValue.split(",");
  for (const language of languages) {
    const token = language.trim().split(";")[0];
    const normalized = normalizeLocale(token);
    if (normalized) return normalized;
  }

  return null;
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

  // Auto-detection only applies to the EN root route.
  if (pathname !== "/") {
    return NextResponse.next();
  }

  const cookieLocale = normalizeLocale(request.cookies.get(LOCALE_COOKIE)?.value);
  if (cookieLocale === "fr") {
    return NextResponse.redirect(new URL("/fr", request.url));
  }
  if (cookieLocale === "en") {
    return NextResponse.next();
  }

  const acceptLanguageLocale = preferredLocaleFromAcceptLanguage(request.headers.get("accept-language"));
  if (acceptLanguageLocale === "fr") {
    const redirected = NextResponse.redirect(new URL("/fr", request.url));
    return setLocaleCookie(redirected, "fr");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
