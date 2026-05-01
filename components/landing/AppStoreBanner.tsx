"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "vvault_app_banner_dismissed_v1";
const APP_STORE_URL = "https://apps.apple.com/app/id6759256796";
const BANNER_HEIGHT_PX = 64;

/* App-store smart banner shown at the very top of the viewport on
   mobile, in the same spirit as the iOS native Smart App Banner used
   by ChatGPT and others.

   Why a custom React banner instead of the native
   `<meta name="apple-itunes-app">` tag? Two reasons:
   1. The native banner only renders in iOS Safari. Chrome on iOS,
      Firefox on iOS, in-app browsers (Instagram, TikTok, X) all
      ignore it. A custom banner reaches every mobile iOS user.
   2. We control the styling, copy, and dismissal cookie so the
      banner stays consistent with the rest of the site instead of
      handing the look-and-feel to Apple.

   Visibility rules:
   - iOS only (UA contains iPhone/iPad/iPod). Android is hidden
     because we don't ship an Android build.
   - Mobile only (Tailwind `md:hidden`). Desktop never sees it.
   - Hidden once the user has dismissed it (localStorage flag).

   The banner sets `--app-banner-h` on `<html>` so the existing
   fixed LandingNav and body padding-top can slide down by exactly
   the banner's height — no hard-coded offsets in any other file. */
export function AppStoreBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    if (!isIOS) return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    setShow(true);
  }, []);

  useEffect(() => {
    if (show) {
      document.documentElement.style.setProperty(
        "--app-banner-h",
        `${BANNER_HEIGHT_PX}px`,
      );
    } else {
      document.documentElement.style.removeProperty("--app-banner-h");
    }
    return () => {
      document.documentElement.style.removeProperty("--app-banner-h");
    };
  }, [show]);

  if (!show) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* private mode etc. — ignore, just hide for the session */
    }
    setShow(false);
  };

  return (
    <div
      role="banner"
      aria-label="Get the vvault iOS app"
      className="fixed inset-x-0 top-0 z-[100] flex items-center gap-2.5 px-3 md:hidden"
      style={{
        height: `${BANNER_HEIGHT_PX}px`,
        paddingTop: "env(safe-area-inset-top)",
        boxSizing: "content-box",
        background: "rgba(8, 8, 10, 0.96)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
      }}
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss app banner"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/65 transition-colors hover:bg-white/15 hover:text-white"
      >
        <svg
          viewBox="0 0 14 14"
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <path d="M3 3l8 8M11 3l-8 8" />
        </svg>
      </button>
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[11px]"
      >
        {/* The 1024×1024 iOS app icon is already a self-contained
           rounded tile (black bg + VVAULT wordmark), so we use it
           directly instead of apple-touch-icon.png, which is a
           cropped wordmark with no rounded mask. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/vvault-iOS-Default-1024x1024@1x.png"
          alt="vvault"
          width={44}
          height={44}
          className="h-full w-full object-cover"
        />
      </a>
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="min-w-0 flex-1"
      >
        <p className="truncate text-[15.5px] font-semibold leading-tight text-white">
          vvault
        </p>
        <p className="truncate text-[12.5px] leading-tight text-white/55">
          Send, sell &amp; track your beats
        </p>
      </a>
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded-full bg-[#0a84ff] px-[18px] py-[7px] text-[14px] font-semibold text-white transition-colors hover:bg-[#1c8fff]"
      >
        Get
      </a>
    </div>
  );
}
