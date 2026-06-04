"use client";

/* Dedupes JSON GETs across the components that need the same endpoint.

   The homepage independently fetches /api/landing-stats from a few places
   (hero, social proof) and /api/billing/prices from a couple (nav pill,
   pricing). Without this, that's 3 + 3 near-simultaneous requests on every
   load — extra network that keeps the browser's loading indicator spinning.

   - In-flight de-dup: concurrent calls for the same URL share ONE request.
   - Short TTL cache: a call within `ttlMs` of the last success reuses it, so
     mounting another consumer (or a quick re-render) makes no new request.
   Polling still works: after the TTL elapses the next call refetches. */
const inflight = new Map<string, Promise<unknown>>();
const cache = new Map<string, { at: number; data: unknown }>();

export async function fetchJsonCached<T = unknown>(url: string, ttlMs = 30_000): Promise<T> {
  const now = Date.now();
  const hit = cache.get(url);
  if (hit && now - hit.at < ttlMs) return hit.data as T;

  const existing = inflight.get(url);
  if (existing) return existing as Promise<T>;

  const p = fetch(url, { cache: "no-store" })
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then((data) => {
      cache.set(url, { at: Date.now(), data });
      inflight.delete(url);
      return data;
    })
    .catch((e) => {
      inflight.delete(url);
      throw e;
    });

  inflight.set(url, p);
  return p as Promise<T>;
}
