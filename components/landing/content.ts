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

export const landingContent = {
  brand: "vvault",
  nav: [
    { label: "Product", href: "#product" },
    { label: "Pricing", href: "#pricing" },
    { label: "Contact", href: "#contact" },
  ] as LandingNavItem[],
  hero: {
    title: ["The proper way to send", "track, and sell your music"],
    description: "Turn emails into placements. Track opens, plays, downloads and more.",
  },
  heroStatement: {
    strong: "Know who’s really listening.",
    muted: "Follow up faster, send better packs, and turn interest into placements and sales.",
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
      title: "Track",
      description:
        "See exactly what happens after you send: opens, clicks, plays (and how long), downloads, and saves.",
      detail: "Identify high-intent listeners and follow up at the perfect moment.",
    },
    {
      title: "Convert",
      description: "Turn attention into placements or sales through a low-fee marketplace built for producers.",
      detail: "Get paid fast with smooth delivery, without losing money to heavy platform cuts.",
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
    title: "Ship faster. Track what matters. Sell with confidence.",
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
          { label: "Support", href: "mailto:vvaultapp@gmail.com" },
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
