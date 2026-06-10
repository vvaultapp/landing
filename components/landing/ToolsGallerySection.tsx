"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/components/landing/content";
import type {
  LandingNewContent,
  LandingNewToolId,
  LandingNewToolMeta,
} from "@/components/landing/contentNew";
import { Reveal } from "@/components/landing/Reveal";
import { StreamlineIcon, type StreamlineIconName } from "@/components/landing/StreamlineIcon";
import { LibraryMiniUI } from "@/components/landing/tools/LibraryMiniUI";
import { CampaignsMiniUI } from "@/components/landing/tools/CampaignsMiniUI";
import { AnalyticsMiniUI } from "@/components/landing/tools/AnalyticsMiniUI";
import { ContactsMiniUI } from "@/components/landing/tools/ContactsMiniUI";
import { SalesMiniUI } from "@/components/landing/tools/SalesMiniUI";
import { StudioMiniUI } from "@/components/landing/tools/StudioMiniUI";
import { ProfileMiniUI } from "@/components/landing/tools/ProfileMiniUI";
import { CertificateMiniUI } from "@/components/landing/tools/CertificateMiniUI";
import { trackButtonClick } from "@/lib/analytics/client";

/* Maps each tool id to a streamline-solar icon name. The stroke
   colour comes from the tool's accent so the emblem still ties to
   the card's hover glow. */
const TOOL_ICON: Record<LandingNewToolId, StreamlineIconName> = {
  library: "music-library",
  campaigns: "letter",
  analytics: "graph",
  contacts: "users-group",
  sales: "card",
  studio: "clapperboard",
  profile: "iphone",
  certificate: "verified-check",
};

function ToolIcon({ id }: { id: LandingNewToolId; accent: string }) {
  /* Icons render in a fully-opaque mid grey so overlapping stroke
     lines never produce double-line artifacts. Accent colour is
     intentionally not used here — only the mini-UI content keeps
     the per-tool accent. */
  return (
    <StreamlineIcon
      name={TOOL_ICON[id]}
      color="rgb(190,190,195)"
      strokeWidth={14}
      className="h-[20px] w-[20px]"
    />
  );
}

function ToolMini({
  id,
  locale,
}: {
  id: LandingNewToolId;
  locale: Locale;
}) {
  switch (id) {
    case "library":
      return <LibraryMiniUI locale={locale} />;
    case "campaigns":
      return <CampaignsMiniUI locale={locale} />;
    case "analytics":
      return <AnalyticsMiniUI locale={locale} />;
    case "contacts":
      return <ContactsMiniUI locale={locale} />;
    case "sales":
      return <SalesMiniUI locale={locale} />;
    case "studio":
      return <StudioMiniUI locale={locale} />;
    case "profile":
      return <ProfileMiniUI locale={locale} />;
    case "certificate":
      return <CertificateMiniUI locale={locale} />;
    default:
      return null;
  }
}

function ToolCard({
  tool,
  locale,
  forceOpen,
  onToggle,
}: {
  tool: LandingNewToolMeta;
  locale: Locale;
  forceOpen: boolean;
  onToggle: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const expanded = hovered || forceOpen;

  return (
    <Link
      href={tool.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => {
        /* On touch devices, the first tap toggles expand instead of
           navigating. The second tap (when forceOpen is true) follows
           the link. Desktop hover users get the hover-to-expand
           behaviour and the click always navigates. */
        const isTouch =
          typeof window !== "undefined" &&
          window.matchMedia("(hover: none)").matches;
        if (isTouch && !forceOpen) {
          e.preventDefault();
          onToggle();
        }
        trackButtonClick({
          buttonId: `toolsGallery.card.${tool.id}`,
          surface: "landing.new.tools_gallery",
          locale,
          href: tool.href,
        });
      }}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl p-5 transition-transform duration-500 ease-out hover:-translate-y-1 sm:p-6"
      style={{
        background: "#000000",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.04)",
        /* Same GPU-layer promotion as ProblemGap: prevents the
           hover translate from re-rasterising the card's text and
           giving it a 1-frame flicker on hover. */
        transform: "translateZ(0)",
        willChange: "transform",
        backfaceVisibility: "hidden",
      }}
    >
      {/* Top accent line — neutral white, lights up softly on hover.
          No per-tool colour leaks onto the card chrome. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px transition-opacity duration-500"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)",
          opacity: expanded ? 0.9 : 0.3,
        }}
      />

      {/* HEADER: icon emblem + name */}
      <div className="relative flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{
              background:
                "linear-gradient(160deg, rgba(30,30,35,0.7) 0%, rgba(10,10,12,1) 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.06)",
            }}
          >
            <ToolIcon id={tool.id} accent={tool.accent} />
          </div>
          <h3 className="text-[15px] font-semibold text-[rgb(var(--fg))] sm:text-[15.5px]">
            {tool.name}
          </h3>
        </div>
        <svg
          viewBox="0 0 20 20"
          className="h-4 w-4 fill-none stroke-current text-[rgb(var(--fg)_/_0.25)] stroke-[1.6] transition-all duration-300 group-hover:translate-x-1 group-hover:text-[rgb(var(--fg)_/_0.65)]"
        >
          <path d="M4 10h11M11 6l4 4-4 4" />
        </svg>
      </div>

      {/* One-liner */}
      <p className="relative mt-2 text-[12.5px] leading-relaxed text-[rgb(var(--fg)_/_0.45)] sm:text-[13px]">
        {tool.oneLiner}
      </p>

      {/* MINI-UI preview area
          Uses max-height transition so the preview reveals smoothly
          on hover/tap. Always rendered (so we don't pay mount cost
          on hover) but clipped when collapsed. */}
      <div
        className="relative mt-4 overflow-hidden rounded-xl transition-all duration-500 ease-out"
        style={{
          background: "rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.04)",
          maxHeight: expanded ? "260px" : "84px",
        }}
      >
        <div className="p-3 sm:p-3.5" style={{ minHeight: 220 }}>
          <ToolMini id={tool.id} locale={locale} />
        </div>
        {/* Fade overlay when collapsed — uses the same black as the
            card so the preview blends into the card surface. */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-12 transition-opacity duration-500"
          style={{
            background:
              "linear-gradient(to top, #000 0%, rgba(0,0,0,0.7) 50%, transparent 100%)",
            opacity: expanded ? 0 : 1,
          }}
        />
      </div>
    </Link>
  );
}

