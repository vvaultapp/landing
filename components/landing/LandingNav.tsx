"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import type { LandingContent, LandingNavItem, Locale } from "@/components/landing/content";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";

/* ─── Mobile menu (Resend-style fullscreen drawer) ─── */

function useIsIOS() {
  const [isIOS, setIsIOS] = useState(false);
  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
  }, []);
  return isIOS;
}

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
  const isIOS = useIsIOS();
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

  return (
    <div
      className="fixed inset-0 z-[60] lg:hidden"
      style={{
        pointerEvents: open ? "auto" : "none",
        visibility: open ? "visible" : "hidden",
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black"
        style={{
          opacity: open ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Panel */}
      <div
        className="relative flex h-full flex-col overflow-y-auto px-5 pb-10 pt-[env(safe-area-inset-top)] sm:px-8"
        style={{
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0)" : "translateY(-8px)",
          transition: "opacity 0.25s ease, transform 0.25s ease",
        }}
      >
        {/* Top bar: logo + close */}
        <div className="flex h-[62px] items-center justify-between sm:h-[56px]">
          <span
            className="text-[14px] font-semibold uppercase tracking-[0.18em] text-white"
            style={{ fontVariantCaps: "all-small-caps" }}
          >
            vvault
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white/60 transition-colors hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.8]">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Get Started + Download */}
        <div className="mt-4 flex flex-col gap-3">
          <LandingCtaLink
            loggedInHref="https://vvault.app/signup"
            loggedOutHref="https://vvault.app/signup"
            className="flex w-full items-center justify-center rounded-xl bg-[#1a1a1a] px-5 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#222]"
          >
            {locale === "fr" ? "Commencer" : "Get Started"}
          </LandingCtaLink>

          <a
            href="https://apps.apple.com/app/vvault/id6499137813"
            target="_blank"
            rel="noreferrer"
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-[14px] font-medium transition-colors ${
              isIOS
                ? "text-white/70 hover:text-white"
                : "pointer-events-none text-white/25"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11Z" />
            </svg>
            {locale === "fr" ? "Télécharger sur l'App Store" : "Download on the App Store"}
          </a>
        </div>

        {/* Nav items */}
        <nav className="mt-8 flex flex-col" aria-label="Mobile navigation">
          {content.nav.map((item, i) => {
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedIndex === i;

            if (!hasChildren) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center justify-between border-t border-white/[0.08] py-4 text-[15px] font-medium text-white/60 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <div key={item.label} className="border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setExpandedIndex(isExpanded ? null : i)}
                  className="flex w-full items-center justify-between py-4 text-[15px] font-medium text-white/60 transition-colors hover:text-white"
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
                          className="flex items-center gap-2 rounded-lg py-2.5 pl-3 text-[14px] text-white/40 transition-colors hover:text-white/70"
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
          <div className="border-t border-white/[0.08]" />
        </nav>
      </div>
    </div>
  );
}

type LandingNavProps = {
  locale: Locale;
  content: LandingContent;
  showPrimaryLinks?: boolean;
};

/* Inline SVG icons matching each feature page's emblem — viewBox 0 0 24 24 */
const _ICON_ALL = <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>;
const _ICON_LIBRARY = <><path d="M3.75 9.75V5.25a1.5 1.5 0 0 1 1.5-1.5h4.19a1.5 1.5 0 0 1 1.06.44l1.06 1.06a1.5 1.5 0 0 0 1.06.44h5.63a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V9.75Z" /><path d="M14.25 11.25v5.25" /><path d="M14.25 11.25l2.25-.75" /><circle cx="12.75" cy="16.5" r="1.5" /></>;
const _ICON_ANALYTICS = <><path d="M3 21h18" /><path d="M5 21V7h3v14M10 21V3h3v18M15 21v-8h3v8" /></>;
const _ICON_CAMPAIGNS = <><path d="M21.75 2.25 10.5 13.5" /><path d="M21.75 2.25l-6.75 19.5-3.75-8.25L3 9l18.75-6.75z" /></>;
const _ICON_CONTACTS = <path d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />;
const _ICON_OPPORTUNITIES = <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" /></>;
const _ICON_SALES = <><circle cx="12" cy="12" r="10" /><path d="M15 9.5c0-1.38-1.34-2.5-3-2.5S9 8.12 9 9.5s1.34 2.5 3 2.5 3 1.12 3 2.5-1.34 2.5-3 2.5-3-1.12-3-2.5M12 5v2m0 10v2" strokeLinecap="round" strokeLinejoin="round" /></>;
const _ICON_PROFILE = <><circle cx="12" cy="8" r="4" /><path d="M5.338 18.32C5.999 15.528 8.772 14 12 14s6.001 1.528 6.662 4.32c.09.38.135.57.045.738a.55.55 0 0 1-.24.243C18.296 19.4 18.1 19.4 17.706 19.4H6.294c-.394 0-.59 0-.76-.099a.55.55 0 0 1-.241-.243c-.09-.168-.046-.358.045-.738Z" /></>;
const _ICON_LINK_IN_BIO = <><path d="M13.544 10.456a4.368 4.368 0 0 0-6.176 0l-3.089 3.088a4.367 4.367 0 1 0 6.176 6.176l1.544-1.544" strokeLinecap="round" strokeLinejoin="round" /><path d="M10.456 13.544a4.368 4.368 0 0 0 6.176 0l3.089-3.088a4.367 4.367 0 1 0-6.176-6.176l-1.544 1.544" strokeLinecap="round" strokeLinejoin="round" /></>;
const _ICON_STUDIO = <path d="M3.375 19.5h17.25m-17.25 0A1.125 1.125 0 0 1 2.25 18.375M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-12.75A1.125 1.125 0 0 1 3.375 4.5h7.5c.621 0 1.125.504 1.125 1.125m0 12.75v-12.75m0 12.75h5.25c.621 0 1.125-.504 1.125-1.125V8.625m0 0-.75-.75m.75.75h3c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-3L17.25 5.25" strokeLinecap="round" strokeLinejoin="round" />;
const _ICON_CERTIFICATE = <><path d="M15.75 9.749 11.769 15.057a.726.726 0 0 1-.241.208.726.726 0 0 1-.306.09.737.737 0 0 1-.315-.046.727.727 0 0 1-.268-.172L8.25 12.749" /><path d="M10.73 1.357a1.75 1.75 0 0 1 2.54 0l1.512 1.881c.171.213.393.38.646.485.253.105.528.144.8.115l2.4-.261a1.75 1.75 0 0 1 1.72 1.72l-.261 2.4c-.03.272.01.547.115.8.105.253.272.475.485.646l1.881 1.512a1.75 1.75 0 0 1 0 2.54l-1.887 1.505a1.75 1.75 0 0 0-.6 1.447l.261 2.4a1.75 1.75 0 0 1-1.72 1.72l-2.4-.261a1.75 1.75 0 0 0-1.446.6L13.27 22.64a1.75 1.75 0 0 1-2.54 0l-1.511-1.88a1.75 1.75 0 0 0-1.447-.6l-2.4.261a1.75 1.75 0 0 1-1.72-1.72l.261-2.4a1.75 1.75 0 0 0-.6-1.447l-1.88-1.511a1.75 1.75 0 0 1 0-2.54l1.88-1.512a1.75 1.75 0 0 0 .6-1.446l-.261-2.4a1.75 1.75 0 0 1 1.72-1.72l2.4.261a1.75 1.75 0 0 0 1.447-.6l1.511-1.869Z" /></>;

const DROPDOWN_ICONS: Record<string, React.ReactNode> = {
  /* English */
  "All Features": _ICON_ALL,
  "Library": _ICON_LIBRARY,
  "Analytics": _ICON_ANALYTICS,
  "Campaigns": _ICON_CAMPAIGNS,
  "Contacts": _ICON_CONTACTS,
  "Opportunities": _ICON_OPPORTUNITIES,
  "Sales": _ICON_SALES,
  "Profile": _ICON_PROFILE,
  "Link in Bio": _ICON_LINK_IN_BIO,
  "Studio": _ICON_STUDIO,
  "Certificate": _ICON_CERTIFICATE,
  /* French */
  "Toutes les features": _ICON_ALL,
  "Bibliothèque": _ICON_LIBRARY,
  "Campagnes": _ICON_CAMPAIGNS,
  "Opportunités": _ICON_OPPORTUNITIES,
  "Ventes": _ICON_SALES,
  "Profil": _ICON_PROFILE,
  "Certificat": _ICON_CERTIFICATE,
};

function NavDropdown({
  item,
  open,
  onEnter,
  onLeave,
  onClick,
}: {
  item: LandingNavItem;
  open: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  const hasChildren = item.children && item.children.length > 0;

  if (!hasChildren) {
    const isExternal =
      item.href.startsWith("http://") || item.href.startsWith("https://");
    return (
      <a
        href={item.href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noreferrer" : undefined}
        className="whitespace-nowrap rounded-xl px-3 py-1.5 text-[14px] font-medium text-white/60 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
      >
        {item.label}
      </a>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <button
        type="button"
        onClick={onClick}
        className={`group flex items-center gap-1 whitespace-nowrap rounded-xl px-3 py-1.5 text-[14px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 ${
          open
            ? "bg-white/[0.06] text-white/90"
            : "text-white/60 hover:bg-white/[0.06] hover:text-white/90"
        }`}
      >
        {item.label}
        <svg
          viewBox="0 0 12 12"
          className={`h-3 w-3 fill-none stroke-current stroke-[1.8] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="M3 5l3 3 3-3" />
        </svg>
      </button>

      {/* Dropdown panel */}
      <div
        className="absolute left-1/2 top-full z-50 pt-2"
        style={{
          transform: "translateX(-50%)",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <div
          className="relative overflow-hidden rounded-2xl shadow-2xl shadow-black/80"
          style={{
            background: "#000",
            opacity: open ? 1 : 0,
            transform: open ? "translateY(0) scale(1)" : "translateY(-4px) scale(0.98)",
            filter: open ? "blur(0px)" : "blur(4px)",
            transition:
              "opacity 0.2s ease, transform 0.2s ease, filter 0.2s ease",
          }}
        >
          {/* Border overlay with fade mask — same as GlowCard */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            style={{
              border: "1px solid rgba(255,255,255,0.06)",
              borderBottom: "none",
              maskImage:
                "linear-gradient(to bottom, black 0%, black 30%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 0%, black 30%, transparent 100%)",
            }}
          />
          {/* Top glow line */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 15%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.04) 85%, transparent 100%)",
            }}
          />
          {/* Top glow orb */}
          <div
            className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[80px] w-[300px]"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(255,255,255,0.04) 0%, transparent 70%)",
            }}
          />
          <div
            className="p-2"
            style={{
              display: "grid",
              gridTemplateColumns: item.children!.length > 6 ? "1fr 1fr" : "1fr",
              minWidth: item.children!.length > 6 ? "420px" : "220px",
              gap: "0px",
            }}
          >
            {item.children!.map((child) => {
              const isExternal = child.external || child.href.startsWith("http://") || child.href.startsWith("https://") || child.href.startsWith("mailto:");
              const Tag = isExternal ? "a" : Link;
              const extraProps = isExternal
                ? {
                    target: child.href.startsWith("mailto:") ? undefined : "_blank" as const,
                    rel: child.href.startsWith("mailto:") ? undefined : "noreferrer",
                  }
                : {};
              const icon = item.label === "Docs" ? null : DROPDOWN_ICONS[child.label];
              return (
                <Tag
                  key={child.label}
                  href={child.href}
                  {...extraProps}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 transition-colors duration-150 hover:bg-white/[0.06]"
                >
                  {icon && (
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-[1.5]" style={{ color: "#666", stroke: "#666" }}>
                      {icon}
                    </svg>
                  )}
                  <span className="text-[13px] font-medium text-white/75">
                    {child.label}
                    {child.external && (
                      <svg
                        viewBox="0 0 12 12"
                        className="mb-px ml-1 inline h-2.5 w-2.5 fill-none stroke-current stroke-[1.5] text-white/25"
                      >
                        <path d="M4 1h7v7M11 1L5 7" />
                      </svg>
                    )}
                  </span>
                </Tag>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingNav({ locale, content, showPrimaryLinks = true }: LandingNavProps) {
  const homeHref = locale === "fr" ? "/fr" : "/";
  const [scrollProgress, setScrollProgress] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    if (openIndex === null) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-nav-dropdown]")) {
        setOpenIndex(null);
      }
    };
    document.addEventListener("click", handleClick);
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
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <>
    <header
      className="nav-enter fixed inset-x-0 top-0 z-50 border-b pt-[env(safe-area-inset-top)] sm:pt-0"
      style={{
        borderColor: `rgba(255, 255, 255, ${0.1 * scrollProgress})`,
        backgroundColor: `rgba(0, 0, 0, ${0.55 * scrollProgress})`,
        backdropFilter: `blur(${14 * scrollProgress}px)`,
        WebkitBackdropFilter: `blur(${14 * scrollProgress}px)`,
        transition: "border-color 0.3s ease, background-color 0.3s ease, backdrop-filter 0.3s ease, -webkit-backdrop-filter 0.3s ease",
      }}
    >
      <div className="mx-auto flex h-[62px] w-full max-w-[1320px] items-center px-5 sm:h-[56px] sm:px-8 lg:px-10">
        <Link
          href={homeHref}
          className="shrink-0 rounded-xl text-[14px] font-semibold uppercase tracking-[0.18em] text-white"
          aria-label={content.ui.homepageAriaLabel}
        >
          vvault
        </Link>

        {showPrimaryLinks ? (
          <nav
            aria-label="Primary"
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

        <div className="ml-auto hidden items-center gap-3 lg:flex">
          <LandingCtaLink
            loggedInHref="https://vvault.app/login"
            loggedOutHref="https://vvault.app/login"
            className="inline-flex items-center rounded-xl px-3 py-1.5 text-[14px] font-medium text-white/70 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
          >
            {locale === "fr" ? "Connexion" : "Log In"}
          </LandingCtaLink>
          <LandingCtaLink
            loggedInHref="https://vvault.app/signup"
            loggedOutHref="https://vvault.app/signup"
            className="inline-flex items-center rounded-2xl bg-[#e8e8e8] px-5 py-2 text-[14px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
          >
            {locale === "fr" ? "Commencer" : "Get Started"}
          </LandingCtaLink>
        </div>

        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <LandingCtaLink
            loggedInHref="https://vvault.app/signup"
            loggedOutHref="https://vvault.app/signup"
            className="inline-flex items-center rounded-xl bg-[#e8e8e8] px-4 py-2 text-[12px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
          >
            {locale === "fr" ? "Commencer" : "Get Started"}
          </LandingCtaLink>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/60 transition-colors hover:text-white"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
              <path d="M3 6h14M3 10h14M3 14h14" strokeLinecap="round" />
            </svg>
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
