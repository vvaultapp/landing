"use client";

import { useEffect } from "react";
import Image from "next/image";
import type { Win } from "@/lib/landing-wins";

/* Full-size viewer for a win screenshot. Renders a dimmed backdrop
   with the image centered at its natural aspect ratio (capped to the
   viewport). Click anywhere / press Escape to close. */
export function WinLightbox({
  win,
  onClose,
}: {
  win: Win | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!win) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [win, onClose]);

  if (!win) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={win.alt}
      onClick={onClose}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgb(var(--bg)_/_0.85)] p-4 backdrop-blur-sm sm:p-8"
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-[rgb(var(--ov)_/_0.1)] text-[rgb(var(--fg))] hover:bg-[rgb(var(--ov)_/_0.2)] sm:right-6 sm:top-6"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[2]">
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
      </button>

      {/* Image — natural aspect, capped to the viewport. stopPropagation
          so clicking the image itself doesn't close (only the backdrop
          + button do). */}
      <Image
        src={win.src}
        alt={win.alt}
        width={win.w}
        height={win.h}
        sizes="(max-width: 640px) 92vw, 80vw"
        onClick={(e) => e.stopPropagation()}
        className="h-auto max-h-[90vh] w-auto max-w-[92vw] rounded-2xl object-contain sm:max-w-[80vw]"
        style={{ outline: "1px solid rgba(255,255,255,0.1)" }}
      />
    </div>
  );
}
