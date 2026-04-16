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
        {
          label: fr ? "Automatisations en séries" : "Series automations",
          desc: fr
            ? "Séquences d'envoi pré-construites qui se déclenchent sur des événements (nouveaux inscrits, inactivité, nouvelle sortie)."
            : "Pre-built send sequences that run automatically on triggers like new signups, inactivity, or a fresh drop.",
          free: false,
          pro: false,
          ultra: true,
        },
        {
          label: fr ? "Séquences email automatisées (drip)" : "Automated email sequences (drip)",
          desc: fr
            ? "Flux d'emails planifiés sur plusieurs jours ou semaines pour relancer les contacts au bon moment, sans intervention manuelle."
            : "Scheduled multi-step email flows that space out messages over days or weeks to nurture contacts without manual work.",
          free: false,
          pro: false,
          ultra: true,
        },
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
        {
          label: fr ? "Funnels d'engagement" : "Engagement funnels",
          desc: fr
            ? "Visualise où tes contacts décrochent entre ouverture, écoute, téléchargement et vente — pour voir exactement où agir."
            : "Visualize where contacts drop off across opens, plays, downloads, and sales, so you can see which stage needs attention.",
          free: false,
          pro: true,
          ultra: true,
        },
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
        {
          label: fr ? "Smart Segments (segments dynamiques)" : "Smart Segments (dynamic rule-based)",
          desc: fr
            ? "Groupes de contacts auto-mis à jour selon des règles (ex. ouvert il y a 7 jours, écouté plus de 60s). La liste évolue avec l'activité."
            : "Auto-updating contact groups built from rules (e.g. opened in last 7 days, listened > 60s). Membership changes as activity does.",
          free: false,
          pro: true,
          ultra: true,
        },
        {
          label: fr ? "Opportunités & tableau de demandes" : "Opportunities & request board",
          desc: fr
            ? "Inbox pour les demandes de beats et placements entrants. Suis chaque lead du premier contact jusqu'au deal signé."
            : "Inbox for incoming beat requests and placements. Track every lead from first touch to signed deal in one board.",
          free: true,
          pro: true,
          ultra: true,
        },
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
        {
          label: fr ? "Personnalisation du thème" : "Theme customization",
          desc: fr
            ? "Personnalise ton vault public avec tes couleurs, polices et layouts — ta page colle à ton identité d'artiste, pas à un template générique."
            : "Brand your public vault with custom colors, fonts, and layouts so your page matches your artist identity, not a generic template.",
          free: false,
          pro: false,
          ultra: true,
        },
        { label: fr ? "Crédits de placement" : "Placement credits", free: true, pro: true, ultra: true },
        { label: fr ? "Liens sociaux (IG, YT, TT)" : "Social links (IG, YT, TT)", free: true, pro: true, ultra: true },
        { label: fr ? "Embeds (lecteurs intégrables) avec tracking" : "Embeds (embeddable players) with tracking", free: true, pro: true, ultra: true },
        { label: fr ? "Codes QR" : "QR codes", free: true, pro: true, ultra: true },
        { label: fr ? "Domaine personnalisé" : "Custom domain", free: false, pro: false, ultra: true },
        { label: fr ? "Embeds brandés" : "Branded embeds", free: false, pro: false, ultra: true },
        {
          label: fr ? "Studio Packs (publication auto vidéo)" : "Studio Packs (auto video publishing)",
          desc: fr
            ? "Publie automatiquement des snippets vidéo soignés de tes tracks sur TikTok, Reels et Shorts — sans montage ni export."
            : "Auto-publish polished video snippets of your tracks to TikTok, Instagram Reels, and YouTube Shorts — no editing or export needed.",
          free: false,
          pro: false,
          ultra: true,
        },
        {
          label: fr ? "Mise en avant section Browse" : "Browse section highlight",
          desc: fr
            ? "Mise en avant dans le feed de découverte public de vvault pour que plus d'auditeurs tombent sur ta musique."
            : "Featured placement in vvault's public discovery feed so more listeners find your music without extra promotion.",
          free: false,
          pro: false,
          ultra: true,
        },
      ],
    },
  ];
}

