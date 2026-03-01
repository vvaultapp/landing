export type LandingNavItem = {
  label: string;
  href: string;
};

export type LandingFeature = {
  title: string;
  description: string;
  stat: string;
};

export type LandingStep = {
  title: string;
  description: string;
  detail: string;
};

export type LandingFaq = {
  question: string;
  answer: string;
};

export type LandingComparisonCard = {
  title: string;
  bullets: string[];
  cost: string;
  costNote: string;
  symbol: "check" | "cross";
};

export type LandingSinglePlan = {
  name: string;
  price: string;
  note: string;
  cta: string;
  bullets: string[];
};

export type LandingFooterLink = {
  label: string;
  href: string;
};

export type Locale = "en" | "fr";

const landingContentEn = {
  brand: "vvault",
  skipToContentLabel: "Skip to content",
  ui: {
    homepageAriaLabel: "vvault homepage",
    login: "Login",
    languageEnglish: "ENG",
    languageFrench: "FR",
    languageSwitcherAriaLabel: "Switch language",
    mobileSystemLabel: "System",
    mobileResourcesLabel: "Resources",
  },
  nav: [
    { label: "Product", href: "#product" },
    { label: "Workflow", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Contact", href: "#contact" },
  ] as LandingNavItem[],
  hero: {
    title: ["Send beats. Track results.", "Get placements."],
    description: "Turn emails into placements. Track opens, plays, downloads and more.",
    newBadge: "New",
    onyxLabel: "ONYX YouTube Uploader",
    ratingLabel: "Used by 600+ producers daily",
  },
  heroStatement: {
    strong: "Know who’s really listening.",
    muted: "Follow up faster, send better packs, and turn interest into placements and sales.",
    videoUrl: "https://www.youtube.com/embed/nKfITo6LLts",
    videoTitle: "vvault demo video",
  },
  howItWorksIntro: {
    title: "Know who’s ready before you follow up.",
    description:
      "Every send becomes measurable: opens, clicks, play duration, downloads, and saves. Build packs fast, email unlimited contacts, and use real intent signals to follow up at the right time and land placements or sales.",
    stepLabel: "Step",
    imagePlaceholder: "Step image placeholder",
  },
  features: [
    {
      title: "Upload and organize at speed",
      description:
        "Drop multiple files, auto-unpack ZIPs, and keep your library structured without breaking flow.",
      stat: "ZIP auto-unpack",
    },
    {
      title: "Share links that convert",
      description:
        "Publish tracks, packs, and folders with private, tokenized, or public links built for fast listening.",
      stat: "Track, pack, folder links",
    },
    {
      title: "Run campaigns in one place",
      description:
        "Create, schedule, and send campaigns directly from vvault while keeping contacts and history together.",
      stat: "Send + schedule",
    },
    {
      title: "Track true engagement",
      description:
        "Measure opens, clicks, play duration, saves, downloads, and sales to see what actually moves.",
      stat: "Full engagement visibility",
    },
    {
      title: "Sell with Stripe checkout",
      description:
        "Offer licenses, secure paid downloads, and keep checkout tied to your content and analytics.",
      stat: "Marketplace ready",
    },
    {
      title: "Scale with Pro and Ultra",
      description:
        "Unlock CRM, automation, advanced scheduling, and branding controls as your volume grows.",
      stat: "Upgrade when ready",
    },
  ] as LandingFeature[],
  howItWorks: [
    {
      title: "Upload",
      description: "Bring tracks into your private library with metadata, artwork, and clean file handling.",
      detail: "Drag and drop multi-file uploads, ZIP support, and everything stays ready to use.",
    },
    {
      title: "Organize",
      description: "Sort everything into folders, packs, and series so your catalog stays clean and shareable.",
      detail: "Build repeatable pack templates and keep every release structured.",
    },
    {
      title: "Send",
      description: "Email unlimited contacts in a few clicks with campaign sending built-in.",
      detail: "No more manual attachments, messy threads, or juggling tools.",
    },
    {
      title: "Track + Convert",
      description:
        "See exactly what happens after you send: opens, clicks, plays (and how long), downloads, and saves, then turn that momentum into placements or sales.",
      detail:
        "Identify high-intent listeners, follow up at the perfect moment, and convert through a low-fee marketplace built for producers.",
    },
  ] as LandingStep[],
  updates: {
    title: "Updates",
    subtitle: "Recent product changes",
    items: [
      {
        title: "Campaign Performance Clarity",
        text: "Play-duration and engagement signals are now cleaner across campaign and link analytics.",
        date: "Feb 2026",
      },
      {
        title: "Marketplace Checkout Reliability",
        text: "Purchase and delivery flow stability improved for paid licenses and secure downloads.",
        date: "Feb 2026",
      },
      {
        title: "Series Automation Controls",
        text: "Ultra workflows now include tighter controls for recurring releases and timed access.",
        date: "Jan 2026",
      },
    ],
  },
  logoStrip: ["Independent Producers", "Studios", "Managers", "A&R Teams", "Labels", "Creators"],
  pricingComparison: {
    human: {
      title: "Free",
      symbol: "check",
      bullets: [
        "Upload up to 100MB",
        "Generate links for tracks, packs, and folders",
        "Full contact list",
        "Collab packs and tracks",
        "Receive splits from Pro sales",
      ],
      cost: "€0",
      costNote: "no credit card",
    },
    ai: {
      title: "Ultra",
      symbol: "check",
      bullets: [
        "Everything in Pro",
        "Series automations",
        "Per-recipient best time scheduling",
        "0% marketplace fees",
        "Custom domain, branding, embeds, and QR",
      ],
      cost: "€24.99/mo",
      costNote: "monthly · yearly available",
    },
  } as { human: LandingComparisonCard; ai: LandingComparisonCard },
  pricingUi: {
    title: "Simple plans that scale with your catalog.",
    monthly: "Monthly",
    annually: "Annually",
    toggleBillingAriaLabel: "Toggle annual billing",
    mostPopular: "Most popular",
    bestValue: "Best value",
    annuallyPerMonth: "Annually /month",
    billedYearly: "billed yearly",
    billedMonthly: "billed monthly",
    upgradeUltra: "Upgrade to Ultra",
    testimonialsLabel: "Testimonials",
    testimonialsTitle: "Used daily by 600+ producers",
    testimonialsDescription: "Real creators showing how they use vvault to send, track, and convert.",
    testimonialVideoUrl: "https://www.youtube.com/embed/diDvzeYv_TE?start=21",
    testimonialVideoTitle: "vvault testimonial video",
    faqTitle: "FAQs",
  },
  singlePlan: {
    name: "Pro",
    price: "€8.99/mo",
    note: "monthly · annual billing available (2 months free)",
    cta: "Start Pro",
    bullets: [
      "Everything in Free",
      "Campaigns: create, send, schedule, and track",
      "Tracking: opens, clicks, plays, saves, downloads, sales",
      "Sell via Marketplace (5% commission)",
      "Analytics: best time to send, funnels, dashboards",
      "CRM: timeline, notes, tasks, scoring",
      "Upgrade to Ultra for automations and 0% marketplace fees",
    ],
  } as LandingSinglePlan,
  faq: [
    {
      question: "What is vvault built for?",
      answer:
        "vvault is built for producers and teams who need one system for library, sharing, campaigns, analytics, and monetization.",
    },
    {
      question: "What do I get on the Free plan?",
      answer:
        "Free includes up to 100MB upload, share links for tracks/packs/folders, full contacts, collaboration support, and split payouts from Pro sales.",
    },
    {
      question: "What changes on Pro and Ultra?",
      answer:
        "Pro unlocks campaigns, advanced tracking, CRM, analytics, and marketplace selling. Ultra adds automation, scheduling depth, custom branding, and 0% marketplace fees.",
    },
    {
      question: "Can I send campaigns and track engagement?",
      answer:
        "Yes. vvault supports creating and scheduling campaigns, then tracking opens, clicks, play duration, downloads, saves, and sales in one workflow.",
    },
    {
      question: "How do billing and payouts work?",
      answer:
        "Subscriptions, purchases, and payouts run through Stripe-backed billing flows so payment status and delivery stay connected.",
    },
    {
      question: "Can I migrate gradually?",
      answer:
        "Yes. Most teams start by moving active packs and links first, then shift campaigns and monetization once performance tracking is in place.",
    },
  ] as LandingFaq[],
  finalCta: {
    title: "Send faster. Track every play. Land more placements.",
    description:
      "Replace scattered tools with one focused workspace for delivery, engagement, and monetization.",
    primary: { label: "Start free", href: "https://vvault.app/signup" },
    secondary: { label: "Login", href: "https://vvault.app/login" },
  },
  footer: {
    columns: [
      {
        title: "Product",
        links: [
          { label: "Homepage", href: "/" },
          { label: "Product", href: "/#product" },
          { label: "Pricing", href: "/#pricing" },
          { label: "Contact", href: "/#contact" },
        ] as LandingFooterLink[],
      },
      {
        title: "Company",
        links: [
          { label: "Start free", href: "https://vvault.app/signup" },
          { label: "Pricing", href: "/#pricing" },
          { label: "Support", href: "https://www.vvault.app/support" },
        ] as LandingFooterLink[],
      },
      {
        title: "Resources",
        links: [
          { label: "Privacy", href: "/privacy" },
          { label: "Terms", href: "/terms" },
          { label: "Billing", href: "https://vvault.app/billing" },
        ] as LandingFooterLink[],
      },
      {
        title: "Legal",
        links: [
          { label: "Login", href: "https://vvault.app/login" },
          { label: "Pro", href: "https://vvault.app/billing" },
          { label: "Ultra", href: "https://vvault.app/billing" },
        ] as LandingFooterLink[],
      },
    ],
    legalLinks: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Contact", href: "mailto:vvaultapp@gmail.com" },
    ],
  },
  appMock: {
    sidebar: ["Library", "Campaigns", "Contacts", "Analytics", "Marketplace", "Billing", "Settings"],
    conversations: [
      { name: "Noah - A&R", preview: "Loved pack 07. Need alt stems.", phase: "Hot lead", time: "2m" },
      { name: "Mila - Artist", preview: "Downloaded and shared with manager.", phase: "Engaged", time: "7m" },
      { name: "Kai - Producer", preview: "Can you send WAV + tracked link?", phase: "Active", time: "11m" },
      { name: "Lena - Label", preview: "Ready to buy exclusive license.", phase: "Deal", time: "21m" },
    ],
    feed: [
      "Pack link opened · 09:14",
      "Playback reached 86% · 09:11",
      "License checkout completed · 09:09",
      "Download delivered securely · 09:05",
    ],
  },
} as const;

