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
  const fr = locale === "fr";
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
            aria-label={fr ? "Fermer le menu" : "Close menu"}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white/60 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white"
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
            className="flex w-full items-center justify-center rounded-xl bg-[#1a1a1a] px-5 py-3.5 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-[#222]"
          >
            {locale === "fr" ? "Commencer" : "Get Started"}
          </LandingCtaLink>

          <a
            href="https://apps.apple.com/app/id6759256796"
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-[14px] font-medium transition-colors duration-200 ${
              isIOS
                ? "text-white/70 hover:bg-white/[0.06] hover:text-white"
                : "pointer-events-none text-white/25"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" style={{ transform: "translateY(-1.5px)" }}>
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11Z" />
            </svg>
            {locale === "fr" ? "Télécharger sur l'App Store" : "Download on the App Store"}
          </a>
        </div>

        {/* Nav items */}
        <nav className="mt-8 flex flex-col" aria-label={fr ? "Navigation mobile" : "Mobile navigation"}>
          {content.nav.map((item, i) => {
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedIndex === i;

            if (!hasChildren) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center justify-between border-t border-white/[0.08] py-4 text-[15px] font-medium text-white/60 transition-colors duration-200 hover:text-white"
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
                  className="flex w-full items-center justify-between py-4 text-[15px] font-medium text-white/60 transition-colors duration-200 hover:text-white"
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
                          className="flex items-center gap-2 rounded-lg py-2.5 pl-3 text-[14px] text-white/40 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white/70"
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
const _ICON_STUDIO = "studio-image" as unknown as React.ReactNode;
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
  "Toutes les fonctionnalités": _ICON_ALL,
  "Bibliothèque": _ICON_LIBRARY,
  "Campagnes": _ICON_CAMPAIGNS,
  "Opportunités": _ICON_OPPORTUNITIES,
  "Ventes": _ICON_SALES,
  "Profil": _ICON_PROFILE,
  "Certificat": _ICON_CERTIFICATE,
  "Analytiques": _ICON_ANALYTICS,
  "Lien en Bio": _ICON_LINK_IN_BIO,
};

function useIsMac() {
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);
  return isMac;
}

function useIsWindows() {
  const [isWin, setIsWin] = useState(false);
  useEffect(() => {
    setIsWin(/Win/i.test(navigator.userAgent));
  }, []);
  return isWin;
}

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
  const isMac = useIsMac();
  const isWindows = useIsWindows();
  const hasChildren = item.children && item.children.length > 0;

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
        className="cursor-pointer whitespace-nowrap rounded-xl px-3 py-1.5 text-[14px] font-medium text-white/60 transition-colors duration-200 hover:text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
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
        className={`group flex cursor-default items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-[14px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 ${
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
            transform: open ? "translateY(0) translateZ(0)" : "translateY(-4px) translateZ(0)",
            transition:
              "opacity 0.18s ease-out, transform 0.18s ease-out",
            willChange: "opacity, transform",
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
          {(() => {
            const isFeatures = item.label === "Features" || item.label === "Fonctionnalités";
            const studioChild = isFeatures ? children!.find((c) => c.label === "Studio") : null;
            const featuredChildren = children!.filter((c) => c.featured);
            const regularChildren = children!.filter((c) => !c.featured && c !== studioChild);
            const hasFeaturedPanel = studioChild || featuredChildren.length > 0;

            const renderChild = (child: typeof children extends (infer U)[] | undefined ? U : never) => {
              const isExternal = child.external || child.href.startsWith("http://") || child.href.startsWith("https://") || child.href.startsWith("mailto:");
              const Tag = isExternal ? "a" : Link;
              const extraProps = isExternal
                ? {
                    target: child.href.startsWith("mailto:") ? undefined : "_blank" as const,
                    rel: child.href.startsWith("mailto:") ? undefined : "noreferrer",
                  }
                : {};
              const icon = (item.label === "Docs" || item.label === "Help" || item.label === "Aide") ? null : DROPDOWN_ICONS[child.label];
              return (
                <Tag
                  key={child.label}
                  href={child.href}
                  {...extraProps}
                  className="flex h-9 items-center gap-2 rounded-xl px-3 transition-colors duration-150 hover:bg-white/[0.06]"
                  style={{ contain: "layout" }}
                >
                  {icon ? (
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center" style={{ transform: "translateZ(0)" }}>
                      <svg viewBox="0 0 24 24" className="block h-4 w-4 fill-none stroke-[1.5]" style={{ color: "#666", stroke: "#666" }}>
                        {icon}
                      </svg>
                    </div>
                  ) : null}
                  <span className="text-[13px] font-medium leading-none text-white/75 whitespace-nowrap">
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
            };

            /* ── Featured card wrapper — gradient border via background trick ── */
            const FeaturedCardWrap = ({ children: cardChildren, href, external, className = "" }: { children: React.ReactNode; href: string; external?: boolean; className?: string }) => {
              const isExt = external || href.startsWith("http://") || href.startsWith("https://");
              const Tag = isExt ? "a" : Link;
              const extraProps = isExt ? { target: "_blank" as const, rel: "noreferrer" } : {};
              return (
                <Tag href={href} {...extraProps} className={`group relative flex flex-1 flex-col rounded-[14px] p-px ${className}`}
                  style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.01) 100%)",
                  }}
                >
                  {/* Inner fill */}
                  <div className="relative flex h-full flex-1 flex-col overflow-hidden rounded-[13px] transition-colors duration-300"
                    style={{ background: "linear-gradient(180deg, #0e0e0e 0%, #090909 100%)" }}
                  >
                    {/* Hover glow — soft radial from top */}
                    <div className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ background: "radial-gradient(ellipse 90% 50% at 50% 0%, rgba(255,255,255,0.05) 0%, transparent 70%)" }}
                    />
                    {/* Content */}
                    <div className="relative z-10 flex h-full flex-1 flex-col">{cardChildren}</div>
                  </div>
                </Tag>
              );
            };

            /* ── Trustpilot star card (testimonials) ── */
            const isTrustpilotCard = (child: { label: string }) => child.label === "Trustpilot";

            const renderTrustpilotCard = (child: typeof children extends (infer U)[] | undefined ? U : never) => (
              <FeaturedCardWrap key={child.label} href={child.href} external={child.external}>
                <div className="flex flex-1 flex-col items-center justify-center gap-2.5 px-3 py-4">
                  {/* Trustpilot logo */}
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                    <path d="M12 2l2.09 6.26h6.6l-5.34 3.87 2.04 6.28L12 14.56l-5.39 3.85 2.04-6.28L3.31 8.26h6.6L12 2z" fill="#00b67a" />
                  </svg>
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="flex h-[14px] w-[14px] items-center justify-center rounded-[2px] bg-[#00b67a]">
                        <svg viewBox="0 0 12 12" className="h-[9px] w-[9px] fill-white"><path d="M6 1l1.25 3.75h3.94l-3.19 2.32 1.22 3.75L6 8.5 2.78 10.82 4 7.07.81 4.75h3.94L6 1z" /></svg>
                      </div>
                    ))}
                    <div className="relative flex h-[14px] w-[14px] items-center justify-center overflow-hidden rounded-[2px] bg-[#dcdce6]">
                      <div className="absolute inset-y-0 left-0 w-1/2 bg-[#00b67a]" />
                      <svg viewBox="0 0 12 12" className="relative z-10 h-[9px] w-[9px] fill-white"><path d="M6 1l1.25 3.75h3.94l-3.19 2.32 1.22 3.75L6 8.5 2.78 10.82 4 7.07.81 4.75h3.94L6 1z" /></svg>
                    </div>
                  </div>
                  <div className="text-center">
                    {/* TODO: receive trustpilot score from server-side fetch */}
                    <span className="block text-[13px] font-semibold text-white/85">4.5 / 5</span>
                    <span className="mt-0.5 block text-[10px] text-white/35">{child.description}</span>
                  </div>
                </div>
              </FeaturedCardWrap>
            );

            /* ── Video card (YouTube thumbnail) ── */
            const renderVideoCard = (child: typeof children extends (infer U)[] | undefined ? U : never) => {
              const videoId = child.href.match(/(?:embed\/|v=|youtu\.be\/)([^?&/]+)/)?.[1] || "";
              return (
                <FeaturedCardWrap key={child.label} href={child.href} external>
                  <div className="relative mx-1.5 mt-1.5 overflow-hidden rounded-lg" style={{ aspectRatio: "16/9" }}>
                    <img src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
                        <svg viewBox="0 0 16 16" className="ml-0.5 h-3 w-3 fill-white"><path d="M5 3.5l8 4.5-8 4.5V3.5z" /></svg>
                      </div>
                    </div>
                  </div>
                  <div className="px-3 py-2 text-center">
                    <span className="text-[12px] font-medium text-white/80">{child.label}</span>
                    {child.description && <span className="mt-0.5 block text-[10px] text-white/35">{child.description}</span>}
                  </div>
                </FeaturedCardWrap>
              );
            };

            /* ── Discord card ── */
            const isDiscordCard = (child: { href: string }) => child.href.includes("discord.gg");
            const renderDiscordCard = (child: typeof children extends (infer U)[] | undefined ? U : never) => (
              <FeaturedCardWrap key={child.label} href={child.href} external>
                <div className="flex flex-1 flex-col items-center justify-center gap-2.5 px-3 py-4">
                  {/* Discord icon */}
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #5865F2 0%, #4752c4 100%)" }}>
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.227-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <span className="block text-[13px] font-semibold text-white/85">{child.label}</span>
                    <span className="mt-0.5 block text-[10px] text-white/35">{child.description}</span>
                  </div>
                </div>
              </FeaturedCardWrap>
            );

            /* ── "For X" audience cards with icons ── */
            /* Headphones icon for producers, users icon for labels */
            /* Filled icons — no stroke overlap artifacts */
            const _producerIcon = (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M12 1a11 11 0 0 0-11 11v7a3 3 0 0 0 3 3h1a3 3 0 0 0 3-3v-3a3 3 0 0 0-3-3H3.06A9 9 0 0 1 21 12h-.06a3 3 0 0 0-2.94 3v3a3 3 0 0 0 3 3h-2a1 1 0 0 1 0-2h1a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h2v1a3 3 0 0 1-3 3h-2" opacity="0" />
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2.75A9.25 9.25 0 0 0 2.75 12v2.25H5a2.25 2.25 0 0 1 2.25 2.25v3A2.25 2.25 0 0 1 5 21.75H4A2.25 2.25 0 0 1 1.75 19.5V12a10.25 10.25 0 0 1 20.5 0v7.5A2.25 2.25 0 0 1 20 21.75h-1a2.25 2.25 0 0 1-2.25-2.25v-3A2.25 2.25 0 0 1 19 14.25h2.25V12A9.25 9.25 0 0 0 12 2.75zM3.25 15.75V19.5a.75.75 0 0 0 .75.75h1a.75.75 0 0 0 .75-.75v-3a.75.75 0 0 0-.75-.75H3.25zm17.5 0H19a.75.75 0 0 0-.75.75v3c0 .414.336.75.75.75h1a.75.75 0 0 0 .75-.75V15.75z" />
              </svg>
            );
            const _labelsIcon = (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M3.75 5A1.25 1.25 0 0 1 5 3.75h14A1.25 1.25 0 0 1 20.25 5v14A1.25 1.25 0 0 1 19 20.25H5A1.25 1.25 0 0 1 3.75 19V5ZM5 2.25A2.75 2.75 0 0 0 2.25 5v14A2.75 2.75 0 0 0 5 21.75h14A2.75 2.75 0 0 0 21.75 19V5A2.75 2.75 0 0 0 19 2.25H5ZM7.25 7a.75.75 0 0 1 .75-.75h8a.75.75 0 0 1 0 1.5H8A.75.75 0 0 1 7.25 7Zm0 4a.75.75 0 0 1 .75-.75h8a.75.75 0 0 1 0 1.5H8a.75.75 0 0 1-.75-.75Zm0 4a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 0 1.5H8a.75.75 0 0 1-.75-.75Z" />
              </svg>
            );
            const audienceIcons: Record<string, React.ReactNode> = {
              "For Producers": _producerIcon,
              "Pour Producteurs": _producerIcon,
              "Pour les producteurs": _producerIcon,
              "For Labels": _labelsIcon,
              "Pour Labels": _labelsIcon,
              "Pour les labels": _labelsIcon,
            };
            const isAudienceCard = (child: { label: string }) => child.label in audienceIcons;
            const renderAudienceCard = (child: typeof children extends (infer U)[] | undefined ? U : never) => (
              <FeaturedCardWrap key={child.label} href={child.href} external={child.external}>
                <div className="flex flex-1 items-center gap-3 px-3.5 py-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/50" style={{ background: "rgba(255,255,255,0.06)" }}>
                    {audienceIcons[child.label]}
                  </div>
                  <div>
                    <span className="block text-[13px] font-semibold text-white/85">{child.label}</span>
                    {child.description && <span className="mt-0.5 block text-[10px] text-white/35">{child.description}</span>}
                  </div>
                </div>
              </FeaturedCardWrap>
            );

            /* ── Generic featured card (fallback) ── */
            const renderGenericFeaturedCard = (child: typeof children extends (infer U)[] | undefined ? U : never) => {
              return (
                <FeaturedCardWrap key={child.label} href={child.href} external={child.external} className="items-center justify-center">
                  <div className="flex flex-1 flex-col items-center justify-center gap-1 px-3 py-4">
                    <span className="text-[13px] font-medium text-white/80">{child.label}</span>
                    {child.description && <span className="text-[11px] text-white/35">{child.description}</span>}
                  </div>
                </FeaturedCardWrap>
              );
            };

            const renderFeaturedCard = (child: typeof children extends (infer U)[] | undefined ? U : never) => {
              if (isTrustpilotCard(child)) return renderTrustpilotCard(child);
              if (isDiscordCard(child)) return renderDiscordCard(child);
              if (isAudienceCard(child)) return renderAudienceCard(child);
              if (child.href.startsWith("https://www.youtube.com/")) return renderVideoCard(child);
              return renderGenericFeaturedCard(child);
            };

            if (hasFeaturedPanel) {
              const hasVideoCard = featuredChildren.some((c) => c.href.includes("youtube.com"));
              const featuredPanelWidth = studioChild ? "w-[180px]" : hasVideoCard ? "w-[200px]" : featuredChildren.length > 1 ? "w-[220px]" : "w-[180px]";
              return (
                <div className="flex" style={{ minWidth: hasFeaturedPanel ? (regularChildren.length > 5 ? "520px" : "380px") : undefined }}>
                  {/* Regular links — left side */}
                  <div
                    className="flex-1 p-2"
                    style={{
                      display: "grid",
                      gridTemplateColumns: regularChildren.length > 5 ? "1fr 1fr" : "1fr",
                      gap: "0px",
                      alignContent: "start",
                    }}
                  >
                    {regularChildren.map((child) => renderChild(child))}
                  </div>
                  {/* Featured cards — right side */}
                  <div className={`flex ${featuredPanelWidth} shrink-0 flex-col gap-2 p-2`}>
                    {studioChild && (
                      <FeaturedCardWrap href={studioChild.href}>
                        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-3 py-4">
                        {/* Mini emblem */}
                        <div
                          className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-[14px]"
                          style={{
                            background: "linear-gradient(160deg, rgba(30,30,35,0.6) 0%, rgba(8,8,10,0.95) 35%, rgba(0,0,0,1) 100%)",
                            boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.07), 0 4px 16px -3px rgba(0,0,0,0.5)",
                            border: "0.5px solid rgba(255,255,255,0.08)",
                          }}
                        >
                          <div
                            className="pointer-events-none absolute inset-0 opacity-[0.03]"
                            style={{
                              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
                            }}
                          />
                          <div
                            className="pointer-events-none absolute inset-x-[15%] top-0 h-px"
                            style={{
                              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.1) 70%, transparent 100%)",
                            }}
                          />
                          <div
                            className="relative z-10 h-9 w-9"
                            style={{
                              WebkitMaskImage: "url('/vvault-studio-logo.png')",
                              maskImage: "url('/vvault-studio-logo.png')",
                              WebkitMaskSize: "contain",
                              maskSize: "contain",
                              WebkitMaskRepeat: "no-repeat",
                              maskRepeat: "no-repeat",
                              WebkitMaskPosition: "center",
                              maskPosition: "center",
                              background: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(230,232,238,0.85) 22%, rgba(190,195,205,0.75) 55%, rgba(150,155,165,0.72) 82%, rgba(210,214,222,0.85) 100%)",
                            }}
                          />
                        </div>
                        <div className="text-center">
                          <span className="block text-[13px] font-semibold text-white/85">vvault Studio</span>
                          <span className="mt-0.5 block text-[11px] text-white/40">{studioChild.description || "Automated video posting"}</span>
                        </div>
                        </div>
                      </FeaturedCardWrap>
                    )}
                    {featuredChildren.map((child) => renderFeaturedCard(child))}
                  </div>
                </div>
              );
            }

            return (
              <div
                className="p-2"
                style={{
                  display: "grid",
                  gridTemplateColumns: children!.length > 6 ? "1fr 1fr" : "1fr",
                  minWidth: children!.length > 6 ? "420px" : "220px",
                  gap: "0px",
                }}
              >
                {children!.map((child) => renderChild(child))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

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
      className="nav-enter fixed inset-x-0 top-0 z-50 border-b pt-[env(safe-area-inset-top)] sm:pt-0"
      style={{
        /* When the compare-plans sticky is pinned against us, zero our
           own glass completely so its extended backdrop is the only
           surface rendered between y=0 and the bottom of the pinned
           bar. When not pinned, fade in our own glass proportional to
           scroll progress. */
        borderColor: mergedWithPinned
          ? "transparent"
          : `rgba(255, 255, 255, ${0.1 * scrollProgress})`,
        backgroundColor: mergedWithPinned
          ? "transparent"
          : `rgba(0, 0, 0, ${0.55 * scrollProgress})`,
        backdropFilter: mergedWithPinned ? "none" : `blur(${14 * scrollProgress}px)`,
        WebkitBackdropFilter: mergedWithPinned
          ? "none"
          : `blur(${14 * scrollProgress}px)`,
        transition:
          "border-color 0.3s ease, background-color 0.3s ease, backdrop-filter 0.3s ease, -webkit-backdrop-filter 0.3s ease",
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
            className="inline-flex items-center rounded-xl bg-[#e8e8e8] px-5 py-2 text-[14px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
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
            aria-label={fr ? "Ouvrir le menu" : "Open menu"}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/60 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white"
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
