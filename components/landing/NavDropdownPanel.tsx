"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { LandingNavItem } from "@/components/landing/content";

/* ogl bundle for the Studio card's Prism — dynamically imported so it only
   loads with this (already lazy) panel module, never on its own. */
const Prism = dynamic(() => import("@/components/landing/Prism"), {
  ssr: false,
});

/* Pulls the live Trustpilot rating from /api/landing-stats so the
   Testimonials dropdown card stays in sync with the SocialProofSection. */
function useTrustpilotScore() {
  const [score, setScore] = useState("4.7 / 5");
  useEffect(() => {
    let active = true;
    fetch("/api/landing-stats", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { trustpilotScoreLabel?: string } | null) => {
        if (!active || !data?.trustpilotScoreLabel) return;
        const trimmed = data.trustpilotScoreLabel.replace(/\s+/g, "").replace("/", " / ");
        setScore(trimmed);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return score;
}

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

/* Studio featured card — mounts the Prism ONCE on first open and keeps it
   alive so subsequent opens never pay a WebGL init cost. */
function StudioFeaturedCard({
  href,
  description,
  open,
}: {
  href: string;
  description?: string;
  open: boolean;
}) {
  const [everOpened, setEverOpened] = useState(false);

  useEffect(() => {
    if (open) setEverOpened(true);
  }, [open]);

  return (
    <Link
      href={href}
      className="group relative flex flex-1 flex-col overflow-hidden rounded-[14px]"
      style={{
        background: "linear-gradient(180deg, #0c0c10 0%, #060609 100%)",
      }}
    >
      {everOpened && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
        >
          <Prism
            animationType="rotate"
            timeScale={0.5}
            height={3.5}
            baseWidth={5.5}
            scale={3.6}
            hueShift={0}
            colorFrequency={1}
            noise={0}
            glow={1}
            suspendWhenOffscreen
          />
        </div>
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(ellipse 130% 110% at 50% 50%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.1) 45%, transparent 75%)",
        }}
      />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-2 px-4 py-8">
        <span
          className="font-sans text-white"
          style={{
            fontWeight: 900,
            fontSize: "22px",
            letterSpacing: "0.24em",
            lineHeight: 1,
            paddingLeft: "0.24em",
            color: "transparent",
            backgroundImage:
              "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.75) 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          STUDIO
        </span>
        <span className="mt-1 block text-center text-[11px] leading-snug text-white/60">
          {description || "Automated video posting"}
        </span>
      </div>
    </Link>
  );
}

/* The heavy dropdown panel content (regular links + featured cards). Lives in
   its own module so LandingNav can dynamic-import it (ssr:false) and keep all
   of this out of the homepage's first-load JS — it loads after hydration. */
export default function NavDropdownPanel({
  item,
  navChildren,
  open,
}: {
  item: LandingNavItem;
  navChildren: LandingNavItem["children"];
  open: boolean;
}) {
  const trustpilotScore = useTrustpilotScore();
  const children = navChildren;

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
          <span className="block text-[13px] font-semibold text-white/85">{trustpilotScore}</span>
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
            <StudioFeaturedCard
              href={studioChild.href}
              description={studioChild.description}
              open={open}
            />
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
}