type ToolsGallerySectionProps = {
  content: LandingNewContent;
  locale?: Locale;
};

export function ToolsGallerySection({
  content,
  locale = "en",
}: ToolsGallerySectionProps) {
  const c = content.toolsGallery;
  const [openId, setOpenId] = useState<LandingNewToolId | null>(null);

  return (
    <section
      id="tools"
      className="relative pt-24 pb-20 sm:pt-32 sm:pb-28"
    >
      <div className="mx-auto w-full max-w-[clamp(1320px,92vw,2400px)] px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div className="text-center">
            <h3 className="mx-auto max-w-[820px] text-[1.55rem] font-medium leading-tight tracking-tight text-[rgb(var(--fg))] sm:text-3xl lg:text-[2.2rem]">
              {c.titleLine1}
              <br />
              <span className="text-[rgb(var(--fg)_/_0.4)]">{c.titleLine2}</span>
            </h3>
            <p className="mx-auto mt-4 max-w-[560px] text-[14px] leading-relaxed text-[rgb(var(--fg)_/_0.4)] sm:text-[15px]">
              {c.subtitle}
            </p>
            <p className="tools-hover-hint mt-3 text-[11.5px] font-medium tracking-[0.02em] text-[rgb(var(--fg)_/_0.3)]">
              {c.hintHover}
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-5">
          {c.tools.map((tool, i) => (
            <Reveal
              key={tool.id}
              delayMs={i * 70}
              className={tool.mobilePrimary ? undefined : "hidden sm:block"}
            >
              <ToolCard
                tool={tool}
                locale={locale}
                forceOpen={openId === tool.id}
                onToggle={() =>
                  setOpenId((prev) => (prev === tool.id ? null : tool.id))
                }
              />
            </Reveal>
          ))}
        </div>

        {/* Mobile-only "View all features" link. Sends users to the
            full features index so the trimmed 4-card mobile preview
            doesn't feel like the whole story. Hidden on sm+ where
            every tool card is already on screen. */}
        <div className="mt-6 flex justify-center sm:hidden">
          <Link
            href="/features"
            onClick={() =>
              trackButtonClick({
                buttonId: "toolsGallery.view_all_features",
                surface: "landing.new.tools_gallery",
                locale,
                href: "/features",
              })
            }
            className="inline-flex items-center gap-2 rounded-[8px] border border-[rgb(var(--ov)_/_0.1)] bg-[rgb(var(--ov)_/_0.03)] px-5 py-2.5 text-[13px] font-semibold text-[rgb(var(--fg)_/_0.85)] active:bg-[rgb(var(--ov)_/_0.07)]"
          >
            {locale === "fr" ? "Voir toutes les fonctionnalités" : "View all features"}
            <svg
              viewBox="0 0 20 20"
              className="h-3.5 w-3.5 fill-none stroke-current stroke-[1.8]"
            >
              <path d="M4 10h11M11 6l4 4-4 4" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
