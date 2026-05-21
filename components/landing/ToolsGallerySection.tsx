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
import { LibraryMiniUI } from "@/components/landing/tools/LibraryMiniUI";
import { CampaignsMiniUI } from "@/components/landing/tools/CampaignsMiniUI";
import { AnalyticsMiniUI } from "@/components/landing/tools/AnalyticsMiniUI";
import { ContactsMiniUI } from "@/components/landing/tools/ContactsMiniUI";
import { SalesMiniUI } from "@/components/landing/tools/SalesMiniUI";
import { StudioMiniUI } from "@/components/landing/tools/StudioMiniUI";
import { ProfileMiniUI } from "@/components/landing/tools/ProfileMiniUI";
import { CertificateMiniUI } from "@/components/landing/tools/CertificateMiniUI";
import { trackButtonClick } from "@/lib/analytics/client";

function ToolIcon({ id, accent }: { id: LandingNewToolId; accent: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: accent,
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-[18px] w-[18px]",
  };
  switch (id) {
    case "library":
      return (
        <svg {...common}>
          <path d="M3 4h4v16H3zM10 4h4v16h-4zM16 6l4 1-3 13-4-1z" />
        </svg>
      );
    case "campaigns":
      return (
        <svg {...common}>
          <path d="M3 8l9 6 9-6" />
          <rect x="3" y="6" width="18" height="14" rx="2" />
        </svg>
      );
    case "analytics":
      return (
        <svg {...common}>
          <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
        </svg>
      );
    case "contacts":
      return (
        <svg {...common}>
          <circle cx="9" cy="9" r="3" />
          <path d="M3 20c0-3 3-5 6-5s6 2 6 5" />
          <path d="M16 11c2 0 3.5-1.5 3.5-3.5S18 4 16 4" />
          <path d="M21 20c0-2-1.5-4-4.5-4.5" />
        </svg>
      );
    case "sales":
      return (
        <svg {...common}>
          <rect x="3" y="6" width="18" height="13" rx="2" />
          <path d="M3 10h18" />
          <path d="M14 15h4" />
        </svg>
      );
    case "studio":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="14" rx="2" />
          <path d="M10 9l5 3-5 3z" fill={accent} stroke="none" />
        </svg>
      );
    case "profile":
      return (
        <svg {...common}>
          <rect x="7" y="3" width="10" height="18" rx="2" />
          <path d="M11 18h2" />
        </svg>
      );
    case "certificate":
      return (
        <svg {...common}>
          <circle cx="12" cy="10" r="6" />
          <path d="M9 14l-2 7 5-3 5 3-2-7" />
          <path d="M9 10l2 2 4-4" />
        </svg>
      );
    default:
      return null;
  }
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
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl p-5 transition-all duration-500 ease-out hover:-translate-y-1 sm:p-6"
      style={{
        background:
          "linear-gradient(180deg, rgba(12,12,14,0.96) 0%, rgba(6,6,8,1) 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: expanded
          ? `0 24px 50px -16px ${tool.accent}26, inset 0 1px 0 0 rgba(255,255,255,0.06)`
          : "0 12px 32px -16px rgba(0,0,0,0.6), inset 0 1px 0 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Top accent line that lights up on hover */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${tool.accent}66 50%, transparent 100%)`,
          opacity: expanded ? 1 : 0.35,
        }}
      />

      {/* Bottom radial accent that intensifies on hover */}
      <div
        className="pointer-events-none absolute -bottom-16 left-1/2 h-32 w-[80%] -translate-x-1/2 transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, ${tool.accent}3c 0%, transparent 70%)`,
          filter: "blur(22px)",
          opacity: expanded ? 1 : 0.4,
        }}
      />

      {/* HEADER: icon emblem + name */}
      <div className="relative flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-500"
            style={{
              background:
                "linear-gradient(160deg, rgba(30,30,35,0.7) 0%, rgba(10,10,12,1) 100%)",
              border: `1px solid ${tool.accent}24`,
              boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.06), 0 0 ${expanded ? "16px" : "0"} ${tool.accent}28`,
            }}
          >
            <ToolIcon id={tool.id} accent={tool.accent} />
          </div>
          <h3 className="text-[15px] font-semibold text-white sm:text-[15.5px]">
            {tool.name}
          </h3>
        </div>
        <svg
          viewBox="0 0 20 20"
          className="h-4 w-4 fill-none stroke-current text-white/25 stroke-[1.6] transition-all duration-300 group-hover:translate-x-1 group-hover:text-white/65"
        >
          <path d="M4 10h11M11 6l4 4-4 4" />
        </svg>
      </div>

      {/* One-liner */}
      <p className="relative mt-2 text-[12.5px] leading-relaxed text-white/45 sm:text-[13px]">
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
        {/* Fade overlay when collapsed */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-12 transition-opacity duration-500"
          style={{
            background:
              "linear-gradient(to top, rgba(6,6,8,1) 0%, rgba(6,6,8,0.7) 50%, transparent 100%)",
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
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div className="text-center">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/45"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span className="h-1 w-1 rounded-full bg-white/50" />
              {c.eyebrow}
            </span>
            <h2 className="font-display mx-auto mt-5 max-w-[820px] text-[1.75rem] font-medium leading-[1.1] tracking-tight text-white sm:text-[2.6rem] lg:text-[2.95rem]">
              {c.title}
            </h2>
            <p className="mx-auto mt-4 max-w-[560px] text-[14px] leading-relaxed text-white/45 sm:text-[15px]">
              {c.subtitle}
            </p>
            <p className="tools-hover-hint mt-3 text-[11.5px] font-medium uppercase tracking-[0.14em] text-white/30">
              {c.hintHover}
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:mt-16 sm:gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {c.tools.map((tool, i) => (
            <Reveal key={tool.id} delayMs={i * 70}>
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
      </div>
    </section>
  );
}
