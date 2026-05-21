"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Reveal } from "@/components/landing/Reveal";
import { getLandingContent } from "@/components/landing/content";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { useLocale } from "@/lib/useLocale";

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
            ? "Envoie ta musique avec un seul lien, track, pack complet ou dossier entier."
            : "Send your music with one link, a single track, a full pack, or a whole folder.",
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
            ? "Preuve horodatée et certifiée par hash, infalsifiable."
            : "Timestamped, hash-certified proof of authorship, tamper-proof.",
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
            ? "Combien de secondes chaque destinataire a écouté, track par track."
            : "How long each recipient actually listened, track by track.",
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
            ? "Visualise où tes contacts décrochent entre ouverture, écoute, téléchargement et vente, pour voir exactement où agir."
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
            ? "Ta page vvault.app/tonnom, toutes tes sorties au même endroit."
            : "Your vvault.app/handle page, all your releases in one place.",
          free: true,
          pro: true,
          ultra: true,
        },
        {
          label: fr ? "Personnalisation du thème" : "Theme customization",
          desc: fr
            ? "Personnalise ton vault public avec tes couleurs, polices et layouts, ta page colle à ton identité d'artiste, pas à un template générique."
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
            ? "Publie automatiquement des snippets vidéo soignés de tes tracks sur TikTok, Reels et Shorts, sans montage ni export."
            : "Auto-publish polished video snippets of your tracks to TikTok, Instagram Reels, and YouTube Shorts, no editing or export needed.",
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
        /* Use pointer events and ignore touch, on iOS the classic
           mouseenter → click sequence fires on the FIRST tap: the
           enter handler opens the tip, then the click handler
           toggles it right back shut, which is why the user used
           to need two taps. With pointer events we can skip the
           hover-open path entirely when the input is a finger, so
           the first tap's click handler opens the tip cleanly. */
        onPointerEnter={(e) => {
          if (e.pointerType !== "touch") setOpen(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType !== "touch") setOpen(false);
        }}
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
            className="pointer-events-none absolute left-0 bottom-[calc(100%+14px)] z-[100] block w-max max-w-[240px] rounded-md px-2 py-1 text-[11px] font-normal leading-snug text-white/90"
            style={{
              /* Epidemic-style chat bubble, small, compact, solid
                 dark tile sitting above the label, with a downward
                 tail that points to the feature. No animation. */
              background: "#1c1d22",
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.08), 0 6px 18px -4px rgba(0,0,0,0.7)",
            }}
          >
            {desc}
            {/* Chat tail, a small triangle aligned under the left
               edge of the bubble pointing down to the label. Rendered
               as a rotated square so it gets the exact same 1px
               hairline border as the body via box-shadow; the matching
               bg color stitches the tail into the bubble so it reads
               as one shape, not two. */}
            <span
              aria-hidden="true"
              className="absolute left-3 top-full block h-[8px] w-[8px] -translate-y-1/2 rotate-45"
              style={{
                background: "#1c1d22",
                boxShadow:
                  "1px 1px 0 0 rgba(255,255,255,0.08)",
              }}
            />
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
        className="h-7 w-7 fill-none stroke-emerald-400/80 stroke-[2] sm:h-[22px] sm:w-[22px]"
      >
        <path d="M5 10.5l3.5 3.5L15 7" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-7 w-7 fill-none stroke-white/20 stroke-[1.8] sm:h-[22px] sm:w-[22px]"
    >
      <path d="M6 6l8 8M14 6l-8 8" />
    </svg>
  );
}

type PricingPageProps = {
  /* When provided, overrides the locale read from `useLocale()`.
     Used by /new where the locale is fixed by route. */
  locale?: "en" | "fr";
  /* When true, render the pricing UI as an inline section (no
     LandingNav, no LandingFooter, no scroll-to-top, no bottom FAQ
     or "Ready to start" sections — those live elsewhere on the
     hosting page). When false (default), render as a full page. */
  embedded?: boolean;
};

