// Geo-based billing currency selection.
// Customers located in Europe (EU + EEA + UK + Switzerland + euro microstates)
// are billed in EUR; everyone else is billed in USD. Mirrors the exact same
// logic used in the main vvault app so the marketing site shows the same
// currency Checkout will actually charge.

export type BillingCurrency = "eur" | "usd";

// ISO 3166-1 alpha-2 country codes that should be billed in EUR.
const EUR_COUNTRY_CODES = new Set<string>([
  // EU member states (27)
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE",
  // EEA (non-EU)
  "IS", "LI", "NO",
  // United Kingdom + Switzerland
  "GB", "CH",
  // European microstates that use the euro
  "MC", "AD", "SM", "VA",
]);

// Resolve the visitor's country from edge/CDN headers. Returns an uppercase
// alpha-2 code, or null when it cannot be determined (e.g. localhost).
export function getRequestCountryCode(req: Request): string | null {
  const headers = req.headers;
  const raw =
    headers.get("x-vercel-ip-country") ||
    headers.get("cf-ipcountry") ||
    null;
  if (!raw) return null;
  const code = raw.trim().toUpperCase();
  if (code.length !== 2 || code === "XX" || code === "T1") return null;
  return code;
}

export function billingCurrencyForCountry(country: string | null | undefined): BillingCurrency {
  if (country && EUR_COUNTRY_CODES.has(country.toUpperCase())) return "eur";
  return "usd";
}

// IANA timezones of the EUR countries above. Used as a location signal when no
// edge geo header is available (e.g. localhost dev, or a CDN that didn't tag
// the request) — the browser's timezone is location-based and independent of
// the chosen UI language, so a Belgian on the English site still resolves EUR.
const EUR_TIMEZONES = new Set<string>([
  "Europe/Vienna", "Europe/Brussels", "Europe/Sofia", "Europe/Zagreb",
  "Asia/Nicosia", "Asia/Famagusta", "Europe/Prague", "Europe/Copenhagen",
  "Europe/Tallinn", "Europe/Helsinki", "Europe/Mariehamn", "Europe/Paris",
  "Europe/Berlin", "Europe/Busingen", "Europe/Athens", "Europe/Budapest",
  "Europe/Dublin", "Europe/Rome", "Europe/Riga", "Europe/Vilnius",
  "Europe/Luxembourg", "Europe/Malta", "Europe/Amsterdam", "Europe/Warsaw",
  "Europe/Lisbon", "Atlantic/Madeira", "Atlantic/Azores", "Europe/Bucharest",
  "Europe/Bratislava", "Europe/Ljubljana", "Europe/Madrid", "Africa/Ceuta",
  "Atlantic/Canary", "Europe/Stockholm", "Atlantic/Reykjavik", "Europe/Vaduz",
  "Europe/Oslo", "Arctic/Longyearbyen", "Europe/London", "Europe/Belfast",
  "Europe/Guernsey", "Europe/Jersey", "Europe/Isle_of_Man", "Europe/Zurich",
  "Europe/Monaco", "Europe/Andorra", "Europe/San_Marino", "Europe/Vatican",
]);

export function billingCurrencyForTimeZone(timeZone: string | null | undefined): BillingCurrency {
  return timeZone && EUR_TIMEZONES.has(timeZone.trim()) ? "eur" : "usd";
}

// Client-sent IANA timezone hint (`?tz=Europe/Brussels`). Read from the URL.
function timeZoneHintForRequest(req: Request): string | null {
  let url: URL;
  try {
    url = new URL(req.url);
  } catch {
    return null;
  }
  const tz = url.searchParams.get("tz");
  return tz && tz.trim() ? tz.trim() : null;
}

// Dev-only override so the EUR view (and the €1 promo) can be previewed on
// localhost, which has no geo header and therefore always resolves to USD.
// Reads `?currency=eur|usd` or `?country=XX` from the request URL. Ignored in
// production builds, so live pricing stays strictly geo-based and consistent
// with the currency Checkout actually charges.
function currencyOverrideForRequest(req: Request): BillingCurrency | null {
  if (process.env.NODE_ENV === "production") return null;
  let url: URL;
  try {
    url = new URL(req.url);
  } catch {
    return null;
  }
  const currency = url.searchParams.get("currency");
  if (currency) {
    const c = currency.trim().toLowerCase();
    if (c === "eur" || c === "usd") return c;
  }
  const country = url.searchParams.get("country");
  if (country && country.trim()) return billingCurrencyForCountry(country);
  return null;
}

// Desired billing currency for a request. Unknown location → USD ("everyone else").
export function billingCurrencyForRequest(req: Request): BillingCurrency {
  // 1. Dev-only ?currency / ?country override.
  const override = currencyOverrideForRequest(req);
  if (override) return override;
  // 2. Authoritative edge/CDN geo header (Vercel / Cloudflare) — drives prod.
  const country = getRequestCountryCode(req);
  if (country) return billingCurrencyForCountry(country);
  // 3. Fallback when there's no geo header (localhost dev, or geo couldn't be
  //    resolved): the client's IANA timezone, sent as `?tz=`. This can only
  //    apply when a real geo header is absent, so prod pricing stays geo-exact.
  const tz = timeZoneHintForRequest(req);
  if (tz) return billingCurrencyForTimeZone(tz);
  // 4. Truly unknown → USD.
  return "usd";
}
