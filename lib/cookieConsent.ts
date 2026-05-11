"use client";

/**
 * Cookie consent state — persisted in localStorage so a returning visitor
 * never sees the banner twice. Other client code (analytics, embeds, etc.)
 * reads `getCookieConsent()` to decide whether to fire tracking. The banner
 * dispatches a `vvault-cookie-consent-change` window event when the user
 * picks, so listeners can react without waiting for a page reload.
 *
 * Decisions:
 *   "accept" — user opted in to analytics + similar non-essential cookies.
 *   "reject" — user opted out; analytics calls must be suppressed.
 *
 * NOT set === user hasn't decided yet; the banner is shown.
 */

export type CookieConsentDecision = "accept" | "reject";

export type CookieConsentState = {
  v: 1;
  decision: CookieConsentDecision;
  /** ISO 8601 — when the user made their choice. Used later if we ever
   *  want to expire consent (e.g. re-prompt after 12 months). */
  decidedAt: string;
};

const STORAGE_KEY = "vvault-cookie-consent";
const CHANGE_EVENT = "vvault-cookie-consent-change";

export function getCookieConsent(): CookieConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookieConsentState>;
    if (
      parsed &&
      parsed.v === 1 &&
      (parsed.decision === "accept" || parsed.decision === "reject") &&
      typeof parsed.decidedAt === "string"
    ) {
      return parsed as CookieConsentState;
    }
  } catch {
    /* malformed JSON or storage blocked — treat as no decision */
  }
  return null;
}

export function setCookieConsent(decision: CookieConsentDecision): CookieConsentState {
  const state: CookieConsentState = {
    v: 1,
    decision,
    decidedAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* private mode / storage blocked — fall through, still dispatch event */
    }
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: state }));
  }
  return state;
}

/** True when the visitor has explicitly rejected non-essential cookies.
 *  Default — when no choice has been made (including SSR) — is `false`,
 *  so analytics fires normally on production where the banner isn't
 *  shown yet. Tighten this to `getCookieConsent()?.decision === "accept"`
 *  the day we want strict opt-in (GDPR-style) everywhere. */
export function hasRejectedCookies(): boolean {
  return getCookieConsent()?.decision === "reject";
}

export const COOKIE_CONSENT_EVENT = CHANGE_EVENT;
