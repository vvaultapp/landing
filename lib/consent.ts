// lib/consent.ts
//
// User-facing cookie / tracker consent manager. Storage matches the
// real webapp's `lib/consent.ts` (same key, same shape, same event
// name) so the decision is read as-is when the user crosses from
// `get.vvault.app` → `vvault.app/signup`.
//
// localStorage is per-origin, so to share across subdomains we ALSO
// write a cross-subdomain cookie at `.vvault.app`. The webapp reads
// that cookie when localStorage is empty (see the matching edit to
// the webapp's `lib/consent.ts`). On localhost the cookie domain
// stays unset, so it falls back to the current host transparently.
//
// Categories:
//   - functional   (always granted — strictly necessary)
//   - analytics    (GA4, Vercel Analytics)
//   - marketing    (Meta Pixel, ad networks, attribution pixels)
//
// "Reject all" sets analytics + marketing to false. Until the user
// makes an explicit choice, both are treated as denied (CNIL stance).

export type ConsentState = {
  functional: true; // always granted
  analytics: boolean;
  marketing: boolean;
  /** ISO timestamp of the most recent consent decision. */
  decidedAt: string | null;
  /** Schema version — bumping forces a re-prompt. */
  version: number;
};

export const CONSENT_VERSION = 1;
export const CONSENT_STORAGE_KEY = "vvault:consent.v1";
export const CONSENT_COOKIE_NAME = "vvault_consent_v1";
export const CONSENT_UPDATED_EVENT = "vvault:consent-updated";

export function defaultConsent(): ConsentState {
  return {
    functional: true,
    analytics: false,
    marketing: false,
    decidedAt: null,
    version: CONSENT_VERSION,
  };
}

function parseConsent(raw: string | null): ConsentState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ConsentState> | null;
    if (!parsed || parsed.version !== CONSENT_VERSION) return null;
    return {
      functional: true,
      analytics: parsed.analytics === true,
      marketing: parsed.marketing === true,
      decidedAt:
        typeof parsed.decidedAt === "string" ? parsed.decidedAt : null,
      version: CONSENT_VERSION,
    };
  } catch {
    return null;
  }
}

function readConsentCookie(): ConsentState | null {
  if (typeof document === "undefined") return null;
  const parts = document.cookie.split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(`${CONSENT_COOKIE_NAME}=`)) continue;
    const raw = trimmed.slice(CONSENT_COOKIE_NAME.length + 1);
    try {
      return parseConsent(decodeURIComponent(raw));
    } catch {
      return null;
    }
  }
  return null;
}

/** Picks the cookie domain for cross-subdomain sharing.
 *  Production: `.vvault.app`, so `get.vvault.app` and `vvault.app/signup`
 *  see the same cookie. Localhost / preview hosts: leave unset so the
 *  cookie scopes to the current host. */
function cookieDomain(): string | null {
  if (typeof window === "undefined") return null;
  const host = window.location.hostname.toLowerCase();
  if (host === "vvault.app" || host.endsWith(".vvault.app")) return ".vvault.app";
  return null;
}

function writeConsentCookie(state: ConsentState): void {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(JSON.stringify(state));
  const maxAge = 60 * 60 * 24 * 365; // 1 year — matches webapp consent.ts
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const domain = cookieDomain();
  const domainBit = domain ? `; Domain=${domain}` : "";
  document.cookie = `${CONSENT_COOKIE_NAME}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}${domainBit}`;
}

export function readConsent(): ConsentState {
  if (typeof window === "undefined") return defaultConsent();
  // localStorage first (same-origin fast path)
  try {
    const fromLocal = parseConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY));
    if (fromLocal) return fromLocal;
  } catch {
    /* private mode / storage blocked — fall through */
  }
  // Fallback: cross-subdomain cookie, e.g. set on get.vvault.app and
  // read on vvault.app (or vice versa).
  const fromCookie = readConsentCookie();
  if (fromCookie) return fromCookie;
  return defaultConsent();
}

export function hasUserDecided(state: ConsentState): boolean {
  return state.decidedAt !== null;
}

export function writeConsent(state: ConsentState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode — ignore */
  }
  writeConsentCookie(state);
  try {
    window.dispatchEvent(
      new CustomEvent<ConsentState>(CONSENT_UPDATED_EVENT, { detail: state }),
    );
  } catch {
    /* SSR / older runtime — ignore */
  }
  applyConsentToTrackers(state);
}

export function acceptAll(): ConsentState {
  const next: ConsentState = {
    functional: true,
    analytics: true,
    marketing: true,
    decidedAt: new Date().toISOString(),
    version: CONSENT_VERSION,
  };
  writeConsent(next);
  return next;
}

export function rejectAll(): ConsentState {
  const next: ConsentState = {
    functional: true,
    analytics: false,
    marketing: false,
    decidedAt: new Date().toISOString(),
    version: CONSENT_VERSION,
  };
  writeConsent(next);
  return next;
}

export function savePreferences(prefs: {
  analytics: boolean;
  marketing: boolean;
}): ConsentState {
  const next: ConsentState = {
    functional: true,
    analytics: !!prefs.analytics,
    marketing: !!prefs.marketing,
    decidedAt: new Date().toISOString(),
    version: CONSENT_VERSION,
  };
  writeConsent(next);
  return next;
}

/**
 * Pushes the consent state to GA4 (Consent Mode v2) and Meta Pixel so
 * the SDKs immediately respect it. Safe to call even when SDKs aren't
 * loaded — `gtag` is queued via dataLayer and `fbq` is a no-op until
 * init.
 */
export function applyConsentToTrackers(state: ConsentState): void {
  if (typeof window === "undefined") return;

  // Google Consent Mode v2
  // https://developers.google.com/tag-platform/security/guides/consent
  const w = window as unknown as {
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
  };
  w.dataLayer = w.dataLayer || [];
  const gtag = (...args: unknown[]) => {
    (w.dataLayer as unknown[]).push(args);
  };
  gtag("consent", "update", {
    ad_storage: state.marketing ? "granted" : "denied",
    ad_user_data: state.marketing ? "granted" : "denied",
    ad_personalization: state.marketing ? "granted" : "denied",
    analytics_storage: state.analytics ? "granted" : "denied",
    functionality_storage: "granted",
    security_storage: "granted",
  });

  // Meta Pixel — fbq exposes a granular `consent` command.
  try {
    if (typeof w.fbq === "function") {
      w.fbq("consent", state.marketing ? "grant" : "revoke");
    }
  } catch {
    /* ignore */
  }
}
