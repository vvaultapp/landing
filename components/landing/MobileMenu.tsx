"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LandingContent, Locale } from "@/components/landing/content";

/* Mobile menu — compact drawer. Lazy-loaded (dynamic, ssr:false) from
   LandingNav so its code only ships when the hamburger is first tapped. */
export default function MobileMenu({
  open,
  onClose,
  content,
  locale,
}: {
  open: boolean;
  onClose: () => void;
  content: LandingContent;
  locale: Locale;
}) {
  const fr = locale === "fr";
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Reset expanded items when closing
  useEffect(() => {
    if (!open) setExpandedIndex(null);
  }, [open]);

  /* Reorder for mobile: put "Pricing" first so it's the first thing
     the user sees when they open the menu, then the rest in their
     original order. `content.nav` is shared with the desktop nav so
     we don't mutate it — just produce a reordered list here. */
  const mobileNav = (() => {
    const pricing = content.nav.find(
      (n) => n.label === "Pricing" || n.label === "Tarifs",
    );
    const others = content.nav.filter((n) => n !== pricing);
    return pricing ? [pricing, ...others] : content.nav;
  })();

  return (
    <div
      className="fixed inset-0 z-[45] lg:hidden"
      style={{
        pointerEvents: open ? "auto" : "none",
        visibility: open ? "visible" : "hidden",
      }}
      onClick={onClose}
    >
      {/* Full-screen glass. The glass backdrop itself (bg + blur) is
          applied INSTANTLY — no opacity fade — so it lands at the
          same frame the nav drops its own glass. Previously both
          surfaces were crossfading independently and left a ~150ms
          window where the nav band showed no glass at all (the
          "backdrop turns off for a split second" flicker). Only the
          inner CONTENT fades in for a smooth reveal. */}
      <div
        className="absolute inset-0 overflow-y-auto pt-[calc(72px+var(--app-banner-h,0px))] sm:pt-[calc(68px+var(--app-banner-h,0px))]"
        style={{
          backgroundColor: open ? "rgba(0, 0, 0, 0.55)" : "transparent",
          backdropFilter: open ? "blur(14px)" : "none",
          WebkitBackdropFilter: open ? "blur(14px)" : "none",
        }}
      >
        {/* Inner content — fades in over the already-opaque glass
            so the animation stays smooth. `stopPropagation` keeps
            taps on menu items from triggering close. */}
        <div
          className="px-5 pb-8 sm:px-8"
          style={{
            opacity: open ? 1 : 0,
            transition: "opacity 0.22s ease",
          }}
          onClick={(e) => e.stopPropagation()}
        >
        {/* Nav items — Pricing first, then the rest. Separators
            between items are 0.5px (hairline) instead of 1px so
            they read as subtle dividers, not strong rules. Tap
            highlight is suppressed; on press we fade in our own
            rounded bg so the feedback has nice rounded corners
            instead of the browser's default rectangle. */}
        <nav
          className="flex flex-col"
          aria-label={fr ? "Navigation mobile" : "Mobile navigation"}
        >
          {mobileNav.map((item, i) => {
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedIndex === i;
            const topSep = i === 0 ? null : (
              <div
                className="mx-1"
                style={{
                  height: "0.5px",
                  background: "rgba(255,255,255,0.08)",
                }}
              />
            );

            if (!hasChildren) {
              return (
                <div key={item.label}>
                  {topSep}
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="-mx-1 flex items-center justify-between rounded-xl px-1 py-4 text-[15px] font-medium text-white/60 transition-colors duration-150 active:bg-white/[0.06]"
                    style={{ WebkitTapHighlightColor: "transparent" }}
                  >
                    {item.label}
                  </Link>
                </div>
              );
            }

            return (
              <div key={item.label}>
                {topSep}
                <button
                  type="button"
                  onClick={() => setExpandedIndex(isExpanded ? null : i)}
                  className="-mx-1 flex w-full items-center justify-between rounded-xl px-1 py-4 text-[15px] font-medium text-white/60 transition-colors duration-150 active:bg-white/[0.06]"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  {item.label}
                  <svg
                    viewBox="0 0 20 20"
                    className={`h-5 w-5 fill-none stroke-current stroke-[1.5] text-white/30 transition-transform duration-200 ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  >
                    <path d="M7 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <div
                  className="overflow-hidden transition-all duration-200"
                  style={{
                    maxHeight: isExpanded ? `${item.children!.length * 44 + 8}px` : "0",
                    opacity: isExpanded ? 1 : 0,
                  }}
                >
                  <div className="pb-2 pl-1">
                    {item.children!.map((child) => {
                      const isExternal = child.external || child.href.startsWith("http");
                      const Tag = isExternal ? "a" : Link;
                      const extraProps = isExternal
                        ? { target: "_blank" as const, rel: "noreferrer" }
                        : { onClick: onClose };
                      return (
                        <Tag
                          key={child.label}
                          href={child.href}
                          {...extraProps}
                          className="flex items-center gap-2 rounded-xl py-2.5 pl-3 text-[14px] text-white/40 transition-colors duration-150 active:bg-white/[0.06] active:text-white/70"
                          style={{ WebkitTapHighlightColor: "transparent" }}
                        >
                          {child.label}
                          {isExternal && (
                            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 fill-none stroke-current stroke-[1.5] text-white/20">
                              <path d="M4 1h7v7M11 1L5 7" />
                            </svg>
                          )}
                        </Tag>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
          <div
            className="mx-1"
            style={{
              height: "0.5px",
              background: "rgba(255,255,255,0.08)",
            }}
          />
        </nav>

        {/* Get Started — primary CTA in the mobile menu. Grey
            low-opacity pill on the glass backdrop. */}
        <div className="mt-4">
          <a
            href="https://vvault.app/auth/google"
            className="flex w-full items-center justify-center gap-2.5 rounded-[8px] bg-white/[0.06] px-5 py-3 text-[14px] font-semibold text-white/85 transition-colors duration-200 active:bg-white/[0.09]"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            {locale === "fr" ? "Commencer" : "Get Started"}
          </a>
        </div>
        </div>
      </div>
    </div>
  );
}

