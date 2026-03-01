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
    homepageAriaLabel: "page d'accueil vvault",
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
    { label: "Temoignages", href: "#testimonials" },
    { label: "Contact", href: "#contact" },
  ] as LandingNavItem[],
  hero: {
    title: ["Envoie tes beats. Suis les resultats.", "Decroche des placements."],
    description:
      "Transforme tes mails en placements. Track les ouvertures, écoutes, téléchargements et plus.",
    newBadge: "Nouveau",
    onyxLabel: "Uploader YouTube ONYX",
    ratingLabel: "Utilisé chaque jour par 600+ beatmakers",
  },
  heroStatement: {
    strong: "Sache qui ecoute vraiment.",
    muted: "Relance plus vite, envoie de meilleurs packs, et transforme l'interet en placements et ventes.",
    videoUrl: "https://www.youtube.com/embed/DOlLUSW9s2s?start=61",
    videoTitle: "video demo vvault en francais",
  },
  howItWorksIntro: {
    title: "Sache qui est pret avant de relancer.",
    description:
      "Chaque envoi devient mesurable: ouvertures, clics, duree d'ecoute, telechargements et sauvegardes. Cree tes packs rapidement, envoie a des contacts illimites, et utilise de vrais signaux d'intention pour relancer au bon moment et signer placements ou ventes.",
    stepLabel: "Etape",
    imagePlaceholder: "Visuel d'etape",
  },
  features: [
    {
      title: "Upload et organisation rapide",
      description:
        "Depose plusieurs fichiers, dezippe automatiquement les ZIP, et garde ta bibliotheque propre sans couper ton flow.",
      stat: "Dezip auto ZIP",
    },
    {
      title: "Partage des liens qui convertissent",
      description:
        "Publie des morceaux, packs et dossiers via des liens prives, tokenises ou publics, optimises pour l'ecoute rapide.",
      stat: "Liens morceau, pack, dossier",
    },
    {
      title: "Lance tes campagnes au meme endroit",
      description:
        "Cree, planifie et envoie des campagnes directement depuis vvault tout en gardant tes contacts et ton historique centralises.",
      stat: "Envoi + planification",
    },
    {
      title: "Suis le vrai engagement",
      description:
        "Mesure les ouvertures, clics, duree d'ecoute, sauvegardes, telechargements et ventes pour voir ce qui performe vraiment.",
      stat: "Visibilite engagement complete",
    },
    {
      title: "Vends avec Stripe checkout",
      description:
        "Propose des licences, securise les telechargements payants, et garde le checkout connecte a ton contenu et tes analytics.",
      stat: "Marketplace ready",
    },
    {
      title: "Passe a l'echelle avec Pro et Ultra",
      description:
        "Debloque CRM, automatisations, planification avancee et controle de branding quand ton volume augmente.",
      stat: "Upgrade quand tu veux",
    },
  ] as LandingFeature[],
  howItWorks: [
    {
      title: "Upload",
      description:
        "Ajoute tes morceaux dans ta bibliotheque privee avec metadata, artwork et gestion propre des fichiers.",
      detail: "Drag-and-drop multi-fichiers, support ZIP, et tout reste pret a l'emploi.",
    },
    {
      title: "Organise",
      description:
        "Classe tout en dossiers, packs et series pour garder ton catalogue propre et facile a partager.",
      detail: "Cree des templates de packs reutilisables et structure chaque sortie.",
    },
    {
      title: "Envoie",
      description: "Envoie des e-mails a des contacts illimites en quelques clics avec les campagnes integrees.",
      detail: "Fini les pieces jointes manuelles, les threads brouillons et les outils disperses.",
    },
    {
      title: "Suis + Convertis",
      description:
        "Vois exactement ce qui se passe apres l'envoi: ouvertures, clics, ecoutes (et duree), telechargements et sauvegardes, puis convertis cette traction en placements ou ventes.",
      detail:
        "Identifie les auditeurs les plus engages, relance au moment parfait, et convertis via un marketplace a faible commission pense pour les producteurs.",
    },
  ] as LandingStep[],
  updates: {
    title: "Mises a jour",
    subtitle: "Changements produit recents",
    items: [
      {
        title: "Visibilite des performances campagnes",
        text: "Les signaux de duree d'ecoute et d'engagement sont plus precis dans les analytics campagnes et liens.",
        date: "Fev 2026",
      },
      {
        title: "Fiabilite du checkout marketplace",
        text: "Le flux d'achat et de livraison est plus stable pour les licences payantes et telechargements securises.",
        date: "Fev 2026",
      },
      {
        title: "Controles d'automatisation series",
        text: "Les workflows Ultra incluent des controles plus fins pour les sorties recurrentes et acces planifies.",
        date: "Jan 2026",
      },
    ],
  },
  logoStrip: ["Producteurs independants", "Studios", "Managers", "Equipes A&R", "Labels", "Createurs"],
  pricingComparison: {
    human: {
      title: "Free",
      symbol: "check",
      bullets: [
        "Upload jusqu'a 100MB",
        "Genere des liens pour morceaux, packs et dossiers",
        "Liste de contacts complete",
        "Packs et morceaux collaboratifs",
        "Recois des splits sur les ventes Pro",
      ],
      cost: "€0",
      costNote: "sans carte bancaire",
    },
    ai: {
      title: "Ultra",
      symbol: "check",
      bullets: [
        "Tout ce qui est dans Pro",
        "Automatisations de series",
        "Planification optimale par destinataire",
        "0% de frais marketplace",
        "Domaine perso, branding, embeds et QR",
      ],
      cost: "€24.99/mo",
      costNote: "mensuel · annuel disponible",
    },
  } as { human: LandingComparisonCard; ai: LandingComparisonCard },
  pricingUi: {
    title: "Des plans simples qui evoluent avec ton catalogue.",
    monthly: "Mensuel",
    annually: "Annuel",
    toggleBillingAriaLabel: "Activer la facturation annuelle",
    mostPopular: "Le plus populaire",
    bestValue: "Meilleur rapport qualite-prix",
    annuallyPerMonth: "Annuel /mois",
    billedYearly: "facture a l'annee",
    billedMonthly: "facture au mois",
    upgradeUltra: "Passer a Ultra",
    testimonialsLabel: "Temoignages",
    testimonialsTitle: "Utilise chaque jour par 600+ producteurs",
    testimonialsDescription:
      "Des createurs montrent concretement comment ils utilisent vvault pour envoyer, suivre et convertir.",
    testimonialVideoUrl: "https://www.youtube.com/embed/diDvzeYv_TE?start=21",
    testimonialVideoTitle: "video temoignage vvault",
    faqTitle: "FAQ",
  },
  singlePlan: {
    name: "Pro",
    price: "€8.99/mo",
    note: "mensuel · annuel disponible (2 mois offerts)",
    cta: "Demarrer Pro",
    bullets: [
      "Tout ce qui est dans Free",
      "Campagnes: creer, envoyer, planifier et suivre",
      "Tracking: ouvertures, clics, ecoutes, sauvegardes, telechargements, ventes",
      "Vente via marketplace (5% de commission)",
      "Analytics: meilleur moment d'envoi, funnels, dashboards",
      "CRM: timeline, notes, taches, scoring",
      "Passe a Ultra pour les automatisations et 0% de frais marketplace",
    ],
  } as LandingSinglePlan,
  faq: [
    {
      question: "A quoi sert vvault ?",
      answer:
        "vvault est concu pour les producteurs et equipes qui ont besoin d'un seul systeme pour la bibliotheque, le partage, les campagnes, les analytics et la monetisation.",
    },
    {
      question: "Que comprend le plan Free ?",
      answer:
        "Free inclut jusqu'a 100MB d'upload, des liens de partage pour morceaux/packs/dossiers, des contacts complets, la collaboration, et les split payouts issus des ventes Pro.",
    },
    {
      question: "Qu'est-ce qui change avec Pro et Ultra ?",
      answer:
        "Pro debloque les campagnes, le tracking avance, le CRM, les analytics, et la vente marketplace. Ultra ajoute l'automatisation, une planification plus fine, du branding personnalise et 0% de frais marketplace.",
    },
    {
      question: "Puis-je envoyer des campagnes et suivre l'engagement ?",
      answer:
        "Oui. vvault permet de creer et planifier des campagnes, puis de suivre ouvertures, clics, duree d'ecoute, telechargements, sauvegardes et ventes dans un seul workflow.",
    },
    {
      question: "Comment fonctionnent la facturation et les paiements ?",
      answer:
        "Abonnements, achats et payouts passent par des flux Stripe pour garder le statut de paiement et la livraison relies.",
    },
    {
      question: "Puis-je migrer progressivement ?",
      answer:
        "Oui. La plupart des equipes deplacent d'abord les packs et liens actifs, puis migrent campagnes et monetisation une fois le tracking en place.",
    },
  ] as LandingFaq[],
  finalCta: {
    title: "Envoie plus vite. Suis chaque écoute. Décroche plus de placements.",
    description:
      "Remplace les outils disperses par un espace unique pour la diffusion, l'engagement et la monetisation.",
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
          { label: "Confidentialite", href: "/privacy" },
          { label: "Conditions", href: "/terms" },
          { label: "Facturation", href: "https://vvault.app/billing" },
        ] as LandingFooterLink[],
      },
      {
        title: "Legal",
        links: [
          { label: "Connexion", href: "https://vvault.app/login" },
          { label: "Pro", href: "https://vvault.app/billing" },
          { label: "Ultra", href: "https://vvault.app/billing" },
        ] as LandingFooterLink[],
      },
    ],
    legalLinks: [
      { label: "Confidentialite", href: "/privacy" },
      { label: "Conditions", href: "/terms" },
      { label: "Contact", href: "mailto:vvaultapp@gmail.com" },
    ],
  },
  appMock: {
    sidebar: [
      "Bibliotheque",
      "Campagnes",
      "Contacts",
      "Analytics",
      "Marketplace",
      "Facturation",
      "Parametres",
    ],
    conversations: [
      { name: "Noah - A&R", preview: "Pack 07 adore. Besoin des stems alternatifs.", phase: "Lead chaud", time: "2m" },
      { name: "Mila - Artiste", preview: "Telecharge et partage avec le manager.", phase: "Engage", time: "7m" },
      { name: "Kai - Producteur", preview: "Tu peux envoyer WAV + lien tracke ?", phase: "Actif", time: "11m" },
      { name: "Lena - Label", preview: "Pret a acheter la licence exclusive.", phase: "Deal", time: "21m" },
    ],
    feed: [
      "Lien pack ouvert · 09:14",
      "Lecture a 86% · 09:11",
      "Checkout licence complete · 09:09",
      "Telechargement securise livre · 09:05",
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
