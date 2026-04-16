"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Reveal } from "@/components/landing/Reveal";
import { getLandingContent } from "@/components/landing/content";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { useLocale } from "@/lib/useLocale";

const Plasma = dynamic(() => import("@/components/landing/Plasma"), { ssr: false });

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  const toggle = useCallback(() => {
    if (!open && bodyRef.current) {
      setHeight(bodyRef.current.scrollHeight);
    }
    setOpen((v) => !v);
  }, [open]);

  return (
    <div
      className="relative overflow-hidden rounded-2xl transition-all duration-300 hover:brightness-125"
      style={{
        background:
          "linear-gradient(180deg, rgba(12,12,15,0.98) 0%, rgba(4,4,5,1) 100%)",
      }}
    >
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
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 15%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 85%, transparent 100%)",
        }}
      />
      <button
        type="button"
        onClick={toggle}
        className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left sm:px-8"
      >
        <span className="text-[14px] font-medium text-white/84 sm:text-[15px]">
          {question}
        </span>
        <span
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-white/40 transition-transform duration-300 ease-out"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 20 20"
            className="h-4 w-4 fill-none stroke-current stroke-[1.8]"
          >
            <path d="M5 8l5 5 5-5" />
          </svg>
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{ height: open ? height : 0, opacity: open ? 1 : 0 }}
      >
        <div ref={bodyRef} className="px-6 pb-5 sm:px-8">
          <p className="text-[13px] leading-7 text-white/50 sm:text-[14px]">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

/* Comparison table data */
type ComparisonRow = {
  label: string;
  desc?: string;
  free: boolean | string;
  pro: boolean | string;
  ultra: boolean | string;
};

