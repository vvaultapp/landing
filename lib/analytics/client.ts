"use client";

export type SourceApp = "get" | "onyx" | "vvault";

export type AttributionCookie = {
  v: 1;
  source_app: SourceApp;
  anon_id: string;
  session_id: string;
  first_seen_at: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
  fbp?: string;
  fbc?: string;
  meta_campaign_id?: string;
  meta_adset_id?: string;
  meta_ad_id?: string;
};

const COOKIE_NAME = "vv_attribution_v1";
const STORAGE_KEY = "vv_attribution_v1";
const ANON_KEY = "vv_anon_id";
const SESSION_KEY = "vv_session_id";
const LANDING_TRACKED_KEY = "vv_landing_tracked_get";
const ONE_YEAR = 60 * 60 * 24 * 365;

const ATTR_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "fbp",
  "fbc",
  "meta_campaign_id",
  "meta_adset_id",
  "meta_ad_id",
] as const;

type AttrKey = (typeof ATTR_KEYS)[number];

function getAnalyticsBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_ANALYTICS_BASE_URL ||
    "https://vvault-funnel-dashboard-vvaults-projects.vercel.app"
  ).replace(/\/+$/, "");
}

function cookieDomain() {
  const configured = process.env.NEXT_PUBLIC_ATTRIBUTION_COOKIE_DOMAIN;
  if (configured && configured.trim()) return configured.trim();
  if (typeof window === "undefined") return undefined;
  if (window.location.hostname.endsWith(".vvault.app")) return ".vvault.app";
  return undefined;
}

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function safeStorageGet(storage: Storage | null, key: string) {
  if (!storage) return null;
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(storage: Storage | null, key: string, value: string) {
  if (!storage) return;
  try {
    storage.setItem(key, value);
  } catch {
    // ignore
  }
}

function randomId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function readCookie(name: string) {
  if (typeof document === "undefined") return null;
  const parts = document.cookie.split(";").map((part) => part.trim());
  for (const part of parts) {
    if (!part.startsWith(`${name}=`)) continue;
    return decodeURIComponent(part.slice(name.length + 1));
  }
  return null;
}

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const domain = cookieDomain();
  const domainPart = domain ? `; Domain=${domain}` : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax${secure}${domainPart}`;
}

function pickParams(params: URLSearchParams) {
  const result: Partial<Record<AttrKey, string>> = {};
  ATTR_KEYS.forEach((key) => {
    const value = params.get(key)?.trim();
    if (value) result[key] = value;
  });
  return result;
}

function getOrCreateAnonId() {
  if (typeof window === "undefined") return "";
  const fromLocal = safeStorageGet(window.localStorage, ANON_KEY);
  if (fromLocal) return fromLocal;
  const fromCookie = readCookie(ANON_KEY);
  if (fromCookie) {
    safeStorageSet(window.localStorage, ANON_KEY, fromCookie);
    return fromCookie;
  }
  const next = randomId();
  safeStorageSet(window.localStorage, ANON_KEY, next);
  writeCookie(ANON_KEY, next);
  return next;
}

function getOrCreateSessionId() {
  if (typeof window === "undefined") return "";
  const fromSession = safeStorageGet(window.sessionStorage, SESSION_KEY);
  if (fromSession) return fromSession;
  const next = randomId();
  safeStorageSet(window.sessionStorage, SESSION_KEY, next);
  writeCookie(SESSION_KEY, next);
  return next;
}

export function readAttributionCookie(): AttributionCookie | null {
  if (typeof window === "undefined") return null;
  const fromCookie = safeJsonParse<AttributionCookie>(readCookie(COOKIE_NAME));
  if (fromCookie) return fromCookie;
  const fromStorage = safeJsonParse<AttributionCookie>(safeStorageGet(window.localStorage, STORAGE_KEY));
  return fromStorage;
}

export function ensureAttribution(sourceApp: SourceApp): AttributionCookie | null {
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  const current = pickParams(params);
  const existing = readAttributionCookie();

  const merged: AttributionCookie = {
    v: 1,
    source_app: sourceApp,
    anon_id: getOrCreateAnonId(),
    session_id: getOrCreateSessionId(),
    first_seen_at: existing?.first_seen_at || new Date().toISOString(),
  };

  ATTR_KEYS.forEach((key) => {
    const value = current[key] || existing?.[key];
    if (value) {
      (merged as Record<string, string>)[key] = value;
    }
  });

  const serialized = JSON.stringify(merged);
  safeStorageSet(window.localStorage, STORAGE_KEY, serialized);
  writeCookie(COOKIE_NAME, serialized);

  return merged;
}

export function appendAttributionParams(rawHref: string, sourceApp: SourceApp) {
  if (typeof window === "undefined") return rawHref;

  let url: URL;
  try {
    url = new URL(rawHref, window.location.origin);
  } catch {
    return rawHref;
  }

  const isVvaultHost =
    url.hostname === "vvault.app" ||
    url.hostname === "www.vvault.app" ||
    url.hostname.endsWith(".vvault.app");

  if (!isVvaultHost) return url.toString();

  const source = ensureAttribution(sourceApp);
  const currentParams = new URLSearchParams(window.location.search);

  if (!url.searchParams.get("ref_app")) {
    url.searchParams.set("ref_app", sourceApp);
  }

  ATTR_KEYS.forEach((key) => {
    const fromCurrent = currentParams.get(key)?.trim();
    const fromCookie = source?.[key]?.trim();
    const value = fromCurrent || fromCookie;
    if (value && !url.searchParams.get(key)) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

export async function trackLandingView(sourceApp: SourceApp) {
  if (typeof window === "undefined") return false;

  if (safeStorageGet(window.sessionStorage, LANDING_TRACKED_KEY)) {
    return false;
  }

  const attribution = ensureAttribution(sourceApp);
  if (!attribution) return false;

  const payload = {
    event: "landing_view" as const,
    source_app: sourceApp,
    anon_id: attribution.anon_id,
    session_id: attribution.session_id,
    path: `${window.location.pathname}${window.location.search}`,
    referrer: document.referrer || undefined,
    utm_source: attribution.utm_source,
    utm_medium: attribution.utm_medium,
    utm_campaign: attribution.utm_campaign,
    utm_content: attribution.utm_content,
    utm_term: attribution.utm_term,
    fbclid: attribution.fbclid,
    fbp: attribution.fbp,
    fbc: attribution.fbc,
    meta_campaign_id: attribution.meta_campaign_id,
    meta_adset_id: attribution.meta_adset_id,
    meta_ad_id: attribution.meta_ad_id,
  };

  try {
    const res = await fetch(`${getAnalyticsBaseUrl()}/api/analytics/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });

    if (res.ok) {
      safeStorageSet(window.sessionStorage, LANDING_TRACKED_KEY, new Date().toISOString());
      return true;
    }

    return false;
  } catch {
    return false;
  }
}
