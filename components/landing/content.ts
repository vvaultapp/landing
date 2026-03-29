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
    signup: "Sign up",
    languageEnglish: "ENG",
    languageFrench: "FR",
    languageSwitcherAriaLabel: "Switch language",
    mobileSystemLabel: "System",
    mobileResourcesLabel: "Resources",
  },
  nav: [
    { label: "Features", href: "#features" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Company", href: "#company" },
    { label: "Resources", href: "#resources" },
    { label: "Contact", href: "#contact" },
    { label: "Help", href: "#help" },
    { label: "Pricing", href: "#pricing" },
  ] as LandingNavItem[],
  hero: {
    title: ["The proper way to", "send your music."],
    description: "Turn emails into placements. Track opens, plays, downloads and more.",
    primaryCtaLabel: "Start free",
    primaryCtaHint: "Create your vvault today",
    newBadge: "New",
    onyxLabel: "vvault Studio",
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
        "Get highlighted in the browse section of the mobile app",
        "0% marketplace fees",
        "Custom domain, branding, embeds, and QR",
      ],
      cost: "€24.99/mo",
      costNote: "monthly · yearly available",
    },
  } as { human: LandingComparisonCard; ai: LandingComparisonCard },
  pricingUi: {
    title: "Pricing",
    subtitle: "Start for free, no credit card required.",
    monthly: "Monthly",
    annually: "Annually",
    startFree: "Start Free",
    toggleBillingAriaLabel: "Toggle annual billing",
    mostPopular: "Most popular",
    bestValue: "Best value",
    annuallyPerMonth: "Annually /month",
    billedYearly: "billed yearly",
    billedMonthly: "billed monthly",
    upgradeUltra: "Start Ultra",
    testimonialsLabel: "Testimonials",
    testimonialsTitle: "Used daily by 600+ producers",
    testimonialsDescription: "Real creators showing how they use vvault to send, track, and convert.",
    testimonialVideoUrl: "https://www.youtube.com/embed/diDvzeYv_TE?start=21",
    testimonialVideoTitle: "vvault testimonial video",
    sponsoredLabel: "Sponsored",
    sponsoredTitle: "They talk about us",
    sponsoredDescription: "Campaign highlights from creators using vvault.",
    sponsoredVideos: [
      {
        url: "https://www.youtube.com/embed/gol6_KccRBY",
        title: "Sponsored video 1",
      },
      {
        url: "https://www.youtube.com/embed/An5tl-FVWdU?start=10",
        title: "Sponsored video 2",
      },
      {
        url: "https://www.youtube.com/embed/4bIAHdRbRYQ?start=45",
        title: "Sponsored video 3",
      },
      {
        url: "https://www.youtube.com/embed/jQkjH3_-PgY",
        title: "Sponsored video 4",
      },
      {
        url: "https://www.youtube.com/embed/xYW81irl5AE",
        title: "Sponsored video 5",
      },
      {
        url: "https://www.youtube.com/embed/DOlLUSW9s2s",
        title: "Sponsored video 6",
      },
    ],
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
    ],
  } as LandingSinglePlan,
  faq: [
    {
      question: "Is vvault really free?",
      answer:
        "Yes. The Free plan costs nothing and doesn't require a credit card. You can upload up to 100 MB, generate share links, manage contacts, and collaborate on packs — no trial, no expiration.",
    },
    {
      question: "Can I cancel or change plans anytime?",
      answer:
        "Absolutely. You can upgrade, downgrade, or cancel at any time from your billing settings. There are no contracts or cancellation fees.",
    },
    {
      question: "How does beat tracking work?",
      answer:
        "Every time you send a pack or share a link, vvault tracks opens, clicks, play duration, downloads, saves, and sales in real time. You'll know exactly who listened, for how long, and what they did next.",
    },
    {
      question: "What's the difference between Pro and Ultra?",
      answer:
        "Pro unlocks unlimited storage, campaigns, full analytics, CRM, and marketplace selling at 5% commission. Ultra adds series automations, per-recipient best-time scheduling, custom domain, embeds, and drops marketplace fees to 0%.",
    },
    {
      question: "Can I send beats through my own email?",
      answer:
        "Yes. You can connect your Gmail account and send campaigns directly from your own address, so recipients see your name instead of a generic sender.",
    },
    {
      question: "How do I sell beats and get paid?",
      answer:
        "Connect your Stripe account, set prices and license types (MP3 lease, WAV, stems, exclusive), and list on the marketplace or your public profile. Payouts go straight to your bank.",
    },
    {
      question: "What file types can I upload?",
      answer:
        "vvault supports all common audio formats. You can upload individual tracks or full packs with cover art, BPM, key tags, and co-author credits.",
    },
    {
      question: "How is vvault different from Dropbox or Google Drive?",
      answer:
        "Generic cloud storage has no tracking, no campaigns, and no music-specific features. vvault is built specifically for producers — it combines file management, email sending, analytics, CRM, and sales in one place.",
    },
  ] as LandingFaq[],
  finalCta: {
    title: "Music reimagined. Available today.",
    description: "",
    primary: { label: "Get Started", href: "https://vvault.app/signup" },
    secondary: { label: "Contact Us", href: "/#contact" },
  },
  footer: {
    columns: [
      {
        title: "Product",
        links: [
          { label: "Homepage", href: "/" },
          { label: "Pricing", href: "/#pricing" },
          { label: "Blog", href: "/blog" },
          { label: "Contact", href: "/#contact" },
        ] as LandingFooterLink[],
      },
      {
        title: "Resources",
        links: [
          { label: "For Producers", href: "/for/producers" },
          { label: "For Artists", href: "/for/artists" },
          { label: "For Managers & Labels", href: "/for/managers-and-labels" },
          { label: "Compare", href: "/compare" },
        ] as LandingFooterLink[],
      },
      {
        title: "Company",
        links: [
          { label: "Support", href: "https://www.vvault.app/support" },
          { label: "Login", href: "https://vvault.app/login" },
          { label: "Billing", href: "https://vvault.app/billing" },
        ] as LandingFooterLink[],
      },
      {
        title: "Legal",
        links: [
          { label: "Privacy", href: "/privacy" },
          { label: "Terms", href: "/terms" },
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
    signup: "S'inscrire",
    languageEnglish: "ENG",
    languageFrench: "FR",
    languageSwitcherAriaLabel: "Changer de langue",
    mobileSystemLabel: "Sections",
    mobileResourcesLabel: "Ressources",
  },
  nav: [
    { label: "Features", href: "#features" },
    { label: "Témoignages", href: "#testimonials" },
    { label: "Entreprise", href: "#company" },
    { label: "Ressources", href: "#resources" },
    { label: "Contact", href: "#contact" },
    { label: "Aide", href: "#help" },
    { label: "Tarifs", href: "#pricing" },
  ] as LandingNavItem[],
  hero: {
    title: ["Envoie tes beats. Track tes résultats.", "Décroche des placements."],
    description:
      "Transforme tes mails en placements. Track les ouvertures, écoutes, téléchargements et plus.",
    primaryCtaLabel: "Commencer gratuitement",
    primaryCtaHint: "Crée ton vvault aujourd'hui",
    newBadge: "Nouveau",
    onyxLabel: "vvault Studio",
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
        "Mise en avant dans la section Browse de l'app mobile",
        "0% de frais marketplace",
        "Domaine perso, branding, embeds et QR",
      ],
      cost: "€24.99/mo",
      costNote: "mensuel · annuel disponible",
    },
  } as { human: LandingComparisonCard; ai: LandingComparisonCard },
  pricingUi: {
    title: "Pricing",
    subtitle: "Commence gratuitement, sans carte bancaire.",
    monthly: "Mensuel",
    annually: "Annuel",
    startFree: "Commencer gratuitement",
    toggleBillingAriaLabel: "Activer la facturation annuelle",
    mostPopular: "Le plus populaire",
    bestValue: "Meilleur rapport qualité-prix",
    annuallyPerMonth: "Annuel /mois",
    billedYearly: "facturé à l’année",
    billedMonthly: "facturé au mois",
    upgradeUltra: "Start Ultra",
    testimonialsLabel: "Témoignages",
    testimonialsTitle: "Utilisé chaque jour par 600+ producteurs",
    testimonialsDescription:
      "Des créateurs montrent concrètement comment ils utilisent vvault pour envoyer, suivre et convertir.",
    testimonialVideoUrl: "https://www.youtube.com/embed/diDvzeYv_TE?start=21",
    testimonialVideoTitle: "vidéo témoignage vvault",
    sponsoredLabel: "Sponsorisé",
    sponsoredTitle: "They talk about us",
    sponsoredDescription: "Highlights de campagnes publiées avec vvault.",
    sponsoredVideos: [
      {
        url: "https://www.youtube.com/embed/gol6_KccRBY",
        title: "Vidéo sponsorisée 1",
      },
      {
        url: "https://www.youtube.com/embed/An5tl-FVWdU?start=10",
        title: "Vidéo sponsorisée 2",
      },
      {
        url: "https://www.youtube.com/embed/4bIAHdRbRYQ?start=45",
        title: "Vidéo sponsorisée 3",
      },
      {
        url: "https://www.youtube.com/embed/jQkjH3_-PgY",
        title: "Vidéo sponsorisée 4",
      },
      {
        url: "https://www.youtube.com/embed/xYW81irl5AE",
        title: "Vidéo sponsorisée 5",
      },
      {
        url: "https://www.youtube.com/embed/DOlLUSW9s2s",
        title: "Vidéo sponsorisée 6",
      },
    ],
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
    ],
  } as LandingSinglePlan,
  faq: [
    {
      question: "Est-ce que vvault est vraiment gratuit ?",
      answer:
        "Oui. Le plan Free ne coûte rien et ne demande pas de carte bancaire. Tu peux uploader jusqu’à 100 Mo, générer des liens de partage, gérer tes contacts et collaborer sur des packs — sans essai, sans expiration.",
    },
    {
      question: "Je peux annuler ou changer de plan à tout moment ?",
      answer:
        "Absolument. Tu peux upgrader, downgrader ou annuler quand tu veux depuis tes paramètres de facturation. Aucun contrat, aucun frais d’annulation.",
    },
    {
      question: "Comment fonctionne le tracking des beats ?",
      answer:
        "À chaque envoi de pack ou partage de lien, vvault traque en temps réel les ouvertures, clics, durées d’écoute, téléchargements, sauvegardes et ventes. Tu sauras exactement qui a écouté, combien de temps, et ce qu’il a fait ensuite.",
    },
    {
      question: "Quelle est la différence entre Pro et Ultra ?",
      answer:
        "Pro débloque le stockage illimité, les campagnes, les analytics complètes, le CRM et la vente marketplace à 5% de commission. Ultra ajoute les séries automatisées, la planification par destinataire, le domaine personnalisé, les embeds, et passe les frais marketplace à 0%.",
    },
    {
      question: "Je peux envoyer mes beats depuis mon propre email ?",
      answer:
        "Oui. Tu peux connecter ton compte Gmail et envoyer tes campagnes directement depuis ta propre adresse, pour que les destinataires voient ton nom au lieu d’un expéditeur générique.",
    },
    {
      question: "Comment vendre mes beats et être payé ?",
      answer:
        "Connecte ton compte Stripe, définis tes prix et types de licences (MP3 lease, WAV, stems, exclusive), et publie sur le marketplace ou ton profil public. Les paiements arrivent directement sur ton compte bancaire.",
    },
    {
      question: "Quels formats de fichiers puis-je uploader ?",
      answer:
        "vvault supporte tous les formats audio courants. Tu peux uploader des morceaux individuels ou des packs complets avec pochette, BPM, tags de tonalité et crédits de co-auteurs.",
    },
    {
      question: "En quoi vvault est différent de Dropbox ou Google Drive ?",
      answer:
        "Le stockage cloud classique n’a ni tracking, ni campagnes, ni fonctionnalités spécifiques à la musique. vvault est conçu spécifiquement pour les producteurs — il combine gestion de fichiers, envoi d’emails, analytics, CRM et ventes en un seul endroit.",
    },
  ] as LandingFaq[],
  finalCta: {
    title: "Music reimagined. Available today.",
    description: "",
    primary: { label: "Commencer gratuitement", href: "https://vvault.app/signup" },
    secondary: { label: "Contact", href: "/fr#contact" },
  },
  footer: {
    columns: [
      {
        title: "Produit",
        links: [
          { label: "Accueil", href: "/fr" },
          { label: "Tarifs", href: "/fr#pricing" },
          { label: "Blog", href: "/blog" },
          { label: "Contact", href: "/fr#contact" },
        ] as LandingFooterLink[],
      },
      {
        title: "Ressources",
        links: [
          { label: "Pour les Producteurs", href: "/for/producers" },
          { label: "Pour les Artistes", href: "/for/artists" },
          { label: "Pour les Managers & Labels", href: "/for/managers-and-labels" },
          { label: "Comparer", href: "/compare" },
        ] as LandingFooterLink[],
      },
      {
        title: "Entreprise",
        links: [
          { label: "Support", href: "https://www.vvault.app/support" },
          { label: "Connexion", href: "https://vvault.app/login" },
          { label: "Facturation", href: "https://vvault.app/billing" },
        ] as LandingFooterLink[],
      },
      {
        title: "Légal",
        links: [
          { label: "Confidentialité", href: "/privacy" },
          { label: "Conditions", href: "/terms" },
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