function getComparisonSections(locale: "en" | "fr"): {
  title: string;
  rows: ComparisonRow[];
}[] {
  const fr = locale === "fr";
  const unlimited = fr ? "Illimité" : "Unlimited";
  const fullPrice = fr ? "Plein tarif" : "Full price";
  const halfOff = fr ? "-50%" : "50% off";
  return [
    {
      title: fr ? "Fonctionnalités principales" : "Core Features",
      rows: [
        {
          label: fr ? "Stockage" : "Storage",
          desc: fr
            ? "Espace sécurisé pour tes stems, packs et masters."
            : "Secure space for your stems, packs and masters.",
          free: "100 MB",
          pro: unlimited,
          ultra: unlimited,
        },
        {
          label: fr ? "Liens de partage (track, pack, dossier)" : "Share links (track, pack, folder)",
          desc: fr
            ? "Envoie ta musique avec un seul lien — track, pack complet ou dossier entier."
            : "Send your music with one link — a single track, a full pack, or a whole folder.",
          free: true,
          pro: true,
          ultra: true,
        },
        { label: fr ? "Liste de contacts" : "Contact list", free: true, pro: true, ultra: true },
        { label: fr ? "Packs et tracks en collab" : "Collab packs and tracks", free: true, pro: true, ultra: true },
        { label: fr ? "Recevoir des splits (Pro/Ultra)" : "Receive splits (Pro/Ultra sales)", free: true, pro: true, ultra: true },
        { label: fr ? "Page Link in Bio" : "Link in Bio page", free: true, pro: true, ultra: true },
        {
          label: fr ? "Certificat de dépôt" : "Certificate of deposit",
          desc: fr
            ? "Preuve horodatée et certifiée par hash — infalsifiable."
            : "Timestamped, hash-certified proof of authorship — tamper-proof.",
          free: true,
          pro: true,
          ultra: true,
        },
        {
          label: fr ? "WaveMatch (détection de placements)" : "WaveMatch (placement detection)",
          desc: fr
            ? "Détecte automatiquement les placements de ta musique sur le web."
            : "Automatically detects where your music gets placed across the web.",
          free: true,
          pro: true,
          ultra: true,
        },
        { label: fr ? "Scan WaveMatch automatique de la bibliothèque" : "Auto library WaveMatch scanning", free: false, pro: false, ultra: true },
      ],
    },
    {
      title: fr ? "Campagnes & Outreach" : "Campaigns & Outreach",
      rows: [
        {
          label: fr ? "Créer des campagnes" : "Create campaigns",
          desc: fr
            ? "Envoie ta musique à plusieurs contacts en une fois, avec suivi."
            : "Send your music to multiple contacts at once, with full tracking.",
          free: fr ? "1/jour" : "1/day",
          pro: unlimited,
          ultra: unlimited,
        },
        { label: fr ? "Envois programmés" : "Schedule sends", free: false, pro: true, ultra: true },
        { label: fr ? "Intégration Gmail" : "Gmail integration", free: false, pro: true, ultra: true },
        { label: fr ? "Objet & corps d'email personnalisés" : "Custom email subject & body", free: false, pro: true, ultra: true },
        { label: fr ? "A/B test des objets d'email" : "A/B test email subjects", free: false, pro: true, ultra: true },
        { label: fr ? "Horaire optimal par destinataire" : "Per-recipient best time scheduling", free: false, pro: false, ultra: true },
        { label: fr ? "Automatisations en séries" : "Series automations", free: false, pro: false, ultra: true },
        { label: fr ? "Séquences email automatisées (drip)" : "Automated email sequences (drip)", free: false, pro: false, ultra: true },
      ],
    },
    {
      title: fr ? "Analytics & Suivi" : "Analytics & Tracking",
      rows: [
        {
          label: fr ? "Suivi des ouvertures" : "Opens tracking",
          desc: fr
            ? "Vois exactement qui a ouvert ton email et quand."
            : "See exactly who opened your email and when.",
          free: false,
          pro: true,
          ultra: true,
        },
        { label: fr ? "Suivi des clics" : "Clicks tracking", free: false, pro: true, ultra: true },
        {
          label: fr ? "Durée d'écoute" : "Play duration tracking",
          desc: fr
            ? "Combien de secondes chaque destinataire a écouté — track par track."
            : "How long each recipient actually listened — track by track.",
          free: false,
          pro: true,
          ultra: true,
        },
        { label: fr ? "Téléchargements & sauvegardes" : "Downloads & saves", free: false, pro: true, ultra: true },
        { label: fr ? "Suivi des ventes" : "Sales tracking", free: false, pro: true, ultra: true },
        { label: fr ? "Analyse du meilleur moment pour envoyer" : "Best time to send analysis", free: false, pro: true, ultra: true },
        { label: fr ? "Funnels d'engagement" : "Engagement funnels", free: false, pro: true, ultra: true },
        { label: fr ? "Heatmap d'ouvertures (jour × heure)" : "Opens heatmap (day \u00d7 hour)", free: false, pro: true, ultra: true },
      ],
    },
    {
      title: fr ? "CRM & Pipeline" : "CRM & Pipeline",
      rows: [
        { label: fr ? "Timeline de contact" : "Contact timeline", free: false, pro: true, ultra: true },
        { label: fr ? "Groupes & tags de contacts" : "Contact groups & tags", free: false, pro: true, ultra: true },
        {
          label: fr ? "Scoring d'engagement" : "Lead scoring",
          desc: fr
            ? "Priorise automatiquement les contacts qui ouvrent, écoutent et téléchargent le plus."
            : "Auto-prioritizes contacts who open, listen, and download the most.",
          free: false,
          pro: true,
          ultra: true,
        },
        { label: fr ? "Smart Segments (segments dynamiques)" : "Smart Segments (dynamic rule-based)", free: false, pro: true, ultra: true },
        { label: fr ? "Opportunités & tableau de demandes" : "Opportunities & request board", free: true, pro: true, ultra: true },
      ],
    },
    {
      title: fr ? "Ventes & Marketplace" : "Sales & Marketplace",
      rows: [
        { label: fr ? "Vendre sur le Marketplace" : "Sell on Marketplace", free: true, pro: true, ultra: true },
        {
          label: fr ? "Commission Marketplace" : "Marketplace commission",
          desc: fr
            ? "Ce que vvault retient sur chaque vente."
            : "What vvault takes on each sale.",
          free: "15%",
          pro: "5%",
          ultra: "0%",
        },
        { label: fr ? "Checkout Stripe" : "Stripe checkout", free: true, pro: true, ultra: true },
        { label: fr ? "Types de licences (MP3, WAV, Stems, Exclusive)" : "License types (MP3, WAV, Stems, Exclusive)", free: true, pro: true, ultra: true },
        { label: fr ? "Soumissions de packs payantes" : "Paid request pack submissions", free: fullPrice, pro: fullPrice, ultra: halfOff },
        { label: fr ? "Tableau de bord Revenus & payouts" : "Revenue dashboard & payouts", free: true, pro: true, ultra: true },
      ],
    },
    {
      title: fr ? "Branding & Personnalisation" : "Branding & Customization",
      rows: [
        {
          label: fr ? "Profil public" : "Public profile",
          desc: fr
            ? "Ta page vvault.app/tonnom — toutes tes sorties au même endroit."
            : "Your vvault.app/handle page — all your releases in one place.",
          free: true,
          pro: true,
          ultra: true,
        },
        { label: fr ? "Personnalisation du thème" : "Theme customization", free: false, pro: false, ultra: true },
        { label: fr ? "Crédits de placement" : "Placement credits", free: true, pro: true, ultra: true },
        { label: fr ? "Liens sociaux (IG, YT, TT)" : "Social links (IG, YT, TT)", free: true, pro: true, ultra: true },
        { label: fr ? "Embeds (lecteurs intégrables) avec tracking" : "Embeds (embeddable players) with tracking", free: true, pro: true, ultra: true },
        { label: fr ? "Codes QR" : "QR codes", free: true, pro: true, ultra: true },
        { label: fr ? "Domaine personnalisé" : "Custom domain", free: false, pro: false, ultra: true },
        { label: fr ? "Embeds brandés" : "Branded embeds", free: false, pro: false, ultra: true },
        { label: fr ? "Studio Packs (publication auto vidéo)" : "Studio Packs (auto video publishing)", free: false, pro: false, ultra: true },
        { label: fr ? "Mise en avant section Browse" : "Browse section highlight", free: false, pro: false, ultra: true },
      ],
    },
  ];
}

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return (
      <span className="block break-words text-[13px] font-medium leading-snug text-white/80 sm:text-[15px]">
        {value}
      </span>
    );
  }
  if (value) {
    return (
      <svg
        viewBox="0 0 20 20"
        className="mx-auto h-5 w-5 fill-none stroke-emerald-400/80 stroke-[2] sm:h-[22px] sm:w-[22px]"
      >
        <path d="M5 10.5l3.5 3.5L15 7" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 20 20"
      className="mx-auto h-5 w-5 fill-none stroke-white/20 stroke-[1.8] sm:h-[22px] sm:w-[22px]"
    >
      <path d="M6 6l8 8M14 6l-8 8" />
    </svg>
  );
}

