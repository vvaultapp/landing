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
            background:
              "linear-gradient(180deg, rgba(8,8,10,0.98) 0%, rgba(4,4,5,1) 100%)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
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
              return (
                <Tag
                  key={child.label}
                  href={child.href}
                  {...extraProps}
                  className="flex flex-col gap-0.5 rounded-xl px-3 py-2 transition-colors duration-150 hover:bg-white/[0.05]"
                >
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
                  {child.description && (
                    <span className="text-[11px] text-white/28">
                      {child.description}
                    </span>
                  )}
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
