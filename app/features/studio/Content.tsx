"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Reveal } from "@/components/landing/Reveal";
import { getLandingContent } from "@/components/landing/content";
import { useLocale } from "@/lib/useLocale";

/* Prism renders a WebGL pyramid with rotating colour-shifting bands.
   Dynamic-imported so ogl + its shaders don't ship in the SSR bundle. */
const Prism = dynamic(() => import("@/components/landing/Prism"), {
  ssr: false,
});

/* ------------------------------------------------------------------ */
/*  Hero — Prism + big glassy "STUDIO" wordmark that fades out on     */
/*  scroll. Intentionally NOT position:sticky — the hero scrolls      */
/*  away naturally, we only drive opacity / transform from scroll     */
/*  progress so the exit feels like a graceful dissolve.              */
/* ------------------------------------------------------------------ */
function StudioHero() {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0); // 0 = full, 1 = fully dissolved

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      /* Progress crosses 0 → 1 as the hero's bottom moves from full
         viewport down to the top edge. So the dissolve runs across
         the FIRST full viewport of scroll, then stays at 1. */
      const h = Math.max(1, el.offsetHeight);
      const passed = Math.min(1, Math.max(0, -rect.top / h));
      setProgress(passed);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const textFade = 1 - Math.min(1, progress * 1.4);
  const lift = progress * -40;
  const textBlur = progress * 12;
  const prismBlur = progress * 4;
  const prismScale = 1 - progress * 0.04;

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          transform: `scale(${prismScale})`,
          filter: `blur(${prismBlur}px)`,
          transition: "none",
          maskImage:
            "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 100%)",
        }}
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

      {/* STUDIO wordmark — Geist Black, massive, with a gradient fill
          + thin white stroke for a liquid-glass edge that reads on
          top of the Prism without hiding it. */}
      <h1
        className="relative z-10 select-none font-sans"
        style={{
          opacity: textFade,
          transform: `translateY(${lift}px) scale(${1 - progress * 0.04})`,
          filter: `blur(${textBlur}px)`,
          transition: "none",
          fontWeight: 900,
          /* Fluid font-size + letter-spacing, both tuned to keep ALL
             six letters of STUDIO fully visible from phones up to
             wide desktops. Previously the 140px tracking + 18vw
             font-size overflowed past the viewport (S and O were
             clipped on 1280+). Formula sanity check at 1280vw: the
             word occupies roughly 3.9·font + 5·tracking + tracking
             ≈ 0.79·V, which lands at ~1010px of 1280 — ~130px of
             breathing room on each side. */
          fontSize: "clamp(4rem, 14vw, 12rem)",
          letterSpacing: "clamp(0.3rem, 7vw, 100px)",
          lineHeight: 1,
          whiteSpace: "nowrap",
          /* Left padding == letter-spacing so the trailing O doesn't
             make the word look shifted. */
          paddingLeft: "clamp(0.3rem, 7vw, 100px)",
          color: "transparent",
          backgroundImage:
            "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.55) 55%, rgba(255,255,255,0.18) 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          WebkitTextStroke: "1px rgba(255,255,255,0.28)",
          textShadow:
            "0 0 40px rgba(255,255,255,0.12), 0 0 120px rgba(180,200,255,0.08)",
        }}
      >
        STUDIO
      </h1>

      {/* Soft gradient floor — eases the transition from the bright
          hero into the darker content below. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,1) 100%)",
        }}
      />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Feature row — alternating image/text layout, Resend-style. Each   */
/*  row is a big claim with a supporting paragraph and a lightweight  */
/*  preview panel on the opposite side.                               */
/* ------------------------------------------------------------------ */
type FeatureRowProps = {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  preview: React.ReactNode;
  reverse?: boolean;
};

function FeatureRow({
  eyebrow,
  title,
  description,
  bullets,
  preview,
  reverse,
}: FeatureRowProps) {
  return (
    <Reveal>
      <div
        className={`grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16 ${
          reverse ? "lg:[&>*:first-child]:order-2" : ""
        }`}
      >
        <div className="max-w-[520px]">
          <p className="text-[12px] font-semibold tracking-[0.02em] text-white/40">
            {eyebrow}
          </p>
          <h3 className="mt-3 font-sans text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
            {title}
          </h3>
          <p className="mt-4 text-[15px] leading-relaxed text-white/55">
            {description}
          </p>
          <ul className="mt-6 flex flex-col gap-2.5">
            {bullets.map((b) => (
              <li
                key={b}
                className="flex items-start gap-2.5 text-[14px] leading-snug text-white/70"
              >
                <svg
                  viewBox="0 0 20 20"
                  className="mt-[2px] h-[16px] w-[16px] shrink-0 fill-none stroke-white/70 stroke-[2]"
                >
                  <path d="M5 10.5l3.5 3.5L15 7" />
                </svg>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>{preview}</div>
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/*  Preview panels — lightweight illustrative cards rendered in CSS.  */
/* ------------------------------------------------------------------ */
function PreviewCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 sm:p-8 ${className}`}
      style={{
        background:
          "linear-gradient(180deg, rgba(14,14,18,1) 0%, rgba(6,6,8,1) 100%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          border: "1px solid rgba(255,255,255,0.07)",
          borderBottom: "none",
          maskImage:
            "linear-gradient(to bottom, black 0%, black 35%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 35%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 15%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.04) 85%, transparent 100%)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function AutoPostPreview({ fr }: { fr: boolean }) {
  const platforms = [
    { name: "YouTube", color: "#FF0000" },
    { name: "TikTok", color: "#25F4EE" },
    { name: "Instagram", color: "#E1306C" },
  ];
  return (
    <PreviewCard>
      <p className="text-[11px] font-semibold tracking-wide text-white/50">
        {fr ? "File d'attente" : "Publishing queue"}
      </p>
      <div className="mt-4 flex flex-col gap-2">
        {platforms.map((p, i) => (
          <div
            key={p.name}
            className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
          >
            <div className="flex items-center gap-3">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: p.color }}
              />
              <span className="text-[13px] font-medium text-white/80">
                {p.name}
              </span>
            </div>
            <span className="tabular-nums text-[11px] text-white/35">
              {fr ? "Dans" : "In"} {(i + 1) * 42}m
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[11px] text-white/35">
        {fr
          ? "Aucune intervention. Studio publie pendant que tu fais de la musique."
          : "Nothing to do. Studio posts while you make music."}
      </p>
    </PreviewCard>
  );
}

function TemplatePreview({ fr }: { fr: boolean }) {
  return (
    <PreviewCard>
      <p className="text-[11px] font-semibold tracking-wide text-white/50">
        {fr ? "Modèle vidéo" : "Video template"}
      </p>
      <div className="mt-4 flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-white/[0.08]">
        <div
          className="relative flex h-full w-full items-center justify-center"
          style={{
            background:
              "radial-gradient(ellipse at 30% 20%, rgba(80,90,220,0.25) 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(220,80,180,0.22) 0%, transparent 60%), #070709",
          }}
        >
          <div className="text-center">
            <p className="text-[10px] font-semibold tracking-[0.08em] text-white/50">
              vvault
            </p>
            <p className="mt-1 font-sans text-lg font-semibold text-white">
              {fr ? "Dark Melodies Vol.3" : "Dark Melodies Vol.3"}
            </p>
            <p className="mt-0.5 text-[10px] text-white/35">
              {fr ? "142 BPM · F min" : "142 BPM · F min"}
            </p>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/3 bg-white/70" />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {["{title}", "{bpm}", "{key}", "{cover}"].map((tok) => (
          <span
            key={tok}
            className="rounded-md bg-white/[0.06] px-2 py-1 text-[11px] font-mono text-white/55"
          >
            {tok}
          </span>
        ))}
      </div>
    </PreviewCard>
  );
}

function SchedulePreview({ fr }: { fr: boolean }) {
  const days = fr
    ? ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const heat = [0.1, 0.35, 0.7, 0.85, 0.55, 0.2, 0.0];
  return (
    <PreviewCard>
      <p className="text-[11px] font-semibold tracking-wide text-white/50">
        {fr ? "Créneaux de publication" : "Posting windows"}
      </p>
      <div className="mt-4 flex items-end gap-1.5">
        {heat.map((h, i) => (
          <div key={days[i]} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded"
              style={{
                height: `${24 + h * 80}px`,
                background: `rgba(255,255,255,${0.08 + h * 0.28})`,
              }}
            />
            <span className="text-[10px] font-medium text-white/40">
              {days[i]}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between text-[11px] text-white/45">
        <span>{fr ? "Fuseau : Europe/Paris" : "Timezone: Europe/Paris"}</span>
        <span className="tabular-nums text-white/70">
          {fr ? "Toutes les 3h" : "Every 3h"}
        </span>
      </div>
    </PreviewCard>
  );
}

function StudioPackPreview({ fr }: { fr: boolean }) {
  return (
    <PreviewCard>
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white/70"
          style={{
            background:
              "linear-gradient(160deg, rgba(50,50,60,0.6) 0%, rgba(10,10,14,0.95) 100%)",
            border: "0.5px solid rgba(255,255,255,0.08)",
          }}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
            <path d="M3.75 9.75V5.25a1.5 1.5 0 0 1 1.5-1.5h4.19a1.5 1.5 0 0 1 1.06.44l1.06 1.06a1.5 1.5 0 0 0 1.06.44h5.63a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V9.75Z" />
          </svg>
        </div>
        <div>
          <p className="text-[13px] font-semibold text-white/90">
            {fr ? "Pack de studio" : "Studio Pack"}
          </p>
          <p className="text-[11px] text-white/40">
            {fr ? "24 morceaux · auto-publication activée" : "24 tracks · auto-post enabled"}
          </p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        <SettingRow
          label={fr ? "Auto-publication" : "Auto-publish"}
          value={fr ? "Activée" : "On"}
          on
        />
        <SettingRow
          label={fr ? "Intervalle" : "Interval"}
          value={fr ? "3 heures" : "3 hours"}
        />
        <SettingRow
          label={fr ? "Modèle" : "Template"}
          value={fr ? "Minimal Dark" : "Minimal Dark"}
        />
        <SettingRow
          label={fr ? "Plateformes" : "Platforms"}
          value="YT · IG · TT"
        />
      </div>
    </PreviewCard>
  );
}

function SettingRow({
  label,
  value,
  on,
}: {
  label: string;
  value: string;
  on?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
      <span className="text-[12px] text-white/45">{label}</span>
      <span
        className={`text-[12px] font-medium ${
          on ? "text-emerald-400" : "text-white/80"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */
export default function FeatureStudioPage() {
  const [locale] = useLocale();
  const content = getLandingContent(locale);
  const fr = locale === "fr";

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = fr
      ? "vvault | Studio — Publication automatique"
      : "vvault | Studio — Automated Publishing";
  }, [fr]);

  return (
    <div className="landing-root min-h-screen bg-black font-sans text-[#f0f0f0]">
      <LandingNav locale={locale} content={content} showPrimaryLinks={true} />

      <StudioHero />

      <main className="relative z-10 mx-auto w-full max-w-[1120px] px-5 pb-40 pt-24 sm:px-8 sm:pt-32">
        {/* Intro pitch + top CTA to docs */}
        <Reveal>
          <div className="mx-auto max-w-[720px] text-center">
            <p className="text-[12px] font-semibold tracking-[0.02em] text-white/40">
              {fr ? "Publication automatique" : "Automated publishing"}
            </p>
            <h2 className="mt-4 font-sans text-3xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl">
              {fr
                ? "Un studio qui tourne pendant que tu fais de la musique."
                : "A studio that runs while you make music."}
            </h2>
            <p className="mt-5 text-[16px] leading-relaxed text-white/55 sm:text-[17px]">
              {fr
                ? "vvault Studio génère des vidéos à partir de tes sons et les publie automatiquement sur YouTube, TikTok et Instagram — selon tes modèles, ta cadence et ton fuseau horaire. Tu uploads une fois. Studio sort chaque semaine."
                : "vvault Studio generates videos from your tracks and auto-publishes them to YouTube, TikTok, and Instagram — on your templates, your cadence, your timezone. Upload once. Ship every week."}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/docs/studio"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-[14px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90"
              >
                {fr ? "Lire la doc Studio" : "Read the Studio docs"}
                <svg
                  viewBox="0 0 20 20"
                  className="h-3.5 w-3.5 fill-none stroke-current stroke-[2]"
                >
                  <path d="M4 10h11M11 6l4 4-4 4" />
                </svg>
              </Link>
              <a
                href="https://vvault.app/signup"
                className="inline-flex items-center rounded-xl bg-white/[0.06] px-5 py-2.5 text-[14px] font-semibold text-white/85 transition-colors duration-200 hover:bg-white/[0.1]"
              >
                {fr ? "Essayer Ultra" : "Try Ultra"}
              </a>
            </div>
          </div>
        </Reveal>

        {/* Feature rows */}
        <div className="mt-28 flex flex-col gap-28 sm:mt-36 sm:gap-36">
          <FeatureRow
            eyebrow={fr ? "Auto-post" : "Auto-post"}
            title={
              fr
                ? "Publie sur chaque plateforme sans y toucher."
                : "Ship to every platform without touching it."
            }
            description={
              fr
                ? "Connecte tes comptes une fois. Studio transforme tes morceaux en vidéos et les dépose sur YouTube, TikTok et Instagram à intervalle régulier — pendant que tu dors, pendant que tu mixes."
                : "Connect your accounts once. Studio turns your tracks into videos and drops them on YouTube, TikTok, and Instagram on an interval — while you sleep, while you mix."
            }
            bullets={
              fr
                ? [
                    "Publication sur YouTube, TikTok et Instagram",
                    "File d'attente visible en direct",
                    "Déclenchement manuel pour un push d'urgence",
                  ]
                : [
                    "Publishes to YouTube, TikTok, and Instagram",
                    "Live queue you can watch tick down",
                    "Manual trigger for an emergency push",
                  ]
            }
            preview={<AutoPostPreview fr={fr} />}
          />

          <FeatureRow
            reverse
            eyebrow={fr ? "Modèles vidéo" : "Video templates"}
            title={
              fr
                ? "Chaque vidéo, à ton image."
                : "Every video, in your brand."
            }
            description={
              fr
                ? "Choisis un modèle, branche des tokens dynamiques (titre, BPM, key, cover) — Studio rend une vidéo propre pour chaque track, avec ta mise en forme, automatiquement."
                : "Pick a template, wire in dynamic tokens (title, BPM, key, cover) — Studio renders a clean video for every track, on your brand, automatically."
            }
            bullets={
              fr
                ? [
                    "Tokens dynamiques : titre, BPM, key, cover",
                    "Fallback de cover si une cover manque",
                    "Dupliquer les réglages sur plusieurs packs",
                  ]
                : [
                    "Dynamic tokens: title, BPM, key, cover",
                    "Cover fallback when a track is missing one",
                    "Duplicate settings across multiple packs",
                  ]
            }
            preview={<TemplatePreview fr={fr} />}
          />

          <FeatureRow
            eyebrow={fr ? "Planification intelligente" : "Smart scheduling"}
            title={
              fr
                ? "Règle ta cadence. Studio tient le tempo."
                : "Set your cadence. Studio keeps tempo."
            }
            description={
              fr
                ? "Définis l'intervalle de publication, le fuseau horaire et l'heure de départ. Studio respecte ton rythme sur des mois sans rater un créneau, et se remet en route tout seul si ta connexion coupe."
                : "Set the posting interval, timezone, and start time. Studio holds your rhythm for months without missing a slot, and self-resumes if the connection drops."
            }
            bullets={
              fr
                ? [
                    "Intervalles en heures ou en jours",
                    "Fuseau horaire par pack",
                    "Reprise automatique après interruption",
                  ]
                : [
                    "Interval in hours or days",
                    "Per-pack timezone handling",
                    "Auto-resume after any interruption",
                  ]
            }
            preview={<SchedulePreview fr={fr} />}
          />

          <FeatureRow
            reverse
            eyebrow={fr ? "Packs de studio" : "Studio packs"}
            title={
              fr
                ? "Un pack. Une config. Tout un catalogue en ligne."
                : "One pack. One config. A whole catalogue online."
            }
            description={
              fr
                ? "Configure un Studio Pack dans vvault — Studio prend le relais. Active l'auto-publication, choisis un modèle, pose un intervalle : Studio exécute, indéfiniment, sans doubles envois grâce à un verrou de synchro."
                : "Configure a Studio Pack in vvault — Studio takes it from there. Enable auto-publish, pick a template, set an interval: Studio executes, indefinitely, without duplicate pushes thanks to a sync lock."
            }
            bullets={
              fr
                ? [
                    "Activation par pack en un clic",
                    "Verrou de synchro anti-doublons",
                    "Réservé au plan Ultra",
                  ]
                : [
                    "Per-pack enable in a click",
                    "Sync lock to prevent duplicate posts",
                    "Ultra plan exclusive",
                  ]
            }
            preview={<StudioPackPreview fr={fr} />}
          />
        </div>

        {/* Final CTA block */}
        <Reveal>
          <div className="mt-40 text-center sm:mt-52">
            <h3 className="font-sans text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
              {fr
                ? "Prêt à laisser Studio s'en charger ?"
                : "Ready to let Studio take over?"}
            </h3>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/50">
              {fr
                ? "Disponible avec le plan Ultra. La doc t'apprend à tout câbler en moins de dix minutes."
                : "Available on the Ultra plan. The docs walk you through wiring it up in under ten minutes."}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/docs/studio"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-[14px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90"
              >
                {fr ? "Ouvrir la doc Studio" : "Open the Studio docs"}
                <svg
                  viewBox="0 0 20 20"
                  className="h-3.5 w-3.5 fill-none stroke-current stroke-[2]"
                >
                  <path d="M4 10h11M11 6l4 4-4 4" />
                </svg>
              </Link>
              <a
                href="https://vvault.app/signup"
                className="inline-flex items-center rounded-xl bg-white/[0.06] px-5 py-2.5 text-[14px] font-semibold text-white/85 transition-colors duration-200 hover:bg-white/[0.1]"
              >
                {fr ? "Démarrer avec Ultra" : "Get started with Ultra"}
              </a>
            </div>
          </div>
        </Reveal>
      </main>

      <LandingFooter
        locale={locale}
        content={content}
        showColumns={false}
        inlineLegalWithBrand
      />
    </div>
  );
}
