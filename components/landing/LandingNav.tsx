"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import type { LandingContent, LandingNavItem, Locale } from "@/components/landing/content";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";

type LandingNavProps = {
  locale: Locale;
  content: LandingContent;
  showPrimaryLinks?: boolean;
};

/* Inline SVG icons matching each feature page's emblem — viewBox 0 0 24 24 */
const DROPDOWN_ICONS: Record<string, React.ReactNode> = {
  "All Features": <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  "Library": <><path d="M3.75 9.75V5.25a1.5 1.5 0 0 1 1.5-1.5h4.19a1.5 1.5 0 0 1 1.06.44l1.06 1.06a1.5 1.5 0 0 0 1.06.44h5.63a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V9.75Z" /><path d="M14.25 11.25v5.25" /><path d="M14.25 11.25l2.25-.75" /><circle cx="12.75" cy="16.5" r="1.5" /></>,
  "Analytics": <><path d="M3 21h18" /><path d="M5 21V7h3v14M10 21V3h3v18M15 21v-8h3v8" /></>,
  "Campaigns": <><path d="M21.75 2.25 10.5 13.5" /><path d="M21.75 2.25l-6.75 19.5-3.75-8.25L3 9l18.75-6.75z" /></>,
  "Contacts": <path d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />,
  "Opportunities": <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" /></>,
  "Sales": <><circle cx="12" cy="12" r="10" /><path d="M15 9.5c0-1.38-1.34-2.5-3-2.5S9 8.12 9 9.5s1.34 2.5 3 2.5 3 1.12 3 2.5-1.34 2.5-3 2.5-3-1.12-3-2.5M12 5v2m0 10v2" strokeLinecap="round" strokeLinejoin="round" /></>,
  "Profile": <><circle cx="12" cy="8" r="4" /><path d="M5.338 18.32C5.999 15.528 8.772 14 12 14s6.001 1.528 6.662 4.32c.09.38.135.57.045.738a.55.55 0 0 1-.24.243C18.296 19.4 18.1 19.4 17.706 19.4H6.294c-.394 0-.59 0-.76-.099a.55.55 0 0 1-.241-.243c-.09-.168-.046-.358.045-.738Z" /></>,
  "Link in Bio": <><path d="M13.544 10.456a4.368 4.368 0 0 0-6.176 0l-3.089 3.088a4.367 4.367 0 1 0 6.176 6.176l1.544-1.544" strokeLinecap="round" strokeLinejoin="round" /><path d="M10.456 13.544a4.368 4.368 0 0 0 6.176 0l3.089-3.088a4.367 4.367 0 1 0-6.176-6.176l-1.544 1.544" strokeLinecap="round" strokeLinejoin="round" /></>,
  "Studio": <path d="M3.375 19.5h17.25m-17.25 0A1.125 1.125 0 0 1 2.25 18.375M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-12.75A1.125 1.125 0 0 1 3.375 4.5h7.5c.621 0 1.125.504 1.125 1.125m0 12.75v-12.75m0 12.75h5.25c.621 0 1.125-.504 1.125-1.125V8.625m0 0-.75-.75m.75.75h3c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-3L17.25 5.25" strokeLinecap="round" strokeLinejoin="round" />,
  "Certificate": <><path d="M15.75 9.749 11.769 15.057a.726.726 0 0 1-.241.208.726.726 0 0 1-.306.09.737.737 0 0 1-.315-.046.727.727 0 0 1-.268-.172L8.25 12.749" /><path d="M10.73 1.357a1.75 1.75 0 0 1 2.54 0l1.512 1.881c.171.213.393.38.646.485.253.105.528.144.8.115l2.4-.261a1.75 1.75 0 0 1 1.72 1.72l-.261 2.4c-.03.272.01.547.115.8.105.253.272.475.485.646l1.881 1.512a1.75 1.75 0 0 1 0 2.54l-1.887 1.505a1.75 1.75 0 0 0-.6 1.447l.261 2.4a1.75 1.75 0 0 1-1.72 1.72l-2.4-.261a1.75 1.75 0 0 0-1.446.6L13.27 22.64a1.75 1.75 0 0 1-2.54 0l-1.511-1.88a1.75 1.75 0 0 0-1.447-.6l-2.4.261a1.75 1.75 0 0 1-1.72-1.72l.261-2.4a1.75 1.75 0 0 0-.6-1.447l-1.88-1.511a1.75 1.75 0 0 1 0-2.54l1.88-1.512a1.75 1.75 0 0 0 .6-1.446l-.261-2.4a1.75 1.75 0 0 1 1.72-1.72l2.4.261a1.75 1.75 0 0 0 1.447-.6l1.511-1.869Z" /></>,
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
              const icon = DROPDOWN_ICONS[child.label];
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
            Log In
          </LandingCtaLink>
          <LandingCtaLink
            loggedInHref="https://vvault.app/signup"
            loggedOutHref="https://vvault.app/signup"
            className="inline-flex items-center rounded-2xl bg-[#e8e8e8] px-5 py-2 text-[14px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
          >
            Get Started
          </LandingCtaLink>
        </div>

        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <LandingCtaLink
            loggedInHref="https://vvault.app/login"
            loggedOutHref="https://vvault.app/login"
            className="inline-flex items-center rounded-xl px-3 py-1.5 text-[13px] font-medium text-white/70 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
          >
            Log In
          </LandingCtaLink>
          <LandingCtaLink
            loggedInHref="https://vvault.app/signup"
            loggedOutHref="https://vvault.app/signup"
            className="inline-flex items-center rounded-2xl bg-[#e8e8e8] px-4 py-2 text-[12px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
          >
            Get Started
          </LandingCtaLink>
        </div>
      </div>
    </header>
  );
}