export default function PricingPage() {
  const [locale] = useLocale();
  const content = getLandingContent(locale);
  const [annual, setAnnual] = useState(true);
  const proPrice = annual ? "\u20ac7.49" : "\u20ac8.99";
  const ultraPrice = annual ? "\u20ac20.75" : "\u20ac24.99";
  const [stickyVisible, setStickyVisible] = useState(false);
  const compareRef = useRef<HTMLDivElement>(null);
  const staticHeaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = locale === "fr" ? "vvault | Tarifs" : "vvault | Pricing";
  }, [locale]);

  // Show sticky compare-plans bar (covering nav) while user is reading the
  // comparison tables — same pattern as Epidemic Sound. The sticky replaces
  // the large static header once that header has scrolled off-screen.
  useEffect(() => {
    const handleScroll = () => {
      const compareNode = compareRef.current;
      const headerNode = staticHeaderRef.current;
      if (!compareNode || !headerNode) {
        setStickyVisible(false);
        return;
      }
      const headerRect = headerNode.getBoundingClientRect();
      const compareRect = compareNode.getBoundingClientRect();
      // Trigger sticky once the static header's bottom clears the top of the
      // viewport, so the sticky "takes over" its role.
      setStickyVisible(headerRect.bottom <= 0 && compareRect.bottom > 80);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Toggle a body class so the primary nav cross-fades out while the sticky
  // compare bar takes over the top of the viewport.
  useEffect(() => {
    if (stickyVisible) {
      document.body.classList.add("compare-sticky-active");
    } else {
      document.body.classList.remove("compare-sticky-active");
    }
    return () => {
      document.body.classList.remove("compare-sticky-active");
    };
  }, [stickyVisible]);

  const fr = locale === "fr";
  const everythingInFreeLabel = fr ? "Tout ce qui est dans Free, plus :" : "Everything in Free, plus:";
  const everythingInProLabel = fr ? "Tout ce qui est dans Pro, plus :" : "Everything in Pro, plus:";
  const notIncludedLabel = fr ? "Pas inclus :" : "Not included:";

  const plans: Array<{
    name: string;
    eyebrow?: string;
    price: string;
    period: string;
    includedHeading?: string;
    bullets: readonly string[];
    notIncluded: readonly string[];
    notIncludedHeading: string;
    cta: string;
    href: string;
    loggedOutHref: string;
    featured: boolean;
  }> = [
    {
      name: "Free",
      price: "\u20ac0",
      period: "",
      includedHeading: undefined,
      bullets: content.pricingComparison.human.bullets,
      notIncluded: content.pricingComparison.human.notIncluded ?? [],
      notIncludedHeading: notIncludedLabel,
      cta: content.pricingUi.startFree,
      href: "https://vvault.app/signup",
      loggedOutHref: "https://vvault.app/signup",
      featured: false,
    },
    {
      name: "Pro",
      eyebrow: content.pricingUi.mostPopular,
      price: proPrice,
      period: "/mo",
      includedHeading: everythingInFreeLabel,
      bullets: content.singlePlan.bullets,
      notIncluded: content.singlePlan.notIncluded ?? [],
      notIncludedHeading: notIncludedLabel,
      cta: content.singlePlan.cta,
      href: "https://vvault.app/billing",
      loggedOutHref: "https://vvault.app/signup?plan=pro",
      featured: true,
    },
    {
      name: "Ultra",
      price: ultraPrice,
      period: "/mo",
      includedHeading: everythingInProLabel,
      bullets: content.pricingComparison.ai.bullets,
      notIncluded: [],
      notIncludedHeading: notIncludedLabel,
      cta: content.pricingUi.upgradeUltra,
      href: "https://vvault.app/billing",
      loggedOutHref: "https://vvault.app/signup?plan=ultra",
      featured: false,
    },
  ];

  const stickyPlans = [
    { name: "Free", price: "\u20ac0", period: "" },
    { name: "Pro", price: proPrice, period: locale === "fr" ? "/mois" : "/mo" },
    { name: "Ultra", price: ultraPrice, period: locale === "fr" ? "/mois" : "/mo" },
  ];

  return (
    <div className="landing-root min-h-screen bg-black font-sans text-[#f0f0f0]">
      <LandingNav locale={locale} content={content} showPrimaryLinks={true} />

      {/* Sticky compare-plans bar — Epidemic Sound style.
          A proper <table> with the same colgroup widths as the tables below
          so every plan column lines up perfectly on both mobile and desktop.
          Pairs with body class `compare-sticky-active` to cross-fade the nav. */}
      <div
        aria-hidden={!stickyVisible}
        className={`fixed inset-x-0 top-0 z-[100] transition-opacity duration-[320ms] ease-out ${
          stickyVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ willChange: "opacity" }}
      >
        <div
          className="border-b border-white/[0.10] bg-black pt-[env(safe-area-inset-top)]"
          style={{
            boxShadow: "0 14px 32px -18px rgba(0,0,0,0.85)",
          }}
        >
          <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
            <table className="w-full table-fixed">
              <colgroup>
                <col style={{ width: "40%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "20%" }} />
              </colgroup>
              <tbody>
                <tr>
                  {/* Label column — title + (desktop) billing toggle */}
                  <td className="py-3 pr-3 align-middle sm:py-4">
                    <div className="flex flex-col gap-1 sm:gap-1.5">
                      <span className="text-[15px] font-semibold leading-none text-white sm:text-[22px]">
                        {locale === "fr" ? "Comparer" : "Compare plans"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAnnual((v) => !v)}
                        className="hidden w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/60 transition-colors hover:bg-white/[0.08] sm:inline-flex"
                      >
                        <span className={annual ? "text-white/40" : "text-white"}>
                          {content.pricingUi.monthly}
                        </span>
                        <span
                          className={`relative h-3.5 w-6 rounded-full transition-colors ${
                            annual ? "bg-emerald-500/80" : "bg-white/15"
                          }`}
                        >
                          <span
                            className={`absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-white transition-all ${
                              annual ? "left-3" : "left-0.5"
                            }`}
                          />
                        </span>
                        <span className={annual ? "text-white" : "text-white/40"}>
                          {content.pricingUi.annually}
                        </span>
                      </button>
                    </div>
                  </td>
                  {stickyPlans.map((p) => (
                    <td
                      key={p.name}
                      className="py-3 text-left align-middle sm:py-4"
                    >
                      <div className="min-w-0 pl-1 sm:pl-2">
                        <div className="truncate text-[13px] font-semibold leading-tight text-white sm:text-[18px]">
                          {p.name}
                        </div>
                        <div className="truncate text-[11px] leading-tight tabular-nums text-white/60 sm:text-[14px]">
                          <span className="font-medium text-white/85">{p.price}</span>
                          {p.period && (
                            <span className="text-white/45">{p.period}</span>
                          )}
                        </div>
                        {p.period && (
                          <div className="truncate text-[9.5px] leading-tight text-white/35 sm:text-[11px]">
                            {locale === "fr"
                              ? annual ? "facturé à l'année" : "facturé au mois"
                              : annual ? "billed yearly" : "billed monthly"}
                          </div>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Plasma hero background — white accent */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-screen"
        style={{
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 30%, black 0%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 30%, black 0%, transparent 70%)",
        }}
      >
        <div className="absolute inset-0 opacity-[0.55] max-lg:opacity-[0.2]">
          <Plasma
            color="#ffffff"
            speed={0.3}
            direction="forward"
            scale={1.2}
            opacity={0.5}
            mouseInteractive={false}
          />
        </div>
      </div>

      <main className="relative z-10 pb-32 pt-40 sm:pt-48">
        <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
          {/* Header */}
          <Reveal>
            <div className="text-center">
              <h1
                className="font-display text-4xl font-semibold sm:text-5xl lg:text-6xl"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.45) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {locale === "fr" ? "Tarifs" : "Pricing"}
              </h1>
              <p className="mt-3 text-[15px] text-white/45 sm:text-base">
                {locale === "fr" ? "Commence gratuitement et grandis \u00e0 ton rythme." : "Start for free and scale as you grow."}
              </p>

              {/* Toggle */}
              <div className="relative mt-8 flex flex-col items-center gap-2">
                <div className="flex items-center justify-center gap-3">
                  <span
                    className={`text-sm ${annual ? "text-white/40" : "text-white"}`}
                  >
                    {content.pricingUi.monthly}
                  </span>
                  <button
                    type="button"
                    aria-label={content.pricingUi.toggleBillingAriaLabel}
                    onClick={() => setAnnual((v) => !v)}
                    className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${
                      annual ? "bg-emerald-500/80" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white transition-all duration-200 ${
                        annual ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                  <span className={`text-sm ${annual ? "text-white" : "text-white/40"}`}>
                    {content.pricingUi.annually}
                  </span>
                </div>
                {annual && (
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400 whitespace-nowrap">
                    {locale === "fr" ? "17% d'économies" : "17% Savings"}
                  </span>
                )}
              </div>
            </div>
          </Reveal>

          {/* Plan cards */}
          <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:items-stretch">
            {plans.map((p) => (
              <Reveal key={p.name} className="h-full">
                <div
                  className="relative flex h-full flex-col overflow-hidden rounded-2xl p-6 sm:p-8"
                  style={{
                    background: p.featured
                      ? "linear-gradient(180deg, rgba(22,22,28,1) 0%, rgba(10,10,13,1) 100%)"
                      : p.name === "Ultra"
                        ? "linear-gradient(180deg, rgba(18,14,28,0.98) 0%, rgba(6,4,12,1) 100%)"
                        : "linear-gradient(180deg, rgba(12,12,15,0.98) 0%, rgba(4,4,5,1) 100%)",
                  }}
                >
                  <div
                    className="pointer-events-none absolute inset-0 rounded-[inherit]"
                    style={{
                      border: p.featured
                        ? "1px solid rgba(255,255,255,0.18)"
                        : p.name === "Ultra"
                          ? "1px solid rgba(168,130,255,0.12)"
                          : "1px solid rgba(255,255,255,0.06)",
                      borderBottom: "none",
                      maskImage:
                        "linear-gradient(to bottom, black 0%, black 30%, transparent 100%)",
                      WebkitMaskImage:
                        "linear-gradient(to bottom, black 0%, black 30%, transparent 100%)",
                    }}
                  />
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-px"
                    style={{
                      background: p.featured
                        ? "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 15%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.1) 85%, transparent 100%)"
                        : p.name === "Ultra"
                          ? "linear-gradient(90deg, transparent 0%, rgba(168,130,255,0.08) 15%, rgba(168,130,255,0.25) 50%, rgba(168,130,255,0.08) 85%, transparent 100%)"
                          : "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 15%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 85%, transparent 100%)",
                    }}
                  />
                  {/* Pro glow — bright white */}
                  {p.featured && (
                    <div
                      className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[200px] w-[500px]"
                      style={{
                        background:
                          "radial-gradient(ellipse at center, rgba(255,255,255,0.09) 0%, transparent 70%)",
                      }}
                    />
                  )}
                  {/* Ultra glow — purple accent */}
                  {p.name === "Ultra" && (
                    <div
                      className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[160px] w-[420px]"
                      style={{
                        background:
                          "radial-gradient(ellipse at center, rgba(168,130,255,0.07) 0%, transparent 70%)",
                      }}
                    />
                  )}

                  <h3 className="flex h-8 items-baseline gap-2 text-2xl font-semibold text-white">
                    {p.name}
                    {p.eyebrow && (
                      <span className="text-[11px] font-medium text-white/40">
                        {p.eyebrow}
                      </span>
                    )}
                  </h3>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-[2.5rem] font-semibold leading-none text-white">
                      {p.price}
                    </span>
                    {p.period && (
                      <span className="text-base text-white/40">{p.period}</span>
                    )}
                  </div>
                  <div
                    className="mt-5 h-px w-full"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  />

                  {/* Features — checks (included) */}
                  {p.includedHeading && (
                    <p className="mt-6 text-[12px] font-semibold uppercase tracking-wider text-white/40">
                      {p.includedHeading}
                    </p>
                  )}
                  <ul className={`flex flex-col gap-3 ${p.includedHeading ? "mt-3" : "mt-6"}`}>
                    {p.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-2.5 text-[14.5px] leading-snug text-white/80"
                      >
                        <svg
                          viewBox="0 0 20 20"
                          className="mt-[3px] h-[18px] w-[18px] shrink-0 fill-none stroke-emerald-400/80 stroke-[2.2]"
                        >
                          <path d="M5 10.5l3.5 3.5L15 7" />
                        </svg>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Features — crosses (not included on this tier) */}
                  {p.notIncluded.length > 0 && (
                    <>
                      <div
                        className="mt-6 h-px w-full"
                        style={{ background: "rgba(255,255,255,0.04)" }}
                      />
                      <p className="mt-5 text-[12px] font-semibold uppercase tracking-wider text-white/35">
                        {p.notIncludedHeading}
                      </p>
                      <ul className="mt-3 flex flex-col gap-3">
                        {p.notIncluded.map((bullet) => (
                          <li
                            key={bullet}
                            className="flex items-start gap-2.5 text-[14.5px] leading-snug text-white/35"
                          >
                            <svg
                              viewBox="0 0 20 20"
                              className="mt-[3px] h-[18px] w-[18px] shrink-0 fill-none stroke-white/30 stroke-[2.2]"
                            >
                              <path d="M6 6l8 8M14 6l-8 8" />
                            </svg>
                            <span className="line-through decoration-white/20">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  <div className="mt-auto pt-10">
                    <LandingCtaLink
                      loggedInHref={p.href}
                      loggedOutHref={p.loggedOutHref || p.href}
                      className={`inline-flex w-full items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 ${
                        p.featured
                          ? "bg-white text-[#0e0e0e] hover:bg-white/90 focus-visible:ring-white/35"
                          : "bg-white/[0.06] text-white hover:bg-white/[0.1] focus-visible:ring-white/20"
                      }`}
                    >
                      {p.cta} <span className="ml-1.5">&rarr;</span>
                    </LandingCtaLink>
                    <p className="mt-2.5 text-center text-[11px] text-white/25">
                      {p.period
                        ? (locale === "fr" ? "Annule quand tu veux" : "Cancel anytime")
                        : (locale === "fr" ? "Aucune carte requise" : "No credit card required")}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Trustpilot social proof */}
          <SocialProofSection locale={locale} />

          {/* Comparison tables — Epidemic-Sound-style static header on top,
              big rows with descriptions. The header naturally scrolls with
              the page; when it clears the top of the viewport, the sticky
              bar fades in (see above) in its place. */}
          <div ref={compareRef} className="mt-28 sm:mt-36" id="compare-plans">
            {/* Static "Compare plans" header block — 4-col table so plan
                columns line up 1:1 with the feature tables below. */}
            <div ref={staticHeaderRef}>
            <Reveal>
              <table className="w-full table-fixed">
                <colgroup>
                  <col style={{ width: "40%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "20%" }} />
                </colgroup>
                <tbody>
                  <tr>
                    <td className="pb-10 pr-4 align-top sm:pb-14">
                      <h2 className="text-[2rem] font-semibold leading-[1.04] tracking-tight text-white sm:text-[3rem] lg:text-[3.4rem]">
                        {locale === "fr" ? "Comparer les plans" : "Compare plans"}
                      </h2>
                      <div className="mt-5 flex flex-col gap-2 sm:mt-7">
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setAnnual((v) => !v)}
                            aria-label={content.pricingUi.toggleBillingAriaLabel}
                            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
                              annual ? "bg-emerald-500/80" : "bg-white/15"
                            }`}
                          >
                            <span
                              className={`absolute top-1/2 h-[18px] w-[18px] -translate-y-1/2 rounded-full bg-white transition-all duration-200 ${
                                annual ? "left-[22px]" : "left-[3px]"
                              }`}
                            />
                          </button>
                          <span className="text-[13px] font-medium text-white/75 sm:text-[14px]">
                            {locale === "fr" ? "Facturation annuelle" : "Yearly billing"}
                          </span>
                          <span className="text-[12px] text-white/35 sm:text-[13px]">
                            —{" "}
                            {locale === "fr"
                              ? "Économise 17%"
                              : "Save up to 17%"}
                          </span>
                        </div>
                      </div>
                    </td>
                    {stickyPlans.map((p) => (
                      <td key={p.name} className="pb-10 pl-2 align-top sm:pb-14 sm:pl-3">
                        <h3 className="text-[18px] font-semibold leading-tight text-white sm:text-[24px]">
                          {p.name}
                        </h3>
                        <p className="mt-1 text-[16px] font-medium tabular-nums leading-tight text-white sm:mt-1.5 sm:text-[22px]">
                          {p.price}
                          {p.period && (
                            <span className="text-white/45">{p.period}</span>
                          )}
                        </p>
                        <p className="mt-1 text-[10.5px] leading-snug text-white/40 sm:mt-2 sm:text-[12px]">
                          {p.period
                            ? locale === "fr"
                              ? annual
                                ? "Par mois, facturé à l'année"
                                : "Par mois, facturé au mois"
                              : annual
                                ? "Per month, billed yearly"
                                : "Per month, billed monthly"
                            : locale === "fr"
                              ? "Toujours gratuit"
                              : "Free forever"}
                        </p>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </Reveal>
            </div>

            {getComparisonSections(locale).map((section) => (
              <Reveal key={section.title} className="mt-12 sm:mt-16">
                {/* Section header — bigger, with divider underneath */}
                <div className="border-b border-white/10 pb-3 sm:pb-4">
                  <h3 className="text-[18px] font-semibold text-white sm:text-[22px]">
                    {section.title}
                  </h3>
                </div>
                <table className="w-full table-fixed">
                  <colgroup>
                    <col style={{ width: "40%" }} />
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "20%" }} />
                  </colgroup>
                  <tbody>
                    {section.rows.map((row) => (
                      <tr
                        key={row.label}
                        className="border-b border-white/[0.06]"
                      >
                        <td className="py-5 pr-4 align-middle sm:py-6">
                          <p className="text-[14px] font-medium leading-snug text-white/90 sm:text-[16px]">
                            {row.label}
                          </p>
                          {row.desc && (
                            <p className="mt-1 text-[11.5px] leading-snug text-white/40 sm:mt-1.5 sm:text-[13px]">
                              {row.desc}
                            </p>
                          )}
                        </td>
                        <td className="py-5 pl-2 pr-1 text-center align-middle sm:py-6 sm:pl-3 sm:pr-2">
                          <CellValue value={row.free} />
                        </td>
                        <td className="py-5 pl-2 pr-1 text-center align-middle sm:py-6 sm:pl-3 sm:pr-2">
                          <CellValue value={row.pro} />
                        </td>
                        <td className="py-5 pl-2 pr-1 text-center align-middle sm:py-6 sm:pl-3 sm:pr-2">
                          <CellValue value={row.ultra} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Reveal>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-28 sm:mt-36">
            <Reveal>
              <h2 className="text-center text-2xl font-semibold text-white sm:text-3xl">
                {content.pricingUi.faqTitle}
              </h2>
            </Reveal>
            <div className="mx-auto mt-10 flex max-w-[800px] flex-col gap-3">
              {content.faq.map((item) => (
                <Reveal key={item.question}>
                  <FaqItem question={item.question} answer={item.answer} />
                </Reveal>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <Reveal className="mt-28 sm:mt-36">
            <div className="text-center">
              <h2 className="text-2xl font-medium text-white sm:text-3xl">
                {locale === "fr" ? "Pr\u00eat \u00e0 te lancer ?" : "Ready to start?"}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
                {locale === "fr"
                  ? "Inscris-toi gratuitement et commence \u00e0 envoyer ta musique comme un pro d\u00e8s aujourd\u0027hui. Tes fichiers restent priv\u00e9s, tes donn\u00e9es t\u0027appartiennent."
                  : "Sign up for free and start sending your music professionally today. Your files stay private, your data stays yours."}
              </p>
              <div className="mt-6 flex justify-center">
                <a
                  href="https://vvault.app/signup"
                  className="inline-flex items-center rounded-2xl bg-white px-6 py-2.5 text-[14px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90"
                >
                  {locale === "fr" ? "Commencer gratuitement" : "Start for free"}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </main>

      <LandingFooter locale={locale} content={content} showColumns={false} inlineLegalWithBrand />
    </div>
  );
}