/* Label with a bullet-dotted underline + hover tooltip.
   Rows that already carry a `desc` are the "complex" ones (the content
   author curated that set). For those we hide the always-visible
   second line and instead decorate the label with small dotted bullets
   underneath. On hover the bullets disappear INSTANTLY (no fade) and
   a compact explainer card pops in. On touch devices (no hover)
   tapping the label toggles the card. */
function FeatureLabel({ label, desc }: { label: string; desc?: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  /* Tap-outside on mobile closes the tooltip. */
  useEffect(() => {
    if (!open) return;
    const handleDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleDocClick, { passive: true });
    document.addEventListener("touchstart", handleDocClick, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleDocClick);
      document.removeEventListener("touchstart", handleDocClick);
    };
  }, [open]);

  if (!desc) {
    return (
      <p className="text-[14px] font-medium leading-snug text-white/90 sm:text-[16px]">
        {label}
      </p>
    );
  }

  return (
    <p className="text-[14px] font-medium leading-snug text-white/90 sm:text-[16px]">
      <span
        ref={containerRef}
        className="relative inline-block align-baseline"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <span
          role="button"
          tabIndex={0}
          onClick={() => setOpen((v) => !v)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpen((v) => !v);
            }
          }}
          className="cursor-help focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          style={{
            /* Bullet-dot underline: small round dots at the bottom of
               the text baseline. Cleared instantly when `open` (no
               CSS transition on backgroundImage) so the bullets pop
               off without a fade. */
            backgroundImage: open
              ? "none"
              : "radial-gradient(circle, rgba(255,255,255,0.45) 1.1px, transparent 1.3px)",
            backgroundSize: "5px 3px",
            backgroundRepeat: "repeat-x",
            backgroundPosition: "left bottom",
            paddingBottom: "5px",
          }}
        >
          {label}
        </span>
        {open && (
          <span
            role="tooltip"
            className="pointer-events-none absolute left-0 top-[calc(100%+6px)] z-30 block w-[min(260px,calc(100vw-2.5rem))] rounded-[14px] p-3.5 text-[12px] font-normal leading-snug text-white/78 sm:text-[12.5px]"
            style={{
              background:
                "linear-gradient(180deg, rgba(22,22,28,1) 0%, rgba(12,12,16,1) 100%)",
              /* 1px hairline ring via shadow (pixel-perfect on every
                 device — a `border` at low alpha can look patchy on
                 Retina because the alpha gets rounded per sub-pixel).
                 A soft inner top highlight sells the "card" feel.
                 Outer shadow is layered (two stops) so the drop is
                 smooth and not a single sharp halo. */
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.11), inset 0 1px 0 rgba(255,255,255,0.05), 0 16px 40px -12px rgba(0,0,0,0.8), 0 4px 14px -4px rgba(0,0,0,0.55)",
              animation: "feature-tip-in 140ms cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
          >
            {desc}
          </span>
        )}
      </span>
    </p>
  );
}

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return (
      <span className="block break-words text-left text-[13px] font-medium leading-snug text-white/80 sm:text-[15px]">
        {value}
      </span>
    );
  }
  if (value) {
    return (
      <svg
        viewBox="0 0 20 20"
        className="h-5 w-5 fill-none stroke-emerald-400/80 stroke-[2] sm:h-[22px] sm:w-[22px]"
      >
        <path d="M5 10.5l3.5 3.5L15 7" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-5 w-5 fill-none stroke-white/20 stroke-[1.8] sm:h-[22px] sm:w-[22px]"
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
  const [stuck, setStuck] = useState(false);
  const staticHeaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = locale === "fr" ? "vvault | Tarifs" : "vvault | Pricing";
  }, [locale]);

  // The big "Compare plans" header uses `position: sticky` so it naturally
  // pins against the bottom of the primary nav as the user scrolls. We
  // detect when it's stuck so we can fade in the same glassmorphic
  // background as the nav — and, via a body class, hide the nav's
  // bottom border so the two bars visually merge into one continuous
  // glass strip (Epidemic / Resend pattern).
  useEffect(() => {
    const handleScroll = () => {
      const node = staticHeaderRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      // Nav is 62px on mobile, 56px from the `sm` breakpoint upward.
      const navHeight = window.innerWidth >= 640 ? 56 : 62;
      setStuck(rect.top <= navHeight + 0.5);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Toggle the body class that hides the nav's bottom border while the
  // Compare-plans bar is pinned, so the two bars merge seamlessly.
  useEffect(() => {
    if (stuck) {
      document.body.classList.add("compare-pinned");
    } else {
      document.body.classList.remove("compare-pinned");
    }
    return () => {
      document.body.classList.remove("compare-pinned");
    };
  }, [stuck]);

  const fr = locale === "fr";
  const everythingInFreeLabel = fr ? "Tout ce qui est dans Free, plus :" : "Everything in Free, plus:";
  const everythingInProLabel = fr ? "Tout ce qui est dans Pro, plus :" : "Everything in Pro, plus:";

  const plans: Array<{
    name: string;
    eyebrow?: string;
    price: string;
    period: string;
    includedHeading?: string;
    bullets: readonly string[];
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
                      className={`absolute inset-y-0 my-auto h-5 w-5 rounded-full bg-white transition-[left] duration-200 ${
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

          {/* Anchor button linking to the big comparison tables below.
              No border, no background — just big type with a hovering
              arrow (the click target IS the text). */}
          <Reveal>
            <div className="mt-14 flex justify-center sm:mt-16">
              <a
                href="#compare-plans"
                className="group inline-flex items-center gap-3 text-[22px] font-medium text-white/85 transition-colors duration-200 hover:text-white sm:gap-4 sm:text-[28px]"
              >
                <span>
                  {locale === "fr" ? "Comparer les plans" : "Compare plans"}
                </span>
                <svg
                  viewBox="0 0 20 20"
                  className="h-6 w-6 fill-none stroke-current stroke-[1.8] transition-transform duration-300 ease-out group-hover:translate-y-1.5 sm:h-7 sm:w-7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 4v12M4 10l6 6 6-6" />
                </svg>
              </a>
            </div>
          </Reveal>

          {/* Trustpilot social proof */}
          <SocialProofSection locale={locale} />
        </div>

        {/* Comparison tables — full viewport width so the sticky header's
            glass backdrop extends edge-to-edge when pinned against the
            nav. When stuck, the sticky uses the *same* glassmorphic
            styling as the nav (rgba(0,0,0,0.55) + blur(14px)) so the
            two bars visually merge into one continuous strip. */}
        <div id="compare-plans" className="mt-28 sm:mt-36">
          {/* Sticky big header — position:sticky pins it at top:navHeight,
              so the primary nav stays visible above it. When pinned, the
              nav's bottom border is faded out via the `compare-pinned`
              body class in globals.css, so there is no line between them. */}
          <div
            ref={staticHeaderRef}
            className="sticky top-[62px] z-20 sm:top-[56px]"
          >
            {/* Unified glass backdrop — extends upward to cover the nav
                area when stuck so there's ONE continuous glass surface
                (no seam between nav and compare-plans). The nav itself
                is made fully transparent via the `compare-pinned` body
                class in globals.css, so this backdrop is the only glass
                visible from y=0 down to the bottom of the sticky bar. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 -top-[72px] sm:-top-[66px]"
              style={{
                /* Extends 10px PAST the nav's top edge as a safety
                   buffer so any subpixel rounding or transition-timing
                   difference between the nav and this glass can't
                   expose a 1-2px horizontal seam at their boundary.
                   The extra is off-screen, so it costs nothing. */
                backgroundColor: stuck ? "rgba(0, 0, 0, 0.55)" : "transparent",
                backdropFilter: stuck ? "blur(14px)" : "none",
                WebkitBackdropFilter: stuck ? "blur(14px)" : "none",
                transition:
                  "background-color 0.3s ease, backdrop-filter 0.3s ease, -webkit-backdrop-filter 0.3s ease",
              }}
            />
            <div className="mx-auto w-full max-w-[1320px] px-5 pb-6 pt-5 sm:px-8 sm:pb-8 sm:pt-6 lg:px-10">
              {/* Mobile: big title + toggle stacked full-width on top, then
                  the 3 plan columns beneath. Desktop: single 40/20/20/20 row
                  aligning with the feature tables below. */}
              <div className="sm:grid sm:grid-cols-[40%_20%_20%_20%] sm:items-end">
                <div className="pr-4">
                  <h2 className="text-[1.75rem] font-semibold leading-[1.0] tracking-[-0.02em] text-white sm:text-[2.3rem] lg:text-[2.3rem]">
                    {locale === "fr" ? "Comparer les plans" : "Compare plans"}
                  </h2>
                  <div className="mt-3 flex flex-wrap items-center gap-2.5 sm:mt-4">
                    <button
                      type="button"
                      onClick={() => setAnnual((v) => !v)}
                      aria-label={content.pricingUi.toggleBillingAriaLabel}
                      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${
                        annual ? "bg-emerald-500/80" : "bg-white/15"
                      }`}
                    >
                      <span
                        className={`absolute inset-y-0 my-auto h-[14px] w-[14px] rounded-full bg-white transition-[left] duration-200 ${
                          annual ? "left-[18px]" : "left-[3px]"
                        }`}
                      />
                    </button>
                    <span className="text-[12.5px] font-medium text-white/75 sm:text-[13px]">
                      {locale === "fr" ? "Facturation annuelle" : "Yearly billing"}
                    </span>
                    <span className="text-[11.5px] text-white/35 sm:text-[12px]">
                      -{" "}
                      {locale === "fr" ? "Économise 17%" : "Save up to 17%"}
                    </span>
                  </div>
                </div>
                {/* Plan columns — 3-col on mobile (rendered below the title),
                    desktop uses the parent grid's remaining 3 columns. */}
                <div className="mt-6 grid grid-cols-3 gap-0 sm:mt-0 sm:contents">
                  {stickyPlans.map((p) => (
                    <div key={p.name} className="pl-1 sm:pl-3">
                      <h3 className="text-[14px] font-semibold leading-tight text-white sm:text-[22px]">
                        {p.name}
                      </h3>
                      <p className="mt-0.5 text-[13px] font-medium tabular-nums leading-tight text-white sm:mt-1 sm:text-[18px]">
                        {p.price}
                        {p.period && (
                          <span className="text-white/45">{p.period}</span>
                        )}
                      </p>
                      <p className="mt-0.5 text-[9.5px] leading-snug text-white/40 sm:mt-1 sm:text-[11px]">
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
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feature rows — constrained back to max-w-1320 so content
              aligns perfectly under the sticky header's inner wrapper. */}
          <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
            {getComparisonSections(locale).map((section) => (
              <Reveal key={section.title} className="mt-12 sm:mt-16">
                {/* Section header — bigger, with divider underneath */}
                <div className="border-b border-white/10 pb-3 sm:pb-4">
                  <h3 className="text-[18px] font-semibold text-white sm:text-[22px]">
                    {section.title}
                  </h3>
                </div>
                {/* Rows — mobile: label+desc full-width on top, 3-col values
                    underneath. Desktop: single 40/20/20/20 row. Same min-
                    height per row to match Epidemic Sound. */}
                <div className="flex flex-col">
                  {section.rows.map((row) => (
                    <div
                      key={row.label}
                      className="grid min-h-[138px] grid-cols-1 border-b border-white/[0.06] sm:min-h-[96px] sm:grid-cols-[40%_20%_20%_20%] sm:items-center"
                    >
                      {/* Label + tooltip (for complex features with a desc) */}
                      <div className="pb-2 pr-4 pt-5 sm:py-6">
                        <FeatureLabel label={row.label} desc={row.desc} />
                      </div>
                      {/* Values — 3-col grid on mobile, `contents` on desktop
                          so each cell becomes a direct child of the parent
                          grid and lands in its own 20% column. Left-aligned
                          to line up with the plan-column headers above
                          (same pattern as Epidemic Sound). */}
                      <div className="grid grid-cols-3 gap-0 pb-5 sm:contents">
                        <div className="flex items-center justify-start pl-1 pr-1 py-2 sm:py-6 sm:pl-3 sm:pr-2">
                          <CellValue value={row.free} />
                        </div>
                        <div className="flex items-center justify-start pl-1 pr-1 py-2 sm:py-6 sm:pl-3 sm:pr-2">
                          <CellValue value={row.pro} />
                        </div>
                        <div className="flex items-center justify-start pl-1 pr-1 py-2 sm:py-6 sm:pl-3 sm:pr-2">
                          <CellValue value={row.ultra} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Re-enter max-w for the FAQ + final CTA */}
        <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">

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
                  className="inline-flex items-center rounded-xl bg-white px-6 py-2.5 text-[14px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90"
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
