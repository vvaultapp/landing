"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { LandingContent, LandingNavItem, Locale } from "@/components/landing/content";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";

/* The heavy dropdown panel (card renderers, icons, Trustpilot card,
   Studio/Prism) lives in its own module, dynamic-imported (ssr:false) so it
   stays out of the homepage's first-load JS and only loads after hydration.
   Rendered inside the always-present (opacity-toggled) panel container, so the
   viewport clamp can still measure it. */
const NavDropdownPanel = dynamic(
  () => import("@/components/landing/NavDropdownPanel"),
  { ssr: false, loading: () => null },
);

/* ─── Mobile menu — compact drawer, rounded at the bottom, leaves a
   visible strip of the page below. ─── */

function MobileMenu({
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

type LandingNavProps = {
  locale: Locale;
  content: LandingContent;
  showPrimaryLinks?: boolean;
};

function useIsWindows() {
  const [isWin, setIsWin] = useState(false);
  useEffect(() => {
    setIsWin(/Win/i.test(navigator.userAgent));
  }, []);
  return isWin;
}

export function NavDropdown({
  item,
  open,
  onEnter,
  onLeave,
  onClick,
  placement = "down",
}: {
  item: LandingNavItem;
  open: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onClick: () => void;
  placement?: "down" | "up";
}) {
  const isWindows = useIsWindows();
  const hasChildren = item.children && item.children.length > 0;

  // Keep the dropdown panel inside the viewport. The panel is centered
  // on its trigger (translateX(-50%)); when the trigger sits near a
  // screen edge — e.g. the bottom-right hero quick-menu, where "Docs"
  // opens a wide panel — the centered panel would overflow and get
  // clipped. We measure the trigger center + the panel's own width and
  // nudge the panel horizontally so it always stays within a 12px
  // margin of both screen edges. offsetWidth and the trigger rect are
  // both unaffected by the applied shift, so there's no feedback loop.
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [shiftX, setShiftX] = useState(0);
  useEffect(() => {
    if (!open) return;
    const measure = () => {
      const wrap = wrapperRef.current;
      const panel = panelRef.current;
      if (!wrap || !panel) return;
      const margin = 12;
      const trigger = wrap.getBoundingClientRect();
      const centerX = trigger.left + trigger.width / 2;
      const width = panel.offsetWidth;
      const naturalLeft = centerX - width / 2;
      const naturalRight = centerX + width / 2;
      let next = 0;
      if (naturalRight > window.innerWidth - margin) {
        next = window.innerWidth - margin - naturalRight;
      } else if (naturalLeft < margin) {
        next = margin - naturalLeft;
      }
      setShiftX(next);
    };
    // Panels are always laid out (the menu is opacity-toggled, not
    // display:none), so offsetWidth + the trigger rect are available
    // synchronously the moment `open` flips — no rAF needed, and no
    // one-frame flash of the panel in its overflowing position.
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open]);

  // Reorder download children based on platform
  const children = (() => {
    if (!hasChildren) return item.children;
    const isDownload = item.label === "Download" || item.label === "Télécharger";
    if (!isDownload) return item.children;
    const sorted = [...item.children!];
    if (isWindows) {
      // Put Windows first
      sorted.sort((a, b) => {
        const aWin = a.label.toLowerCase().includes("windows") ? -1 : 0;
        const bWin = b.label.toLowerCase().includes("windows") ? -1 : 0;
        return aWin - bWin;
      });
    }
    // macOS/iPhone is already first by default
    return sorted;
  })();

  if (!hasChildren) {
    const isExternal =
      item.href.startsWith("http://") || item.href.startsWith("https://");
    return (
      <a
        href={item.href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noreferrer" : undefined}
        className="cursor-pointer whitespace-nowrap rounded-xl px-3 py-1.5 text-[14px] font-medium text-white/60 transition-colors duration-200 hover:text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 lg:px-4 lg:py-2 lg:text-[16px]"
      >
        {item.label}
      </a>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <button
        type="button"
        onClick={onClick}
        className={`group flex cursor-default items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-[14px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 lg:gap-2 lg:px-4 lg:py-2 lg:text-[16px] ${
          open ? "text-white/90" : "text-white/60 hover:text-white/90"
        }`}
      >
        {item.label}
        <svg
          viewBox="0 0 12 12"
          className="h-3 w-3 fill-none stroke-[1.8] text-white/25"
          style={{
            stroke: "currentColor",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 380ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <path d="M3 5l3 3 3-3" />
        </svg>
      </button>

      {/* Dropdown panel */}
      <div
        ref={panelRef}
        className={`absolute left-1/2 z-50 ${placement === "up" ? "bottom-full pb-[18px]" : "top-full pt-2"}`}
        style={{
          transform: `translateX(calc(-50% + ${shiftX}px))`,
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            background: "#141414",
            opacity: open ? 1 : 0,
            transform: open
              ? "translateY(0) translateZ(0)"
              : placement === "up"
                ? "translateY(4px) translateZ(0)"
                : "translateY(-4px) translateZ(0)",
            transition:
              "opacity 0.18s ease-out, transform 0.18s ease-out",
            willChange: "opacity, transform",
          }}
        >
          <NavDropdownPanel item={item} navChildren={children} open={open} />
        </div>
      </div>
    </div>
  );
}

/* The top-nav links (Features / Testimonials / Download / Docs / Pricing)
   now live in the bottom-right hamburger menu (see HeroSection →
   HeroQuickMenu). Flip this to `true` to bring them back into the top
   bar — the markup is kept intact below, just gated. */
const SHOW_TOP_NAV_LINKS = false;

export function LandingNav({ locale, content, showPrimaryLinks = true }: LandingNavProps) {
  const fr = locale === "fr";
  const homeHref = locale === "fr" ? "/fr" : "/";
  const [scrollProgress, setScrollProgress] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  /* `mergedWithPinned` tracks whether the pricing page's compare-plans
     sticky bar is currently pinned against us. When true we zero out
     ALL our own glass (bg + blur + border) so the sticky's extended
     backdrop is the only glass on screen — a single continuous surface
     with no seam, on every browser and DPR. Previously this was done
     via a CSS `!important` override, but the inline `transition` was
     causing Chromium to hold a `blur(0px)` intermediate state instead
     of clearing to `none`, which showed up as a visible stacked blur
     on desktop. Driving it from React state forces the inline style
     directly and wins unconditionally. */
  const [mergedWithPinned, setMergedWithPinned] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const progress = Math.min(window.scrollY / 100, 1);
      setScrollProgress(progress);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Sync with the body.compare-pinned class that the pricing page
     toggles while its sticky compare-plans header is pinned under us.
     MutationObserver on documentElement's class list is ~free. */
  useEffect(() => {
    const read = () =>
      setMergedWithPinned(document.body.classList.contains("compare-pinned"));
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (openIndex === null) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-nav-dropdown]")) {
        setOpenIndex(null);
      }
    };
    document.addEventListener("click", handleClick, { passive: true });
    return () => document.removeEventListener("click", handleClick);
  }, [openIndex]);

  const handleEnter = useCallback((index: number) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setOpenIndex(index);
  }, []);

  const handleLeave = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpenIndex(null);
    }, 150);
  }, []);

  const handleClick = useCallback((index: number) => {
    setOpenIndex(index);
  }, []);

  return (
    <>
    <header
      className="nav-enter fixed inset-x-0 top-[var(--app-banner-h,0px)] z-50 pt-[env(safe-area-inset-top)] sm:pt-0"
      style={{
        /* Both `mergedWithPinned` (compare-plans sticky merge) and
           `mobileMenuOpen` → zero our OWN glass. In both cases
           something else is providing the glass surface below us
           (the compare-plans extended backdrop in one case, the
           full-screen mobile menu panel in the other). Stacking a
           second glass layer on top of them produces a visibly
           darker / more opaque band — the exact "the nav looks
           solid black" artifact. With the nav transparent, the
           panel's glass passes through cleanly under the logo and
           the X, and the boundary between them disappears. */
        backgroundColor:
          mergedWithPinned || mobileMenuOpen
            ? "transparent"
            : `rgba(0, 0, 0, ${0.55 * scrollProgress})`,
        backdropFilter:
          mergedWithPinned || mobileMenuOpen
            ? "none"
            : `blur(${14 * scrollProgress}px)`,
        WebkitBackdropFilter:
          mergedWithPinned || mobileMenuOpen
            ? "none"
            : `blur(${14 * scrollProgress}px)`,
        /* Background + blur SNAP (no transition) so the merge/unmerge
           handoff with the compare-plans backdrop has no cross-fade
           window where the nav band is uncovered. */
      }}
    >
      <div className="mx-auto flex h-[72px] w-full max-w-[clamp(1320px,92vw,2400px)] items-center px-5 sm:h-[68px] sm:px-8 lg:h-[84px] lg:px-10">
        <Link
          href={homeHref}
          className="shrink-0 rounded-xl text-[14px] font-semibold uppercase tracking-[0.18em] text-white lg:text-[18px]"
          aria-label={content.ui.homepageAriaLabel}
        >
          vvault
        </Link>

        {SHOW_TOP_NAV_LINKS && showPrimaryLinks ? (
          <nav
            aria-label={fr ? "Principal" : "Primary"}
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 lg:flex"
            data-nav-dropdown
          >
            {content.nav.map((item, i) => (
              <NavDropdown
                key={item.label}
                item={item}
                open={openIndex === i}
                onEnter={() => handleEnter(i)}
                onLeave={handleLeave}
                onClick={() => handleClick(i)}
              />
            ))}
          </nav>
        ) : (
          <div className="ml-auto hidden lg:block" />
        )}

        <div className="ml-auto hidden items-center gap-2 lg:flex lg:gap-5">
          <LandingCtaLink
            loggedInHref="/pricing"
            loggedOutHref="/pricing"
            track={{ buttonId: "nav.try_pro", surface: "landing.nav", locale }}
            className="inline-flex items-center rounded-[8px] px-3 py-1.5 text-[14px] font-medium text-white/70 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 lg:px-4 lg:py-2 lg:text-[16px]"
          >
            {locale === "fr" ? "Essayer Pro pour 1€" : "Try Pro for €1"}
          </LandingCtaLink>
          <LandingCtaLink
            loggedInHref="https://vvault.app/login"
            loggedOutHref="https://vvault.app/login"
            track={{ buttonId: "nav.enter_app", surface: "landing.nav", locale }}
            className="inline-flex items-center rounded-full bg-[#e8e8e8] px-5 py-2 text-[14px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 lg:px-7 lg:py-2.5 lg:text-[16px]"
          >
            {locale === "fr" ? "Ouvrir l'app" : "Open App"}
          </LandingCtaLink>
        </div>

        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <LandingCtaLink
            loggedInHref="https://vvault.app/login"
            loggedOutHref="https://vvault.app/login"
            track={{ buttonId: "nav.enter_app", surface: "landing.nav_mobile", locale }}
            className="inline-flex items-center rounded-full bg-[#e8e8e8] px-4 py-2 text-[12px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
          >
            {locale === "fr" ? "Ouvrir l'app" : "Open App"}
          </LandingCtaLink>
          {/* Hamburger ↔ X morph toggle. Two separated bars on idle;
              rotate ±45° and collapse onto the same line when the
              menu opens, then reverse on close. No background on
              hover/press — the tap highlight is suppressed too, so
              the control always reads as just the bars / cross. */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={
              mobileMenuOpen
                ? fr
                  ? "Fermer le menu"
                  : "Close menu"
                : fr
                  ? "Ouvrir le menu"
                  : "Open menu"
            }
            aria-expanded={mobileMenuOpen}
            className="relative flex h-9 w-9 items-center justify-center text-white/80 transition-colors duration-200 hover:text-white"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <span className="relative block h-[18px] w-[20px]">
              <span
                className="absolute left-0 h-[1.75px] w-full rounded-full bg-current"
                style={{
                  top: "50%",
                  transform: mobileMenuOpen
                    ? "translateY(-50%) rotate(45deg)"
                    : "translateY(-50%) translateY(-5px)",
                  transition:
                    "transform 300ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              />
              <span
                className="absolute left-0 h-[1.75px] w-full rounded-full bg-current"
                style={{
                  top: "50%",
                  transform: mobileMenuOpen
                    ? "translateY(-50%) rotate(-45deg)"
                    : "translateY(-50%) translateY(5px)",
                  transition:
                    "transform 300ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              />
            </span>
          </button>
        </div>
      </div>
    </header>

    <MobileMenu
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
      content={content}
      locale={locale}
    />
    </>
  );
}
