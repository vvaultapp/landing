"use client";

import { useEffect, useState } from "react";

/**
 * Returns true when running on localhost / loopback. Defaults to false during SSR
 * and the first client paint so production users never see a flash of the
 * localhost-only state. Resolves on mount.
 */
export function useIsLocalhost(): boolean {
  const [isLocalhost, setIsLocalhost] = useState(false);

  useEffect(() => {
    const h = window.location.hostname;
    setIsLocalhost(
      h === "localhost" ||
        h === "127.0.0.1" ||
        h === "0.0.0.0" ||
        h === "[::1]" ||
        h.endsWith(".local"),
    );
  }, []);

  return isLocalhost;
}