const landingContentFr = {
  brand: "vvault",
  skipToContentLabel: "Aller au contenu",
  ui: {
    homepageAriaLabel: "page d’accueil vvault",
    login: "Connexion",
    languageEnglish: "ENG",
    languageFrench: "FR",
    languageSwitcherAriaLabel: "Changer de langue",
    mobileSystemLabel: "Sections",
    mobileResourcesLabel: "Ressources",
  },
  nav: [
    { label: "Produit", href: "#product" },
    { label: "Workflow", href: "#how-it-works" },
    { label: "Tarifs", href: "#pricing" },
    { label: "Témoignages", href: "#testimonials" },
    { label: "Contact", href: "#contact" },
  ] as LandingNavItem[],
  hero: {
    title: ["Envoie tes beats. Track tes résultats.", "Décroche des placements."],
    description:
      "Transforme tes mails en placements. Track les ouvertures, écoutes, téléchargements et plus.",
    newBadge: "Nouveau",
    onyxLabel: "Uploader YouTube ONYX",
    ratingLabel: "Utilisé chaque jour par 600+ beatmakers",
  },
  heroStatement: {
    strong: "Sache qui écoute vraiment.",
    muted: "Relance plus vite, envoie de meilleurs packs, et transforme l’intérêt en placements et ventes.",
    videoUrl: "https://www.youtube.com/embed/DOlLUSW9s2s?start=61",
    videoTitle: "vidéo démo vvault en français",
  },
  howItWorksIntro: {
    title: "Sache qui est prêt avant de relancer.",
    description:
      "Chaque envoi devient mesurable: ouvertures, clics, durée d’écoute, téléchargements et sauvegardes. Crée tes packs rapidement, envoie à des contacts illimités, et utilise de vrais signaux d’intention pour relancer au bon moment et signer placements ou ventes.",
    stepLabel: "Étape",
    imagePlaceholder: "Visuel d’étape",
  },
  features: [
    {
      title: "Upload et organisation rapide",
      description:
        "Dépose plusieurs fichiers, dézippe automatiquement les ZIP, et garde ta bibliothèque propre sans couper ton flow.",
      stat: "Dézip auto ZIP",
    },
    {
      title: "Partage des liens qui convertissent",
      description:
        "Publie des morceaux, packs et dossiers via des liens privés, tokenisés ou publics, optimisés pour l’écoute rapide.",
      stat: "Liens morceau, pack, dossier",
    },
    {
      title: "Lance tes campagnes au même endroit",
      description:
        "Crée, planifie et envoie des campagnes directement depuis vvault tout en gardant tes contacts et ton historique centralisé.",
      stat: "Envoi + planification",
    },
    {
      title: "Suis le vrai engagement",
      description:
        "Mesure les ouvertures, clics, durée d’écoute, sauvegardes, téléchargements et ventes pour voir ce qui performe vraiment.",
      stat: "Visibilité engagement complète",
    },
    {
      title: "Vends avec Stripe checkout",
      description:
        "Propose des licences, sécurise les téléchargements payants, et garde le checkout connecté à ton contenu et tes analytics.",
      stat: "Marketplace ready",
    },
    {
      title: "Passe à l’échelle avec Pro et Ultra",
      description:
        "Débloque CRM, automatisations, planification avancée et contrôle de branding quand ton volume augmente.",
      stat: "Upgrade quand tu veux",
    },
  ] as LandingFeature[],
  howItWorks: [
    {
      title: "Upload",
      description:
        "Ajoute tes morceaux dans ta bibliothèque privée avec métadonnées, artwork et gestion propre des fichiers.",
      detail: "Drag-and-drop multi-fichiers, support ZIP, et tout reste prêt à l’emploi.",
    },
    {
      title: "Organise",
      description:
        "Classe tout en dossiers, packs et séries pour garder ton catalogue propre et facile à partager.",
      detail: "Crée des templates de packs réutilisables et structure chaque sortie.",
    },
    {
      title: "Envoie",
      description: "Envoie des e-mails à des contacts illimités en quelques clics avec les campagnes intégrées.",
      detail: "Fini les pièces jointes manuelles, les threads brouillons et les outils dispersés.",
    },
    {
      title: "Suis + Convertis",
      description:
        "Vois exactement ce qui se passe après l’envoi: ouvertures, clics, écoutes (et durée), téléchargements et sauvegardes, puis convertis cette traction en placements ou ventes.",
      detail:
        "Identifie les auditeurs les plus engagés, relance au moment parfait, et convertis via un marketplace à faible commission pensé pour les producteurs.",
    },
  ] as LandingStep[],
  updates: {
    title: "Mises à jour",
    subtitle: "Changements produit récents",
    items: [
      {
        title: "Visibilité des performances campagnes",
        text: "Les signaux de durée d’écoute et d’engagement sont plus précis dans les analytics campagnes et liens.",
        date: "Fév 2026",
      },
      {
        title: "Fiabilité du checkout marketplace",
        text: "Le flux d’achat et de livraison est plus stable pour les licences payantes et téléchargements sécurisés.",
        date: "Fév 2026",
      },
      {
        title: "Contrôles d’automatisation séries",
        text: "Les workflows Ultra incluent des contrôles plus fins pour les sorties récurrentes et accès planifiés.",
        date: "Jan 2026",
      },
    ],
  },
  logoStrip: ["Producteurs indépendants", "Studios", "Managers", "Équipes A&R", "Labels", "Créateurs"],
  pricingComparison: {
    human: {
      title: "Free",
      symbol: "check",
      bullets: [
        "Upload jusqu’à 100MB",
        "Génère des liens pour morceaux, packs et dossiers",
        "Liste de contacts complète",
        "Packs et morceaux collaboratifs",
        "Reçois des splits sur les ventes Pro",
      ],
      cost: "€0",
      costNote: "sans carte bancaire",
    },
    ai: {
      title: "Ultra",
      symbol: "check",
      bullets: [
        "Tout ce qui est dans Pro",
        "Automatisations de séries",
        "Planification optimale par destinataire",
        "0% de frais marketplace",
        "Domaine perso, branding, embeds et QR",
      ],
      cost: "€24.99/mo",
      costNote: "mensuel · annuel disponible",
    },
  } as { human: LandingComparisonCard; ai: LandingComparisonCard },
  pricingUi: {
    title: "Des plans simples qui évoluent avec ton catalogue.",
    monthly: "Mensuel",
    annually: "Annuel",
    toggleBillingAriaLabel: "Activer la facturation annuelle",
    mostPopular: "Le plus populaire",
    bestValue: "Meilleur rapport qualité-prix",
    annuallyPerMonth: "Annuel /mois",
    billedYearly: "facturé à l’année",
    billedMonthly: "facturé au mois",
    upgradeUltra: "Passer à Ultra",
    testimonialsLabel: "Témoignages",
    testimonialsTitle: "Utilisé chaque jour par 600+ producteurs",
    testimonialsDescription:
      "Des créateurs montrent concrètement comment ils utilisent vvault pour envoyer, suivre et convertir.",
    testimonialVideoUrl: "https://www.youtube.com/embed/diDvzeYv_TE?start=21",
    testimonialVideoTitle: "vidéo témoignage vvault",
    faqTitle: "FAQ",
  },
  singlePlan: {
    name: "Pro",
    price: "€8.99/mo",
    note: "mensuel · annuel disponible (2 mois offerts)",
    cta: "Démarrer Pro",
    bullets: [
      "Tout ce qui est dans Free",
      "Campagnes: créer, envoyer, planifier et suivre",
      "Tracking: ouvertures, clics, écoutes, sauvegardes, téléchargements, ventes",
      "Vente via marketplace (5% de commission)",
      "Analytics: meilleur moment d’envoi, funnels, dashboards",
      "CRM: timeline, notes, tâches, scoring",
      "Passe à Ultra pour les automatisations et 0% de frais marketplace",
    ],
  } as LandingSinglePlan,
  faq: [
    {
      question: "À quoi sert vvault ?",
      answer:
        "vvault est conçu pour les producteurs et équipes qui ont besoin d’un seul système pour la bibliothèque, le partage, les campagnes, les analytics et la monétisation.",
    },
    {
      question: "Que comprend le plan Free ?",
      answer:
        "Free inclut jusqu’à 100MB d’upload, des liens de partage pour morceaux/packs/dossiers, des contacts complets, la collaboration, et les split payouts issus des ventes Pro.",
    },
    {
      question: "Qu'est-ce qui change avec Pro et Ultra ?",
      answer:
        "Pro débloque les campagnes, le tracking avancé, le CRM, les analytics, et la vente marketplace. Ultra ajoute l’automatisation, une planification plus fine, du branding personnalisé et 0% de frais marketplace.",
    },
    {
      question: "Puis-je envoyer des campagnes et suivre l'engagement ?",
      answer:
        "Oui. vvault permet de créer et planifier des campagnes, puis de suivre ouvertures, clics, durée d’écoute, téléchargements, sauvegardes et ventes dans un seul workflow.",
    },
    {
      question: "Comment fonctionnent la facturation et les paiements ?",
      answer:
        "Abonnements, achats et payouts passent par des flux Stripe pour garder le statut de paiement et la livraison reliés.",
    },
    {
      question: "Puis-je migrer progressivement ?",
      answer:
        "Oui. La plupart des équipes déplacent d’abord les packs et liens actifs, puis migrent campagnes et monétisation une fois le tracking en place.",
    },
  ] as LandingFaq[],
  finalCta: {
    title: "Envoie plus vite. Suis chaque écoute. Décroche plus de placements.",
    description:
      "Remplace les outils dispersés par un espace unique pour la diffusion, l’engagement et la monétisation.",
    primary: { label: "Commencer gratuitement", href: "https://vvault.app/signup" },
    secondary: { label: "Connexion", href: "https://vvault.app/login" },
  },
  footer: {
    columns: [
      {
        title: "Produit",
        links: [
          { label: "Accueil", href: "/fr" },
          { label: "Produit", href: "/fr#product" },
          { label: "Tarifs", href: "/fr#pricing" },
          { label: "Contact", href: "/fr#contact" },
        ] as LandingFooterLink[],
      },
      {
        title: "Entreprise",
        links: [
          { label: "Commencer gratuitement", href: "https://vvault.app/signup" },
          { label: "Tarifs", href: "/fr#pricing" },
          { label: "Support", href: "https://www.vvault.app/support" },
        ] as LandingFooterLink[],
      },
      {
        title: "Ressources",
        links: [
          { label: "Confidentialité", href: "/privacy" },
          { label: "Conditions", href: "/terms" },
          { label: "Facturation", href: "https://vvault.app/billing" },
        ] as LandingFooterLink[],
      },
      {
        title: "Légal",
        links: [
          { label: "Connexion", href: "https://vvault.app/login" },
          { label: "Pro", href: "https://vvault.app/billing" },
          { label: "Ultra", href: "https://vvault.app/billing" },
        ] as LandingFooterLink[],
      },
    ],
    legalLinks: [
      { label: "Confidentialité", href: "/privacy" },
      { label: "Conditions", href: "/terms" },
      { label: "Contact", href: "mailto:vvaultapp@gmail.com" },
    ],
  },
  appMock: {
    sidebar: [
      "Bibliothèque",
      "Campagnes",
      "Contacts",
      "Analytics",
      "Marketplace",
      "Facturation",
      "Paramètres",
    ],
    conversations: [
      { name: "Noah - A&R", preview: "Pack 07 adoré. Besoin des stems alternatifs.", phase: "Lead chaud", time: "2m" },
      { name: "Mila - Artiste", preview: "Téléchargé et partagé avec le manager.", phase: "Engagé", time: "7m" },
      { name: "Kai - Producteur", preview: "Tu peux envoyer WAV + lien tracké ?", phase: "Actif", time: "11m" },
      { name: "Lena - Label", preview: "Prêt à acheter la licence exclusive.", phase: "Deal", time: "21m" },
    ],
    feed: [
      "Lien pack ouvert · 09:14",
      "Lecture à 86% · 09:11",
      "Checkout licence complété · 09:09",
      "Téléchargement sécurisé livré · 09:05",
    ],
  },
} as const;

export const landingContentByLocale = {
  en: landingContentEn,
  fr: landingContentFr,
} as const;

export type LandingContent = (typeof landingContentByLocale)[Locale];

export const landingContent = landingContentByLocale.en;

export function getLandingContent(locale: Locale = "en"): LandingContent {
  return landingContentByLocale[locale] ?? landingContentByLocale.en;
}
