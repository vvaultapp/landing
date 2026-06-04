/* Copy + data for the refondue landing at /new.
   Kept fully separate from the existing content.ts so the legacy
   landing stays untouched while we iterate. Locales: en + fr. */

import type { Locale } from "@/components/landing/content";

export type LandingNewToolId =
  | "library"
  | "campaigns"
  | "analytics"
  | "contacts"
  | "sales"
  | "studio"
  | "profile"
  | "certificate";

export type LandingNewToolMeta = {
  id: LandingNewToolId;
  name: string;
  oneLiner: string;
  href: string;
  /* Hex accent that drives the card glow + emblem tint. */
  accent: string;
  /* When true, the card is included in the trimmed 4-card mobile
     view. The other four are hidden behind a "View all features"
     link to keep the mobile scroll short. */
  mobilePrimary?: boolean;
};

export type LandingNewProblemPair = {
  beforeIcon: string;
  beforeTitle: string;
  beforeDesc: string;
  afterTitle: string;
  afterDesc: string;
};

export type LandingNewWorkflowStep = {
  idx: number;
  name: string;
  copy: string;
};

export type LandingNewContent = {
  problemGap: {
    titleLine1: string;
    titleLine2: string;
    pairs: LandingNewProblemPair[];
    closingLine: string;
  };
  toolsGallery: {
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    hintHover: string;
    tools: LandingNewToolMeta[];
  };
  workflow: {
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    steps: LandingNewWorkflowStep[];
    ctaLabel: string;
  };
  finalCta: {
    title: string;
    sub: string;
    ctaLabel: string;
    ctaHref: string;
  };
};

const en: LandingNewContent = {
  problemGap: {
    titleLine1: "Your music lives across six apps.",
    titleLine2: "You're losing leads in the gaps.",
    pairs: [
      {
        beforeIcon: "mail",
        beforeTitle: "Beats sent in Gmail",
        beforeDesc: "No idea if they opened, played, or replied.",
        afterTitle: "Sends with full tracking",
        afterDesc: "Every open, play, save, download — live.",
      },
      {
        beforeIcon: "folder",
        beforeTitle: "Tracks scattered in Drive",
        beforeDesc: "No CRM. Leads die in your inbox.",
        afterTitle: "Library + Contacts in one place",
        afterDesc: "Segment by who actually listens.",
      },
      {
        beforeIcon: "wallet",
        beforeTitle: "15–30% to marketplaces",
        beforeDesc: "Beatstars takes a cut on every sale.",
        afterTitle: "Sell direct, keep 95–100%",
        afterDesc: "Stripe checkout. Your prices.",
      },
    ],
    closingLine: "vvault is the workspace that puts it back together.",
  },
  toolsGallery: {
    titleLine1: "One workspace, eight tools.",
    titleLine2: "Zero context switching.",
    subtitle:
      "Each tool is built for music ops. Hover any card to see it in action.",
    hintHover: "Hover to preview",
    tools: [
      {
        id: "library",
        name: "Library",
        oneLiner: "Upload, organize, share. Private by default.",
        href: "/features/library",
        accent: "#a78bfa",
        mobilePrimary: true,
      },
      {
        id: "campaigns",
        name: "Campaigns",
        oneLiner: "Send packs to your contacts in one flow.",
        href: "/features/campaigns",
        accent: "#60a5fa",
        mobilePrimary: true,
      },
      {
        id: "analytics",
        name: "Analytics",
        oneLiner: "Opens, plays, downloads, replies — live.",
        href: "/features/analytics",
        accent: "#fbbf24",
        mobilePrimary: true,
      },
      {
        id: "contacts",
        name: "Contacts",
        oneLiner: "CRM for A&Rs, artists, and labels.",
        href: "/features/contacts",
        accent: "#34d399",
      },
      {
        id: "sales",
        name: "Sales",
        oneLiner: "Stripe checkout. Keep 95–100% of sales.",
        href: "/features/sales",
        accent: "#00b67a",
        mobilePrimary: true,
      },
      {
        id: "studio",
        name: "Studio",
        oneLiner: "Auto-post Reels, Shorts, TikToks.",
        href: "/features/studio",
        accent: "#f472b6",
      },
      {
        id: "profile",
        name: "Profile + Link in Bio",
        oneLiner: "Your public page, your catalog, one link.",
        href: "/features/profile",
        accent: "#c084fc",
      },
      {
        id: "certificate",
        name: "Certificate",
        oneLiner: "Timestamped proof you made it first.",
        href: "/certificate",
        accent: "#fbbf24",
      },
    ],
  },
  workflow: {
    titleLine1: "From upload to sale.",
    titleLine2: "Four steps, one workspace.",
    subtitle:
      "Drop a beat. Send it. See who's listening. Close the deal. Same workspace, every time.",
    steps: [
      {
        idx: 1,
        name: "Upload",
        copy: "Drop your beats. We auto-unzip, extract metadata, generate artwork.",
      },
      {
        idx: 2,
        name: "Send",
        copy: "Pick contacts. Hit send. Email lands from your own Gmail.",
      },
      {
        idx: 3,
        name: "Track",
        copy: "Live activity feed: opens, plays, downloads, replies.",
      },
      {
        idx: 4,
        name: "Convert",
        copy: "Spot the hot lead. Follow up. Close the placement or sale.",
      },
    ],
    ctaLabel: "Start the loop. Free, no card.",
  },
  finalCta: {
    title: "Ship your music like a business. Starting today.",
    sub: "Free forever. No card needed. 2 minutes to set up.",
    ctaLabel: "Get Started",
    ctaHref: "https://vvault.app/signup",
  },
};

