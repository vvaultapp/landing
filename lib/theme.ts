"use client";

/**
 * Landing-page light/dark theme state. Persisted in localStorage so a
 * returning visitor keeps the look they chose last time. Broadcasts a
 * `vvault-theme-change` window event when toggled, so any component
 * that mounts a listener (LandingPage, the footer toggle) re-renders
 * in lockstep without prop-drilling.
 *
 * Default theme is "dark" — the landing was designed dark-first.
 */

export type LandingTheme = "light" | "dark";

const STORAGE_KEY = "vvault-landing-theme";
const CHANGE_EVENT = "vvault-theme-change";

export function getLandingTheme(): LandingTheme {
  if (typeof window === "undefined") return "dark";
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export function setLandingTheme(theme: LandingTheme): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* private mode / storage blocked — still dispatch the event so
       in-memory listeners can react this session */
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: theme }));
}

export const LANDING_THEME_EVENT = CHANGE_EVENT;