export default function PricingPage({
  locale: localeOverride,
  embedded = false,
}: PricingPageProps = {}) {
  const [localeFromHook] = useLocale();
  const locale = localeOverride ?? localeFromHook;
  const content = getLandingContent(locale);
  const [annual, setAnnual] = useState(true);
  const proPrice = annual ? "\u20ac7.49" : "\u20ac8.99";
  const ultraPrice = annual ? "\u20ac20.75" : "\u20ac24.99";
  /* Two separate flags for two separate concerns:
     - `stuck` , the compare-plans sticky is in its pinned/ride-up
       phase. Its glass backdrop should be ON whenever any part of
       the sticky is still showing content in/above the nav band,
       so the backdrop smoothly trails the sticky through ride-up
       instead of vanishing the moment the sticky is no longer
       flush against the nav.
     - `merged`, the sticky is FLUSH with the nav bottom (true pin).
       Only in this narrow state do we want the nav to drop its own
       glass so we don't stack two translucent surfaces. Outside of
       it the nav shows its normal scrolled glass + border. */
  const [stuck, setStuck] = useState(false);
  const [merged, setMerged] = useState(false);
  const staticHeaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    /* When embedded inside another landing, the host controls
       scroll position and document title — leave them alone. */
    if (embedded) return;
    window.scrollTo(0, 0);
    document.title = locale === "fr" ? "vvault | Tarifs" : "vvault | Pricing";
  }, [locale, embedded]);

  // The big "Compare plans" header uses `position: sticky` so it naturally
  // pins against the bottom of the primary nav as the user scrolls. We
  // detect when it's stuck so we can fade in the same glassmorphic
  // background as the nav, and, via a body class, hide the nav's
  // bottom border so the two bars visually merge into one continuous
  // glass strip (Epidemic / Resend pattern).
  useEffect(() => {
    const handleScroll = () => {
      const node = staticHeaderRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      // Nav is 72px on mobile, 68px from the `sm` breakpoint upward.
      const navHeight = window.innerWidth >= 640 ? 68 : 72;
      /* `isStuck`, sticky is in pin-or-ride-up mode. True from the
         moment its top reaches navHeight until its bottom scrolls
         above y=0. This is the window during which its glass
         backdrop should be visible: either covering the nav area
         (pinned) or providing glass behind the sticky's remaining
         content below the nav (ride-up). */
      const isStuck = rect.top <= navHeight + 0.5 && rect.bottom > 0;
      /* `isMerged`, the narrow slice where the sticky is FLUSH
         with the nav. Only here do we want the nav's own glass to
         disappear so the two don't stack. The instant the sticky
         starts riding up, the nav reclaims its glass and the
         backdrop continues handling the sticky's lower region. */
      const isMerged =
        rect.top >= navHeight - 0.5 && rect.top <= navHeight + 0.5;
      setStuck(isStuck);
      setMerged(isMerged);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Toggle the body class that hides the nav's glass + bottom border
  // while the Compare-plans bar is flush with the nav (true merge),
  // so the two surfaces don't stack. Driven by `merged`, NOT `stuck`
  //, `stuck` stays true through ride-up so the backdrop keeps
  // rendering behind the sticky's lower portion.
  useEffect(() => {
    if (merged) {
      document.body.classList.add("compare-pinned");
    } else {
      document.body.classList.remove("compare-pinned");
    }
    return () => {
      document.body.classList.remove("compare-pinned");
    };
  }, [merged]);

  const fr = locale === "fr";
  const everythingInFreeLabel = fr ? "Tout ce qui est dans Free, plus :" : "Everything in Free, plus:";
  const everythingInProLabel = fr ? "Tout ce qui est dans Pro, plus :" : "Everything in Pro, plus:";

  const plans: Array<{
    id: string;
    name: string;
    eyebrow?: string;
    price: string;
    period: string;
    audience?: string;
    includedHeading?: string;
    bullets: readonly string[];
    cta: string;
    href: string;
    loggedOutHref: string;
    featured: boolean;
  }> = [
    {
      id: "free",
      name: "Free",
      price: "\u20ac0",
      period: "",
      audience: fr ? "Pour commencer" : "Just getting started",
      includedHeading: undefined,
      bullets: fr
        ? [
            "1 campagne par jour, jusqu'à 5 contacts",
            "Liens de partage trackés (analytics complets sur Pro)",
            "Profil public complet et Lien en Bio",
            "Vends avec 15% de frais (les frais Stripe s'appliquent)",
            "100 Mo de stockage",
            "Certificat de dépôt légal SHA-256 sur chaque upload",
          ]
        : [
            "1 campaign per day, up to 5 contacts",
            "Trackable share links (full analytics on Pro)",
            "Full public profile and Link in Bio",
            "Sell with 15% fees (Stripe fees still apply)",
            "100 MB storage",
            "Legal SHA-256 deposit certificate on every track upload",
          ],
      cta: fr ? "S'inscrire" : "Sign up",
      href: "https://vvault.app/signup",
      loggedOutHref: "https://vvault.app/signup",
      featured: false,
    },
    {
      id: "pro",
      name: "Pro",
      eyebrow: content.pricingUi.mostPopular,
      price: proPrice,
      period: "/mo",
      audience: fr ? "Le plus populaire" : "Most popular",
      includedHeading: undefined,
      bullets: fr
        ? [
            "Stockage illimité",
            "Tracking illimité (ouvertures, clics, durée d'écoute, téléchargements)",
            "Campagnes illimitées",
            "Vends tes beats avec seulement 5% de frais (les frais Stripe s'appliquent)",
            "Wavematch (scanne les beats volés)",
          ]
        : [
            "Unlimited storage",
            "Unlimited tracking (opens, clicks, play duration, downloads)",
            "Unlimited campaigns",
            "Sell beats with only 5% fees (Stripe fees still apply)",
            "Wavematch (scans for stolen beats)",
          ],
      cta: fr ? "Rejoindre Pro" : "Join Pro now",
      href: "https://vvault.app/billing",
      loggedOutHref: "https://vvault.app/signup?plan=pro",
      featured: true,
    },
    {
      id: "ultra",
      name: "Ultra",
      price: ultraPrice,
      period: "/mo",
      audience: fr ? "Échelle et automatisation" : "Scaling with automation",
      includedHeading: undefined,
      bullets: fr
        ? [
            "Vends avec 0% de frais (les frais Stripe s'appliquent)",
            "Thèmes personnalisés",
            "Tout ce qui est dans Pro",
            "Autoscan Wavematch (scanne le web en continu pour détecter les beats volés)",
            "Relances automatiques",
            "Upload automatique sur YouTube",
            "-50% sur les soumissions d'opportunités",
          ]
        : [
            "Sell with 0% fees (Stripe fees still apply)",
            "Custom themes",
            "Everything in Pro",
            "Autoscan Wavematch (continuously scans the web for stolen beats)",
            "Automatic follow-ups",
            "Automatic upload on YouTube",
            "50% off opportunities submission",
          ],
      cta: fr ? "Rejoindre Ultra" : "Join Ultra now",
      href: "https://vvault.app/billing",
      loggedOutHref: "https://vvault.app/signup?plan=ultra",
      featured: false,
    },
  ];

  const mngmtPlan = {
    name: "MNGMT",
    price: fr ? "Sur mesure" : "Custom",
    audience: fr
      ? "Pour quelques-uns. Des services sur mesure, con\u00e7us main dans la main avec les beatmakers qui font d\u00e9j\u00e0 bouger les lignes."
      : "For a select few. Bespoke services, crafted hand-in-hand with the beatmakers already moving the needle.",
    bullet: fr
      ? "Pour quelques-uns. Services sur mesure, main dans la main."
      : "For a select few. Bespoke services, crafted hand-in-hand.",
    cta: fr ? "Contacter l'\u00e9quipe" : "Contact sales",
    href: "mailto:contact@vvault.app",
    note: fr ? "Sur invitation" : "By invitation",
  };

  const stickyPlans = [
    { id: "free", name: "Free", price: "\u20ac0", period: "", href: "https://vvault.app/signup" },
    { id: "pro", name: "Pro", price: proPrice, period: locale === "fr" ? "/mois" : "/mo", href: "https://vvault.app/signup?plan=pro" },
    { id: "ultra", name: "Ultra", price: ultraPrice, period: locale === "fr" ? "/mois" : "/mo", href: "https://vvault.app/signup?plan=ultra" },
  ];
  const startedLabel = fr ? "Commencer" : "Get Started";

  /* Outer chrome: full-page mode wraps in landing-root + Nav +
     Footer with the original padding. Embedded mode skips the
     chrome entirely (the host page already supplies it) and uses
     a normal section + lighter vertical padding. */
  const RootWrapper = embedded ? "section" : "div";
  const rootClassName = embedded
    ? "relative"
    : "landing-root min-h-screen bg-black font-sans text-[#f0f0f0]";
  const MainWrapper = embedded ? "div" : "main";
  const mainClassName = embedded
    ? "relative pt-24 pb-12 sm:pt-32 sm:pb-16"
    : "relative z-10 pb-32 pt-40 sm:pt-48";

  return (
    <RootWrapper className={rootClassName}>
      {!embedded && (
        <LandingNav locale={locale} content={content} showPrimaryLinks={true} />
      )}

      <MainWrapper className={mainClassName}>
        <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
          {/* Header */}
          <Reveal>
            <div className="text-center">
              <h1 className="font-display text-5xl font-semibold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
                {locale === "fr" ? "Tarifs" : "Pricing"}
              </h1>
              <p className="mx-auto mt-5 max-w-[640px] text-lg leading-relaxed text-white/55 sm:text-xl">
                {locale === "fr" ? (
                  <>
                    Des plans qui se remboursent
                    <br />
                    en un seul placement.
                  </>
                ) : (
                  <>
                    Plans that pay for themselves
                    <br />
                    in one placement.
                  </>
                )}
              </p>
            </div>
          </Reveal>

          {/* Plan cards, horizontally swipeable on mobile (Free → Pro
              → Ultra) with CSS scroll-snap; standard 3-col grid on lg.
              Mobile padding on each side lets every card snap to the
              true viewport center (including Free and Ultra), not
              just Pro. `touch-action: pan-x` on the scroller keeps
              vertical page scrolling stable, tapping or starting a
              near-vertical drag on a card doesn't jiggle the row. */}
          <Reveal className="relative z-20 mt-12 block">
            <div className="relative">
            <div
              className="pricing-card-scroll relative z-10 -mx-5 flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto overflow-y-visible scroll-smooth px-[13vw] lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:p-0 lg:snap-none"
              style={{
                WebkitOverflowScrolling: "touch",
                /* Explicitly allow BOTH horizontal and vertical pan so
                   the browser picks the axis based on the gesture's
                   angle. Horizontal drags move cards; near-vertical
                   drags pass through to the page scroll. Previously
                   this was `pan-x` which locked the carousel out of
                   vertical gestures entirely, users couldn't scroll
                   the page down from anywhere on a card. */
                touchAction: "pan-x pan-y",
                /* Still contain horizontal overscroll so reaching the
                   end of Ultra doesn't bounce the whole page. */
                overscrollBehaviorX: "contain",
              }}
            >
            {plans.map((p) => {
              // Internal "glow" via a vertical background gradient inside
              // each card. Pro is the bright navy (#0c2152) that fills
              // most of the card and fades just before the very top, so
              // the glow reads as punchy and goes high enough to lift the
              // whole card. Free + Ultra get a much subtler dark-grey
              // gradient that only covers the bottom third — a quiet hint
              // of glow that ends sooner, matching the user's spec.
              const cardBg = p.featured
                ? "linear-gradient(to top, rgba(13, 55, 143, 0.85) 0%, rgba(13, 55, 143, 0.65) 25%, rgba(12, 40, 110, 0.45) 50%, rgba(12, 33, 82, 0.22) 70%, rgba(12, 33, 82, 0.08) 80%, rgba(0, 0, 0, 0) 88%), #000000"
                : "linear-gradient(to top, rgba(60, 60, 65, 0.45) 0%, rgba(60, 60, 65, 0.32) 20%, rgba(60, 60, 65, 0.20) 40%, rgba(60, 60, 65, 0.10) 60%, rgba(60, 60, 65, 0.04) 75%, rgba(0, 0, 0, 0) 88%), #000000";
              return (
              <div
                key={p.name}
                /* Pro card wrapper sits at z-20 so its box-shadow paints
                   ON TOP of Free (z-10) and Ultra (z-10). Without this,
                   the neighbors' opaque black backgrounds would clip the
                   outer halo before it could bleed visibly across their
                   inner edges. With z-20 on Pro, its box-shadow is in
                   front and alpha-blends over the dark surfaces of the
                   neighbors, producing the soft Framer-style fade. */
                className={`flex w-[74vw] shrink-0 snap-center lg:w-auto lg:shrink lg:snap-none ${p.featured ? "relative z-20" : "relative z-10"}`}
              >
                {/* Outer positioning wrapper: relative so the "Most popular"
                    pill (absolute child) anchors to the card's top edge,
                    but the pill is a SIBLING of the overflow-hidden card ,
                    so the card clips its own glow/bg without clipping the
                    pill that straddles the outline. */}
                <div className="relative flex w-full flex-col">
                  <div
                    className="relative flex w-full flex-1 flex-col overflow-hidden rounded-2xl"
                    style={{
                      background: cardBg,
                      /* Outline rendered via `outline` + negative
                         `outline-offset` instead of inset box-shadow.
                         Visually identical position (1px inside the
                         border-box) but the browser draws outlines
                         with native rounded-corner antialiasing, so
                         the line stays uniform thickness all the way
                         around — no more "thin corners" artifact that
                         box-shadow can produce on rounded shapes.
                         box-shadow is now reserved purely for Pro's
                         outer halo. */
                      outline: "1px solid rgba(255, 255, 255, 0.14)",
                      outlineOffset: "-1px",
                      /* Compact halo with a downward y-offset so the
                         glow concentrates BELOW the card and barely
                         touches the area above. Lateral spread is
                         preserved (so the cross-card bleed onto Free
                         and Ultra inner edges still works), only the
                         upward visibility is reduced — matching the
                         mobile look the user wants. */
                      boxShadow: p.featured
                        ? "0 40px 80px 0 rgba(28, 95, 200, 0.18), 0 80px 160px 10px rgba(13, 55, 143, 0.10)"
                        : undefined,
                      WebkitFontSmoothing: "antialiased",
                    }}
                  >
                    <div className="relative z-10 flex flex-1 flex-col p-6 sm:p-8">
                  {/* Title row, plan name on the left and the monthly/annual
                      toggle on the right edge of the card for Pro and Ultra.
                      Both toggles drive the same `annual` state, so flipping
                      one updates both prices in lockstep. Free has no
                      toggle (no monthly/annual concept). */}
                  <div className="flex h-8 items-center justify-between gap-2">
                    <h3 className="text-2xl font-light text-white">
                      {p.name}
                    </h3>
                    {(p.name === "Pro" || p.name === "Ultra") && (
                      <button
                        type="button"
                        aria-label={content.pricingUi.toggleBillingAriaLabel}
                        aria-pressed={annual}
                        onClick={() => setAnnual((v) => !v)}
                        data-track-id="pricing.toggle_billing"
                        className="flex items-center gap-2 text-[11.5px] font-semibold tracking-wide text-white/70 transition-colors duration-200 hover:text-white"
                      >
                        <span>{fr ? "Annuel" : "Annual"}</span>
                        <span
                          className={`relative inline-block h-[18px] w-[32px] rounded-full transition-colors duration-200 ${
                            annual
                              ? "bg-[#4296f6]"
                              : "bg-white/15"
                          }`}
                        >
                          <span
                            className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow-sm transition-[left] duration-200 ${
                              annual ? "left-[16px]" : "left-[2px]"
                            }`}
                          />
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Price + inline "per month" — sits directly under
                      the title row. Big price digits on the left,
                      smaller "per month" baseline-aligned on the right.
                      Free has no period (`p.period` empty), so the
                      inline label doesn't render — €0 stands alone.
                      `isolation: isolate` + `key={p.price}` fix a Safari
                      GPU compositor glitch where stale glyphs could
                      ghost under updated digits when the price changes
                      in place. */}
                  <div className="mt-4 flex items-baseline gap-2" style={{ isolation: "isolate" }}>
                    {/* Price renders as plain text — no animation on
                        toggle. New digits replace old ones instantly. */}
                    <span className="text-[2rem] font-light leading-none text-white tabular-nums">
                      {p.price}
                    </span>
                    {p.period && (
                      <span className="text-[15px] font-medium leading-none text-white/45">
                        {fr ? "par mois" : "per month"}
                      </span>
                    )}
                  </div>

                  {/* Description / audience — sits BELOW the price.
                      Tight spacing keeps the card compact (overall card
                      height stays close to the Framer reference). */}
                  <p className="mt-3 text-[13px] font-medium leading-snug text-white/55">
                    {p.audience}
                  </p>

                  <div className="mt-5">
                    <LandingCtaLink
                      loggedInHref={p.href}
                      loggedOutHref={p.loggedOutHref || p.href}
                      track={{
                        buttonId: `pricing_page.card_${p.id}`,
                        surface: "pricing_page.cards",
                        locale,
                        planId: p.id,
                      }}
                      className={`inline-flex w-full items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 ${
                        p.featured
                          ? "bg-[#4397f8] text-white hover:bg-[#2c75d4] focus-visible:ring-[#4397f8]/35"
                          : "bg-white/[0.06] text-white hover:bg-white/[0.1] focus-visible:ring-white/20"
                      }`}
                    >
                      {p.cta}
                    </LandingCtaLink>
                  </div>

                  {p.includedHeading && (
                    <p className="mt-8 text-[12.5px] font-medium text-white/50">
                      {p.includedHeading}
                    </p>
                  )}
                  <ul className={`flex flex-col gap-2.5 ${p.includedHeading ? "mt-3" : "mt-5"}`}>
                    {p.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-2.5 text-[14.5px] font-medium leading-snug text-white/55"
                      >
                        <svg
                          viewBox="0 0 20 20"
                          className="mt-0 h-[18px] w-[18px] shrink-0 fill-none stroke-white/85 stroke-[2.2]"
                        >
                          <path d="M5 10.5l3.5 3.5L15 7" />
                        </svg>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto flex justify-start pt-6">
                    <a
                      href="#compare-plans"
                      className="text-[13px] font-medium text-white/55 underline underline-offset-4 decoration-white/30 transition-colors duration-200 hover:text-white hover:decoration-white/60"
                    >
                      {locale === "fr" ? "Voir plus" : "View more"}
                    </a>
                  </div>
                  </div>
                  </div>
                  {/* "Most popular" badge, sits on the top outline of the
                      featured card. Sibling of the overflow-hidden card so
                      the card can clip its own glow while the pill stays
                      fully visible straddling the border. Badge border
                      matches card border so the two outlines visually merge
                      into one continuous shape; the silver-on-dark fill
                      matches the card surface so the pill reads as part of
                      the same glass. */}
                </div>
              </div>
            );
            })}
            </div>
            </div>
          </Reveal>

          {/* MNGMT — single thin horizontal card beneath the three
              plan columns. Same visual language as Free / Ultra: pure
              black bg with a low-opacity grey gradient, but oriented
              left-to-right so the "glow" anchors at the MNGMT label
              (left side) and gradually fades out toward the Contact
              sales button (right side). Same 1px outline as the plan
              cards. Inline title + one-line description on the left,
              CTA pinned to the far right edge — keeps the card short.
              Tight top margin so the Pro card's outer halo bleeds onto
              the MNGMT top edge. */}
          <Reveal className="relative z-10 mt-8 block sm:mt-10">
            <div
              className="relative mx-auto w-[74vw] overflow-hidden rounded-2xl sm:w-auto"
              style={{
                background:
                  "linear-gradient(to right, rgba(60, 60, 65, 0.45) 0%, rgba(60, 60, 65, 0.32) 18%, rgba(60, 60, 65, 0.18) 38%, rgba(60, 60, 65, 0.08) 58%, rgba(60, 60, 65, 0.02) 75%, rgba(0, 0, 0, 0) 90%), #000000",
                outline: "1px solid rgba(255, 255, 255, 0.14)",
                outlineOffset: "-1px",
              }}
            >
              <div className="relative z-10 flex flex-col items-start gap-4 px-7 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-10 sm:py-7">
                <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-5">
                  <h3
                    className="shrink-0 text-[15px] leading-none text-white/90"
                    style={{
                      fontFamily:
                        "Geist, ui-sans-serif, system-ui, -apple-system, sans-serif",
                      fontWeight: 300,
                      letterSpacing: "0.42em",
                      /* Subtle right-fading mask on the wordmark — same
                         treatment the original MNGMT card used so the
                         logo reads as graphic, not body copy. */
                      maskImage:
                        "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.35) 100%)",
                      WebkitMaskImage:
                        "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.35) 100%)",
                    }}
                  >
                    {mngmtPlan.name}
                  </h3>
                  <p className="text-[13.5px] font-light leading-snug text-white/55 sm:text-[14px]">
                    {mngmtPlan.bullet}
                  </p>
                </div>
                <LandingCtaLink
                  loggedInHref={mngmtPlan.href}
                  loggedOutHref={mngmtPlan.href}
                  data-track-id="pricing.mngmt.contact_sales"
                  className="shrink-0 inline-flex items-center justify-center rounded-2xl bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-white/80 transition-colors duration-200 hover:bg-white/[0.12] hover:text-white"
                >
                  {mngmtPlan.cta}
                </LandingCtaLink>
              </div>
            </div>
          </Reveal>

          {/* Anchor button linking to the big comparison tables below.
              No border, no background, just big type with a hovering
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
                  aria-hidden
                  viewBox="0 0 20 20"
                  className="h-6 w-6 fill-none stroke-current stroke-[1.8] transform-gpu transition-transform duration-200 ease-out group-hover:translate-y-1.5 sm:h-7 sm:w-7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ willChange: "transform" }}
                >
                  <path d="M10 4v12M4 10l6 6 6-6" />
                </svg>
              </a>
            </div>
          </Reveal>

          {/* Trustpilot social proof */}
          <SocialProofSection locale={locale} />
        </div>

        {/* Comparison tables, full viewport width so the sticky header's
            glass backdrop extends edge-to-edge when pinned against the
            nav. When stuck, the sticky uses the *same* glassmorphic
            styling as the nav (rgba(0,0,0,0.55) + blur(14px)) so the
            two bars visually merge into one continuous strip. */}
        <div id="compare-plans" className="mt-28 scroll-mt-[72px] sm:mt-36 sm:scroll-mt-[68px]">
          {/* Sticky big header, position:sticky pins it at top:navHeight,
              so the primary nav stays visible above it. When pinned, the
              nav's bottom border is faded out via the `compare-pinned`
              body class in globals.css, so there is no line between them. */}
          <div
            ref={staticHeaderRef}
            className="sticky top-[72px] z-20 sm:top-[68px]"
          >
            {/* Unified glass backdrop, extends upward to cover the nav
                area when stuck so there's ONE continuous glass surface
                (no seam between nav and compare-plans). The nav itself
                is made fully transparent via the `compare-pinned` body
                class in globals.css, so this backdrop is the only glass
                visible from y=0 down to the bottom of the sticky bar. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 -top-[82px] sm:-top-[76px]"
              style={{
                /* Extends 20px PAST the nav's top edge as a buffer so
                   nothing subpixel can reveal a seam between the nav
                   and this glass, on any device or DPR. The extra
                   height is off-screen, so it costs nothing. Pinning
                   a single continuous glass surface (rather than two
                   stacked translucent layers) is what lets the nav
                   visually "merge" with the pinned compare-plans bar
                   on both mobile and desktop. */
                backgroundColor: stuck ? "rgba(0, 0, 0, 0.55)" : "transparent",
                backdropFilter: stuck ? "blur(14px)" : "none",
                WebkitBackdropFilter: stuck ? "blur(14px)" : "none",
                /* Snap on/off, the nav's matching glass is also snap
                   (see LandingNav). Transitioning either one alone (or
                   both in parallel) leaves a visible window where the
                   nav area is uncovered glass on scroll-past. */
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
                      data-track-id="pricing.toggle_billing"
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
                {/* Plan columns, 3-col on mobile (Free/Pro/Ultra only, no
                    MNGMT in the mobile sticky to keep it readable). Desktop
                    uses the parent grid's remaining 4 columns and adds a
                    white Get Started button under each plan. */}
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
                          ? fr
                            ? annual
                              ? "Par mois, facturé à l'année"
                              : "Par mois, facturé au mois"
                            : annual
                              ? "Per month, billed yearly"
                              : "Per month, billed monthly"
                          : fr
                            ? "Toujours gratuit"
                            : "Free forever"}
                      </p>
                      {/* Desktop-only white Get Started button under each
                          plan in the compare-plans header. Hidden on
                          mobile so the sticky strip stays compact there. */}
                      <LandingCtaLink
                        loggedInHref={p.href}
                        loggedOutHref={p.href}
                        track={{
                          buttonId: `pricing_page.compare_${p.id}`,
                          surface: "pricing_page.compare_plans",
                          locale,
                          planId: p.id,
                        }}
                        className="mt-3 hidden w-full items-center justify-center rounded-xl bg-white px-3 py-1.5 text-[12px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90 sm:inline-flex"
                      >
                        {startedLabel}
                      </LandingCtaLink>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feature rows, constrained back to max-w-1320 so content
              aligns perfectly under the sticky header's inner wrapper.
              A SINGLE <Reveal> wraps the whole table so the whole block
              fades in together on first viewport entry, not one
              per-section (that was 6 staggered fades, way too busy).
              `threshold={0}` fires the moment the table's top edge
              touches the viewport, without it, the default 0.18
              threshold on a multi-thousand-pixel element makes the
              user scroll hundreds of pixels past the top before the
              fade kicks in. */}
          <Reveal threshold={0}>
            <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
              {getComparisonSections(locale).map((section) => (
                <div key={section.title} className="mt-12 sm:mt-16">
                  {/* Section header, bigger, with divider underneath */}
                  <div className="border-b border-white/10 pb-3 sm:pb-4">
                    <h3 className="text-[18px] font-semibold text-white sm:text-[22px]">
                      {section.title}
                    </h3>
                  </div>
                  {/* Rows, mobile: label+desc full-width on top, 3-col values
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
                        {/* Values, 3-col grid on mobile, `contents` on desktop
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
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Re-enter max-w for the FAQ + final CTA — only on the
            standalone /pricing page. When embedded inside another
            landing (e.g. /new) the host renders its own FAQ + final
            CTA so we skip these to avoid duplicates. */}
        {!embedded && (
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
                  data-track-id="pricing.final_cta.start_free"
                  className="inline-flex items-center rounded-xl bg-white px-6 py-2.5 text-[14px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90"
                >
                  {locale === "fr" ? "Commencer gratuitement" : "Start for free"}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
        )}
      </MainWrapper>

      {!embedded && (
        <LandingFooter
          locale={locale}
          content={content}
          showColumns={false}
          inlineLegalWithBrand
        />
      )}
    </RootWrapper>
  );
}