const fr: LandingNewContent = {
  problemGap: {
    titleLine1: "Ta musique vit dans six apps.",
    titleLine2: "Tu perds des leads entre les deux.",
    pairs: [
      {
        beforeIcon: "mail",
        beforeTitle: "Beats envoyés via Gmail",
        beforeDesc: "Aucune idée s'ils ont ouvert, écouté ou répondu.",
        afterTitle: "Envois avec tracking complet",
        afterDesc: "Chaque ouverture, écoute, sauvegarde — en direct.",
      },
      {
        beforeIcon: "folder",
        beforeTitle: "Tracks éparpillés dans Drive",
        beforeDesc: "Pas de CRM. Les leads meurent dans ta boîte mail.",
        afterTitle: "Library + Contacts au même endroit",
        afterDesc: "Segmente selon qui écoute réellement.",
      },
      {
        beforeIcon: "wallet",
        beforeTitle: "15–30% aux marketplaces",
        beforeDesc: "Beatstars prend une part sur chaque vente.",
        afterTitle: "Vends en direct, garde 95–100%",
        afterDesc: "Checkout Stripe. Tes prix.",
      },
    ],
    closingLine: "vvault est le workspace qui remet tout ça ensemble.",
  },
  toolsGallery: {
    titleLine1: "Un workspace, huit outils.",
    titleLine2: "Zéro changement de contexte.",
    subtitle:
      "Chaque outil est pensé pour les opérations musique. Survole une card pour la voir en action.",
    hintHover: "Survole pour prévisualiser",
    tools: [
      {
        id: "library",
        name: "Library",
        oneLiner: "Upload, organise, partage. Privé par défaut.",
        href: "/features/library",
        accent: "#a78bfa",
        mobilePrimary: true,
      },
      {
        id: "campaigns",
        name: "Campaigns",
        oneLiner: "Envoie tes packs à tes contacts en un flow.",
        href: "/features/campaigns",
        accent: "#60a5fa",
        mobilePrimary: true,
      },
      {
        id: "analytics",
        name: "Analytics",
        oneLiner: "Ouvertures, écoutes, downloads, réponses — en direct.",
        href: "/features/analytics",
        accent: "#fbbf24",
        mobilePrimary: true,
      },
      {
        id: "contacts",
        name: "Contacts",
        oneLiner: "CRM pour A&Rs, artistes et labels.",
        href: "/features/contacts",
        accent: "#34d399",
      },
      {
        id: "sales",
        name: "Sales",
        oneLiner: "Checkout Stripe. Garde 95–100% de tes ventes.",
        href: "/features/sales",
        accent: "#00b67a",
        mobilePrimary: true,
      },
      {
        id: "studio",
        name: "Studio",
        oneLiner: "Auto-poste tes Reels, Shorts, TikToks.",
        href: "/features/studio",
        accent: "#f472b6",
      },
      {
        id: "profile",
        name: "Profile + Link in Bio",
        oneLiner: "Ta page publique, ton catalogue, un seul lien.",
        href: "/features/profile",
        accent: "#c084fc",
      },
      {
        id: "certificate",
        name: "Certificate",
        oneLiner: "Preuve horodatée que t'es le premier dessus.",
        href: "/certificate",
        accent: "#fbbf24",
      },
    ],
  },
  workflow: {
    titleLine1: "De l'upload à la vente.",
    titleLine2: "Quatre étapes, un workspace.",
    subtitle:
      "Drop un beat. Envoie-le. Vois qui écoute. Close le deal. Même workspace, à chaque fois.",
    steps: [
      {
        idx: 1,
        name: "Upload",
        copy: "Drop tes beats. On dézippe, on extrait les metadata, on génère l'artwork.",
      },
      {
        idx: 2,
        name: "Send",
        copy: "Choisis tes contacts. Envoie. L'email part depuis ton propre Gmail.",
      },
      {
        idx: 3,
        name: "Track",
        copy: "Feed d'activité en direct : ouvertures, écoutes, downloads, réponses.",
      },
      {
        idx: 4,
        name: "Convert",
        copy: "Repère le hot lead. Relance. Close le placement ou la vente.",
      },
    ],
    ctaLabel: "Lance la boucle. Gratuit, sans carte.",
  },
  finalCta: {
    title: "Gère ta musique comme un vrai business. Dès aujourd'hui.",
    sub: "Gratuit pour toujours. Sans carte. 2 minutes pour démarrer.",
    ctaLabel: "Commencer",
    ctaHref: "https://vvault.app/signup",
  },
};

export const landingNewContentByLocale: Record<Locale, LandingNewContent> = {
  en,
  fr,
};

export function getLandingNewContent(locale: Locale = "en"): LandingNewContent {
  return landingNewContentByLocale[locale];
}
