"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

/* Global theme with THREE modes:
   - "system" (default): follows the device's `prefers-color-scheme` AND reacts
     live when the OS theme changes. This is the device-paired behaviour.
   - "light" / "dark": an explicit manual override that persists.

   The no-flash script in <head> (app/layout.tsx) sets `html.light` before first
   paint from the same stored mode, so there's no flash. The footer toggle
   cycles Auto → Light → Dark → Auto, so device-pairing is always reachable. */
export type ThemeMode = "system" | "light" | "dark";
export type Theme = "dark" | "light";

const STORAGE_KEY = "vvault-theme";

type ThemeCtx = {
  mode: ThemeMode;
  theme: Theme; // the resolved theme actually applied
  setMode: (m: ThemeMode) => void;
  cycle: () => void;
};

const ThemeContext = createContext<ThemeCtx>({
  mode: "system",
  theme: "dark",
  setMode: () => {},
  cycle: () => {},
});

function deviceDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
function resolve(mode: ThemeMode): Theme {
  if (mode === "light") return "light";
  if (mode === "dark") return "dark";
  return deviceDark() ? "dark" : "light";
}
function apply(theme: Theme) {
  document.documentElement.classList.toggle("light", theme === "light");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [theme, setThemeState] = useState<Theme>("dark");
  const modeRef = useRef<ThemeMode>("system");

  useEffect(() => {
    let m: ThemeMode = "system";
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "system" || stored === "light" || stored === "dark") m = stored;
    } catch {
      /* ignore */
    }
    modeRef.current = m;
    setModeState(m);
    const t = resolve(m);
    setThemeState(t);
    apply(t);

    // Live OS-theme changes: only auto-follow while in "system" mode.
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (modeRef.current !== "system") return;
      const next: Theme = deviceDark() ? "dark" : "light";
      setThemeState(next);
      apply(next);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setMode = (m: ThemeMode) => {
    modeRef.current = m;
    setModeState(m);
    const t = resolve(m);
    setThemeState(t);
    apply(t);
    try {
      if (m === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, m);
    } catch {
      /* private mode — context still works this session */
    }
  };

  const cycle = () =>
    setMode(modeRef.current === "system" ? "light" : modeRef.current === "light" ? "dark" : "system");

  return (
    <ThemeContext.Provider value={{ mode, theme, setMode, cycle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
