"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { LandingNavItem, Locale } from "@/components/landing/content";
import { getLandingContent } from "@/components/landing/content";
import { NavDropdown } from "@/components/landing/LandingNav";
import { trackButtonClick } from "@/lib/analytics/client";

/* Bottom-right quick menu — a hamburger pill (same look as the
   "Learn more" pill). On hover it reveals the nav links as a solid dark
   popup; each link reuses <NavDropdown> so it keeps the exact dropdown
   panels, cards and hover behaviour. The hamburger itself does nothing
   on click — hover only. */
function HeroQuickMenu({ items }: { items: LandingNavItem[]; locale: Locale }) {
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const menuCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMenu = () => {
    if (menuCloseRef.current) {
      clearTimeout(menuCloseRef.current);
      menuCloseRef.current = null;
    }
    setNavMenuOpen(true);
  };
  const closeMenu = () => {
    menuCloseRef.current = setTimeout(() => {
      setNavMenuOpen(false);
      setOpenIndex(null);
    }, 160);
  };
  const handleEnter = (i: number) => {
    if (itemCloseRef.current) {
      clearTimeout(itemCloseRef.current);
      itemCloseRef.current = null;
    }
    setOpenIndex(i);
  };
  const handleLeave = () => {
    itemCloseRef.current = setTimeout(() => setOpenIndex(null), 150);
  };

  return (
    <div className="relative" onMouseEnter={openMenu} onMouseLeave={closeMenu}>
      {/* Popup above the hamburger — solid dark grey, no outline. */}
      <div
        data-nav-dropdown
        className="absolute bottom-[calc(100%+12px)] right-0 rounded-2xl p-1.5 transition-[opacity,transform] duration-200"
        style={{
          /* Solid opaque panel — no blur, no outline, no shadow. */
          background: "rgb(var(--surface))",
          opacity: navMenuOpen ? 1 : 0,
          transform: navMenuOpen ? "translateY(0)" : "translateY(8px)",
          transformOrigin: "bottom right",
          pointerEvents: navMenuOpen ? "auto" : "none",
        }}
      >
        <nav className="flex items-center gap-0.5" aria-label="Quick navigation">
          {items.map((item, i) => (
            <NavDropdown
              key={item.label}
              item={item}
              open={openIndex === i}
              onEnter={() => handleEnter(i)}
              onLeave={handleLeave}
              onClick={() => {}}
              placement="up"
            />
          ))}
        </nav>
      </div>
      {/* Hamburger — hover-only, no click action. */}
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={navMenuOpen}
        className="inline-flex h-12 items-center gap-2 rounded-full bg-[rgb(var(--ov)_/_0.08)] px-5 text-[15px] font-medium text-[rgb(var(--fg)_/_0.8)] transition-colors duration-200 hover:bg-[rgb(var(--ov)_/_0.12)] hover:text-[rgb(var(--fg))]"
      >
        <svg viewBox="0 0 24 24" className="h-[20px] w-[20px]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <path d="M4 9h16" />
          <path d="M4 15h16" />
        </svg>
        Menu
      </button>
    </div>
  );
}

/* Fixed bottom-right bar (App Store "iPhone" pill + hover "Menu"). Pinned
   to the viewport on every landing page so the quick nav + app download are
   always one reach away — desktop only (lg+).

   Excluded from:
     - /docs  — the docs already have their own dense sidebar nav, and the
                floating menu would collide with it (per request).
     - /admin — private internal dashboards, not marketing surfaces.

   Locale is derived from the path (/fr…) so the nav labels match the page.
   Rendered once from the root layout, so it shows on all pages uniformly
   instead of being baked into the homepage hero. */
export function PinnedQuickMenu() {
  const pathname = usePathname() || "/";
  if (pathname.startsWith("/docs") || pathname.startsWith("/admin")) return null;

  const locale: Locale = pathname === "/fr" || pathname.startsWith("/fr/") ? "fr" : "en";
  const content = getLandingContent(locale);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-8 z-[60] mx-auto hidden max-w-[clamp(1320px,92vw,2400px)] px-5 sm:px-8 lg:flex lg:justify-end lg:px-10">
      <div className="pointer-events-auto flex items-center gap-2.5">
        {/* iPhone — App Store download, same glassmorphic pill as the
            hamburger, Apple glyph left of the label. */}
        <a
          href="/download/ios"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackButtonClick({ buttonId: "hero.download_ios", surface: "landing.pinned", locale, href: "/download/ios" })}
          aria-label={locale === "fr" ? "Télécharger sur l'App Store" : "Download on the App Store"}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-[rgb(var(--ov)_/_0.08)] px-5 text-[15px] font-medium text-[rgb(var(--fg)_/_0.8)] transition-colors duration-200 hover:bg-[rgb(var(--ov)_/_0.12)] hover:text-[rgb(var(--fg))]"
        >
          <svg viewBox="0 0 384 512" className="h-[18px] w-[18px] -translate-y-px" fill="currentColor" aria-hidden="true">
            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
          </svg>
          iPhone
        </a>
        <HeroQuickMenu items={content.nav} locale={locale} />
      </div>
    </div>
  );
}
