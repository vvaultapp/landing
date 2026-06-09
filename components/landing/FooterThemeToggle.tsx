"use client";

import { useTheme } from "@/components/ThemeProvider";

/* Pill toggle at the very bottom of the footer. Cycles Auto → Light → Dark →
   Auto. "Auto" follows the device theme live; Light/Dark are manual overrides.
   Starting on Auto (and being able to return to it) keeps device-pairing
   reliable. */
export function FooterThemeToggle() {
  const { mode, cycle } = useTheme();
  const label = mode === "system" ? "Auto" : mode === "light" ? "Light" : "Dark";
  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Theme: ${label}. Click to switch.`}
      title={`Theme: ${label}`}
      className="inline-flex h-8 items-center gap-2 rounded-full border border-[rgb(var(--ov)_/_0.15)] px-3 text-[13px] font-medium text-[rgb(var(--fg)_/_0.55)] transition-colors duration-200 hover:border-[rgb(var(--ov)_/_0.3)] hover:text-[rgb(var(--fg)_/_0.85)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ov)_/_0.3)]"
    >
      {mode === "system" ? (
        /* monitor / auto */
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2.5" y="4" width="19" height="13" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      ) : mode === "light" ? (
        /* sun */
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        /* moon */
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
      <span>{label}</span>
    </button>
  );
}
