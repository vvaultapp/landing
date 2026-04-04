export type LandingNavChild = {
  label: string;
  href: string;
  description?: string;
  external?: boolean;
};

export type LandingNavItem = {
  label: string;
  href: string;
  children?: LandingNavChild[];
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
    {
      label: "Features",
      href: "/features",
      children: [
        { label: "All Features", href: "/features", description: "Everything vvault offers" },
        { label: "Library", href: "/features/library", description: "Upload, organize, and manage" },
        { label: "Analytics", href: "/features/analytics", description: "Track opens, plays, and more" },
        { label: "Campaigns", href: "/features/campaigns", description: "Send and schedule emails" },
        { label: "Contacts", href: "/features/contacts", description: "CRM and contact management" },
        { label: "Opportunities", href: "/features/opportunities", description: "Artist requests and submissions" },
        { label: "Sales", href: "/features/sales", description: "Marketplace and Stripe checkout" },
        { label: "Profile", href: "/features/profile", description: "Public page and branding" },
        { label: "Link in Bio", href: "/features/link-in-bio", description: "One link for everything" },
        { label: "Studio", href: "/features/studio", description: "Automated video posting" },
        { label: "Certificate", href: "/certificate", description: "Protect your music" },
      ],
    },
    {
      label: "Testimonials",
      href: "/testimonials",
      children: [
        { label: "Customer Stories", href: "/testimonials", description: "How producers use vvault" },
        { label: "Video Reviews", href: "/testimonials#videos", description: "Watch real testimonials" },
      ],
    },
    {
      label: "About",
      href: "/about",
      children: [
        { label: "Company", href: "/about", description: "Our story and mission" },
        { label: "Blog", href: "/blog", description: "Articles and guides" },
        { label: "Compare", href: "/compare", description: "vvault vs alternatives" },
        { label: "Privacy", href: "/privacy", description: "Privacy policy" },
        { label: "Terms", href: "/terms", description: "Terms of service" },
      ],
    },
    {
      label: "Download",
      href: "#download",
      children: [
        { label: "Download for macOS", href: "/download/macos", description: "Desktop app for Mac" },
        { label: "Download for Windows", href: "/download/windows", description: "Desktop app for Windows" },
        { label: "Download on App Store", href: "https://apps.apple.com/app/id6759256796", description: "Mobile app for iPhone", external: true },
      ],
    },
    {
      label: "Docs",
      href: "/docs",
      children: [
        { label: "Introduction", href: "/docs/introduction" },
        { label: "Quickstart", href: "/docs/quickstart" },
        { label: "Library", href: "/docs/library" },
        { label: "Campaigns", href: "/docs/campaigns" },
        { label: "Sales", href: "/docs/sales" },
        { label: "Plans & Pricing", href: "/docs/plans" },
      ],
    },
    {
      label: "Help",
      href: "/help",
      children: [
        { label: "FAQ", href: "/help", description: "Common questions" },
        { label: "Support", href: "https://www.vvault.app/support", description: "Get help", external: true },
        { label: "Discord Community", href: "https://discord.gg/QGGEZR5KhB", description: "Ask the community", external: true },
      ],
    },
    { label: "Pricing", href: "/pricing" },
  ] as LandingNavItem[],
  hero: {
    title: ["The proper way to", "send your music."],
    description: "Turn emails into placements. Track opens, plays, downloads and more — all from a beautifully crafted, secure workspace designed to feel effortless.",
    primaryCtaLabel: "Start free",
    primaryCtaHint: "Create your vvault today",
    newBadge: "New",
    onyxLabel: "vvault Studio",
    ratingLabel: "Used by 1,300+ producers daily",
  },
  heroStatement: {
    strong: "Know who’s really listening.",
    muted: "Follow up faster, send better packs, and turn interest into placements and sales — all through an interface that feels refined at every step.",
    videoUrl: "https://www.youtube.com/embed/nKfITo6LLts",
    videoTitle: "vvault demo video",
  },
  howItWorksIntro: {
    title: "Know who’s ready before you follow up.",
    description:
      "Every send becomes measurable: opens, clicks, play duration, downloads, and saves. Build packs fast, email your contacts, and use real intent signals to follow up at the right time. Leave timestamped comments on tracks to share precise feedback — and land placements or sales.",
    stepLabel: "Step",
    imagePlaceholder: "Step image placeholder",
  },
  features: [
    {
      title: "Upload and organize at speed",
      description:
        "Drop multiple files into your private library, auto-unpack ZIPs, and keep everything structured without breaking flow. A clean, intuitive interface that makes catalog management feel effortless.",
      stat: "Private by default",
    },
    {
      title: "Share links that convert",
      description:
        "Publish tracks, packs, and folders with private, tokenized, or public links — each one encrypted and built for a polished, distraction-free listening experience.",
      stat: "Secure tokenized links",
    },
    {
      title: "Run campaigns in one place",
      description:
        "Create, schedule, and send campaigns directly from vvault while keeping contacts and history together. Every step feels smooth and intentional.",
      stat: "Send + schedule",
    },
    {
      title: "Track true engagement",
      description:
        "Measure opens, clicks, play duration, saves, downloads, and sales to see what actually moves. Leave timestamped comments on any track to give or receive precise feedback on specific moments.",
      stat: "Full engagement visibility",
    },
    {
      title: "Sell with secure Stripe checkout",
      description:
        "Offer licenses, process payments through Stripe's bank-grade security, and keep checkout tied to your content and analytics.",
      stat: "PCI-compliant payments",
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
      description: "Bring tracks into your private, secure library with metadata, artwork, and clean file handling.",
      detail: "Drag and drop multi-file uploads, ZIP support, and everything stays encrypted and ready to use.",
    },
    {
      title: "Organize",
      description: "Sort everything into folders, packs, and series so your catalog stays clean and shareable.",
      detail: "Build repeatable pack templates and keep every release structured. Nothing is public unless you decide it is.",
    },
    {
      title: "Send",
      description: "Email your contacts in a few clicks with campaign sending built-in.",
      detail: "No more manual attachments, messy threads, or juggling tools.",
    },
    {
      title: "Track + Convert",
      description:
        "See exactly what happens after you send: opens, clicks, plays (and how long), downloads, and saves. Drop timestamped comments on any track to discuss specific sections, then turn that momentum into placements or sales.",
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
        "Advanced theme customization",
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
    testimonialsTitle: "Used daily by 1,300+ producers",
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
        "Pro unlocks unlimited storage, campaigns, full analytics, CRM, and marketplace selling at 5% commission. Ultra adds series automations, per-recipient best-time scheduling, advanced theme customization, browse section highlight, and drops marketplace fees to 0%.",
    },
    {
      question: "Can I send beats through my own email?",
      answer:
        "Yes. You can connect your Gmail account and send campaigns directly from your own address, so recipients see your name instead of a generic sender.",
    },
    {
      question: "How do I sell beats and get paid?",
      answer:
        "Connect your Stripe account, set prices and license types (basic, premium, stems, exclusive), and list on the marketplace or your public profile. Payouts go straight to your bank after a 7-day hold.",
    },
    {
      question: "Is my music safe on vvault?",
      answer:
        "Yes. Your files are stored on encrypted infrastructure, share links use unique tokens that you control, and all payments go through Stripe's PCI-compliant checkout. We never access, sell, or share your data. You own everything you upload.",
    },
    {
      question: "What file types can I upload?",
      answer:
        "vvault supports all common audio formats. You can upload individual tracks or full packs with cover art, BPM, key tags, and co-author credits.",
    },
    {
      question: "Can I leave comments on specific timestamps?",
      answer:
        "Yes. You can drop timestamped comments on any track to point out specific sections — perfect for giving feedback, discussing arrangements with collaborators, or marking the exact moment you want an artist to hear. It makes collaboration precise and frictionless.",
    },
    {
      question: "How is vvault different from Dropbox or Google Drive?",
      answer:
        "Generic cloud storage has no tracking, no campaigns, and no music-specific features. vvault is built specifically for producers — it combines secure file management, email sending, analytics, CRM, timestamped comments, and sales in one beautifully designed workspace, with privacy controls made for unreleased music.",
    },
  ] as LandingFaq[],
  finalCta: {
    title: "Crafted for music. Available today.",
    description: "A workspace that looks and feels as good as the music you make.",
    primary: { label: "Get Started", href: "https://vvault.app/signup" },
    secondary: { label: "Contact Us", href: "/#contact" },
  },
  footer: {
    columns: [
      {
        title: "Product",
        links: [
          { label: "Features", href: "/features" },
          { label: "Pricing", href: "/pricing" },
          { label: "Certificate", href: "/certificate" },
        ] as LandingFooterLink[],
      },
      {
        title: "Resources",
        links: [
          { label: "For Producers", href: "/for/producers" },
          { label: "For Artists", href: "/for/artists" },
          { label: "For Managers & Labels", href: "/for/managers-and-labels" },
          { label: "Compare", href: "/compare" },
          { label: "Blog", href: "/blog" },
        ] as LandingFooterLink[],
      },
      {
        title: "Company",
        links: [
          { label: "About", href: "/about" },
          { label: "Contact", href: "/contact" },
          { label: "Testimonials", href: "/testimonials" },
          { label: "Help", href: "/help" },
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
    {
      label: "Fonctionnalités",
      href: "/features",
      children: [
        { label: "Toutes les fonctionnalités", href: "/features", description: "Tout ce que vvault propose" },
        { label: "Bibliothèque", href: "/features/library", description: "Upload, organise et gère" },
        { label: "Analytics", href: "/features/analytics", description: "Suis ouvertures, écoutes et plus" },
        { label: "Campagnes", href: "/features/campaigns", description: "Envoie et planifie tes emails" },
        { label: "Contacts", href: "/features/contacts", description: "CRM et gestion de contacts" },
        { label: "Opportunités", href: "/features/opportunities", description: "Demandes artistes et soumissions" },
        { label: "Ventes", href: "/features/sales", description: "Marketplace et checkout Stripe" },
        { label: "Profil", href: "/features/profile", description: "Page publique et branding" },
        { label: "Link in Bio", href: "/features/link-in-bio", description: "Un lien pour tout" },
        { label: "Studio", href: "/features/studio", description: "Publication vidéo automatique" },
        { label: "Certificat", href: "/certificate", description: "Protège ta musique" },
      ],
    },
    {
      label: "Témoignages",
      href: "/testimonials",
      children: [
        { label: "Histoires clients", href: "/testimonials", description: "Comment les producteurs utilisent vvault" },
        { label: "Vidéos", href: "/testimonials#videos", description: "Regarde de vrais témoignages" },
      ],
    },
    {
      label: "À propos",
      href: "/about",
      children: [
        { label: "Entreprise", href: "/about", description: "Notre histoire et mission" },
        { label: "Blog", href: "/blog", description: "Articles et guides" },
        { label: "Comparer", href: "/compare", description: "vvault vs alternatives" },
        { label: "Confidentialité", href: "/privacy", description: "Politique de confidentialité" },
        { label: "Conditions", href: "/terms", description: "Conditions d'utilisation" },
      ],
    },
    {
      label: "Télécharger",
      href: "#download",
      children: [
        { label: "Télécharger pour macOS", href: "/download/macos", description: "App de bureau pour Mac" },
        { label: "Télécharger pour Windows", href: "/download/windows", description: "App de bureau pour Windows" },
        { label: "Télécharger sur l'App Store", href: "https://apps.apple.com/app/id6759256796", description: "App mobile pour iPhone", external: true },
      ],
    },
    {
      label: "Docs",
      href: "/docs",
      children: [
        { label: "Introduction", href: "/docs/introduction" },
        { label: "Démarrage rapide", href: "/docs/quickstart" },
        { label: "Bibliothèque", href: "/docs/library" },
        { label: "Campagnes", href: "/docs/campaigns" },
        { label: "Ventes", href: "/docs/sales" },
        { label: "Plans & Tarifs", href: "/docs/plans" },
      ],
    },
    {
      label: "Aide",
      href: "/help",
      children: [
        { label: "FAQ", href: "/help", description: "Questions fréquentes" },
        { label: "Support", href: "https://www.vvault.app/support", description: "Obtenir de l'aide", external: true },
        { label: "Communauté Discord", href: "https://discord.gg/QGGEZR5KhB", description: "Demande à la communauté", external: true },
      ],
    },
    { label: "Tarifs", href: "/pricing" },
  ] as LandingNavItem[],
  hero: {
    title: ["La bonne façon", "d'envoyer ta musique."],
    description:
      "Transforme tes mails en placements. Track les ouvertures, écoutes, téléchargements et plus — le tout depuis un espace soigné, sécurisé et pensé pour être agréable à chaque étape.",
    primaryCtaLabel: "Commencer gratuitement",
    primaryCtaHint: "Crée ton vvault aujourd'hui",
    newBadge: "Nouveau",
    onyxLabel: "vvault Studio",
    ratingLabel: "Utilisé chaque jour par 1 300+ beatmakers",
  },
  heroStatement: {
    strong: "Sache qui écoute vraiment.",
    muted: "Relance plus vite, envoie de meilleurs packs, et transforme l’intérêt en placements et ventes — le tout dans une interface soignée jusque dans les moindres détails.",
    videoUrl: "https://www.youtube.com/embed/DOlLUSW9s2s?start=61",
    videoTitle: "vidéo démo vvault en français",
  },
  howItWorksIntro: {
    title: "Sache qui est prêt avant de relancer.",
    description:
      "Chaque envoi devient mesurable: ouvertures, clics, durée d’écoute, téléchargements et sauvegardes. Crée tes packs rapidement, envoie à tes contacts, et utilise de vrais signaux d’intention pour relancer au bon moment. Laisse des commentaires horodatés sur tes tracks pour un feedback précis — et signe placements ou ventes.",
    stepLabel: "Étape",
    imagePlaceholder: "Visuel d’étape",
  },
  features: [
    {
      title: "Upload et organisation rapide",
      description:
        "Dépose plusieurs fichiers dans ta bibliothèque privée, dézippe automatiquement les ZIP, et garde tout structuré sans couper ton flow. Une interface claire et intuitive qui rend la gestion de ton catalogue naturelle.",
      stat: "Privé par défaut",
    },
    {
      title: "Partage des liens qui convertissent",
      description:
        "Publie des morceaux, packs et dossiers via des liens privés, tokenisés ou publics — chacun chiffré et conçu pour une expérience d’écoute épurée et sans distraction.",
      stat: "Liens tokenisés sécurisés",
    },
    {
      title: "Lance tes campagnes au même endroit",
      description:
        "Crée, planifie et envoie des campagnes directement depuis vvault tout en gardant tes contacts et ton historique centralisé. Chaque étape est fluide et pensée.",
      stat: "Envoi + planification",
    },
    {
      title: "Suis le vrai engagement",
      description:
        "Mesure les ouvertures, clics, durée d’écoute, sauvegardes, téléchargements et ventes pour voir ce qui performe vraiment. Laisse des commentaires horodatés sur tes tracks pour donner ou recevoir du feedback précis sur des passages spécifiques.",
      stat: "Visibilité engagement complète",
    },
    {
      title: "Vends avec un checkout Stripe sécurisé",
      description:
        "Propose des licences, encaisse les paiements via la sécurité bancaire de Stripe, et garde le checkout connecté à ton contenu et tes analytics.",
      stat: "Paiements conformes PCI",
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
        "Ajoute tes morceaux dans ta bibliothèque privée et sécurisée avec métadonnées, artwork et gestion propre des fichiers.",
      detail: "Drag-and-drop multi-fichiers, support ZIP, et tout reste chiffré et prêt à l’emploi.",
    },
    {
      title: "Organise",
      description:
        "Classe tout en dossiers, packs et séries pour garder ton catalogue propre et facile à partager.",
      detail: "Crée des templates de packs réutilisables et structure chaque sortie. Rien n’est public à moins que tu ne le décides.",
    },
    {
      title: "Envoie",
      description: "Envoie des e-mails à tes contacts en quelques clics avec les campagnes intégrées.",
      detail: "Fini les pièces jointes manuelles, les threads brouillons et les outils dispersés.",
    },
    {
      title: "Suis + Convertis",
      description:
        "Vois exactement ce qui se passe après l’envoi: ouvertures, clics, écoutes (et durée), téléchargements et sauvegardes. Pose des commentaires horodatés sur n’importe quel track pour discuter de passages précis, puis convertis cette traction en placements ou ventes.",
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
        "Personnalisation avancée du thème",
      ],
      cost: "€24.99/mo",
      costNote: "mensuel · annuel disponible",
    },
  } as { human: LandingComparisonCard; ai: LandingComparisonCard },
  pricingUi: {
    title: "Tarifs",
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
    upgradeUltra: "Démarrer Ultra",
    testimonialsLabel: "Témoignages",
    testimonialsTitle: "Utilisé chaque jour par 1 300+ producteurs",
    testimonialsDescription:
      "Des créateurs montrent concrètement comment ils utilisent vvault pour envoyer, suivre et convertir.",
    testimonialVideoUrl: "https://www.youtube.com/embed/diDvzeYv_TE?start=21",
    testimonialVideoTitle: "vidéo témoignage vvault",
    sponsoredLabel: "Sponsorisé",
    sponsoredTitle: "Ils parlent de nous",
    sponsoredDescription: "Des créateurs partagent leur expérience avec vvault.",
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
        "Pro débloque le stockage illimité, les campagnes, les analytics complètes, le CRM et la vente marketplace à 5% de commission. Ultra ajoute les séries automatisées, la planification par destinataire, la personnalisation avancée du thème, la mise en avant dans Browse, et passe les frais marketplace à 0%.",
    },
    {
      question: "Je peux envoyer mes beats depuis mon propre email ?",
      answer:
        "Oui. Tu peux connecter ton compte Gmail et envoyer tes campagnes directement depuis ta propre adresse, pour que les destinataires voient ton nom au lieu d’un expéditeur générique.",
    },
    {
      question: "Comment vendre mes beats et être payé ?",
      answer:
        "Connecte ton compte Stripe, définis tes prix et types de licences (basic, premium, stems, exclusive), et publie sur le marketplace ou ton profil public. Les paiements arrivent sur ton compte bancaire après un délai de 7 jours.",
    },
    {
      question: "Ma musique est-elle en sécurité sur vvault ?",
      answer:
        "Oui. Tes fichiers sont stockés sur une infrastructure chiffrée, les liens de partage utilisent des tokens uniques que tu contrôles, et tous les paiements passent par le checkout conforme PCI de Stripe. On n'accède jamais à tes données, on ne les vend ni ne les partage. Tu es propriétaire de tout ce que tu uploades.",
    },
    {
      question: "Quels formats de fichiers puis-je uploader ?",
      answer:
        "vvault supporte tous les formats audio courants. Tu peux uploader des morceaux individuels ou des packs complets avec pochette, BPM, tags de tonalité et crédits de co-auteurs.",
    },
    {
      question: "Je peux laisser des commentaires sur des timestamps précis ?",
      answer:
        "Oui. Tu peux poser des commentaires horodatés sur n’importe quel track pour pointer des passages spécifiques — parfait pour donner du feedback, discuter d’arrangements avec des collaborateurs, ou marquer le moment exact que tu veux faire écouter à un artiste. Ça rend la collaboration précise et fluide.",
    },
    {
      question: "En quoi vvault est différent de Dropbox ou Google Drive ?",
      answer:
        "Le stockage cloud classique n’a ni tracking, ni campagnes, ni fonctionnalités spécifiques à la musique. vvault est conçu spécifiquement pour les producteurs — il combine gestion sécurisée de fichiers, envoi d’emails, analytics, CRM, commentaires horodatés et ventes dans un seul espace de travail soigné, avec des contrôles de confidentialité pensés pour la musique non publiée.",
    },
  ] as LandingFaq[],
  finalCta: {
    title: "Pensé pour la musique. Disponible maintenant.",
    description: "Un espace de travail aussi soigné que la musique que tu crées.",
    primary: { label: "Commencer gratuitement", href: "https://vvault.app/signup" },
    secondary: { label: "Contact", href: "/fr#contact" },
  },
  footer: {
    columns: [
      {
        title: "Produit",
        links: [
          { label: "Features", href: "/features" },
          { label: "Tarifs", href: "/pricing" },
          { label: "Certificat", href: "/certificate" },
        ] as LandingFooterLink[],
      },
      {
        title: "Ressources",
        links: [
          { label: "Pour les Producteurs", href: "/for/producers" },
          { label: "Pour les Artistes", href: "/for/artists" },
          { label: "Pour les Managers & Labels", href: "/for/managers-and-labels" },
          { label: "Comparer", href: "/compare" },
          { label: "Blog", href: "/blog" },
        ] as LandingFooterLink[],
      },
      {
        title: "Entreprise",
        links: [
          { label: "À propos", href: "/about" },
          { label: "Contact", href: "/contact" },
          { label: "Témoignages", href: "/testimonials" },
          { label: "Aide", href: "/help" },
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
