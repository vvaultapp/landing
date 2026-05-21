"use client";

import { useSyncExternalStore } from "react";

/* Hydration-safe `matchMedia` hook. The third argument to
   useSyncExternalStore is the SSR snapshot — React uses it on the
   server and on the very first client render, then transitions
   to the real value without surfacing as a hydration mismatch.
   Pass the same `ssrFallback` value on every call site so React
   sees a stable initial value. */
export function useMediaQuery(query: string, ssrFallback = false): boolean {
  return useSyncExternalStore(
    (callback) => {
      if (typeof window === "undefined") return () => {};
      const mq = window.matchMedia(query);
      mq.addEventListener?.("change", callback);
      return () => mq.removeEventListener?.("change", callback);
    },
    () => {
      if (typeof window === "undefined") return ssrFallback;
      return window.matchMedia(query).matches;
    },
    () => ssrFallback,
  );
}
