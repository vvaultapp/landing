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
  brand: "Integrity",
  nav: [
    { label: "Product", href: "#product" },
    { label: "Pricing", href: "#pricing" },
    { label: "Contact", href: "#contact" },
  ] as LandingNavItem[],
  hero: {
    title: ["The lead conversion", "system for info-businesses"],
    description: "Built to triage conversations fast, track lead stages, and automate your outreach with an AI setter.",
  },
  heroStatement: {
    strong: "A new standard",
    muted: "for inbox operations. Built for teams that need consistent triage, assignment, follow-up, and conversion tracking.",
  },
  features: [
    {
      title: "Route inbound in real time",
      description: "Sort every new conversation by phase, urgency, and ownership before it stalls.",
      stat: "Avg triage under 90s",
    },
    {
      title: "Run one-click lead decisions",
      description: "Qualify, disqualify, remove, or assign from the same working surface.",
      stat: "4 actions, 1 surface",
    },
    {
      title: "Keep setters aligned",
      description: "Attach internal notes, ownership history, and next actions to each lead.",
      stat: "Full lead context",
    },
    {
      title: "Track link outcomes",
      description: "See when a lead clicks, returns, and books so follow-up timing stays precise.",
      stat: "Click to booked visibility",
    },
    {
      title: "Protect the priority inbox",
      description: "Filter low-signal spam and surface leads with buying intent first.",
      stat: "Priority-first workflow",
    },
    {
      title: "Operate by phase",
      description: "Move pipeline stages with clear rules instead of ad hoc status guessing.",
      stat: "Phase-driven pipeline",
    },
  ] as LandingFeature[],
  howItWorks: [
    {
      title: "Ingest",
      description: "Bring inbound DMs into one stream with clean lead identity and timestamps.",
      detail: "Source channels sync into a shared inbox timeline.",
    },
    {
      title: "Triage",
      description: "Apply phase and temperature quickly so the right leads rise immediately.",
      detail: "Quick actions handle qualify, disqualify, remove, assign.",
    },
    {
      title: "Assign",
      description: "Route ownership to setters with context attached to every thread.",
      detail: "Notes, tasks, and activity stay on the same lead record.",
    },
    {
      title: "Follow up",
      description: "Track the next action and keep time-based accountability visible.",
      detail: "Lead-level reminders prevent stale conversations.",
    },
    {
      title: "Convert",
      description: "Attribute clicks and booked calls back to the conversation that drove them.",
      detail: "Pipeline quality ties directly to booked outcomes.",
    },
  ] as LandingStep[],
  updates: {
    title: "Updates",
    subtitle: "Recent product changes",
    items: [
      {
        title: "Priority Queue Controls",
        text: "Manual triage controls now persist instantly across owner and setter views.",
        date: "Feb 2026",
      },
      {
        title: "Lead Detail Performance Pass",
        text: "Client detail tabs and action panels now render with lower layout shift.",
        date: "Feb 2026",
      },
      {
        title: "Link Attribution Refinement",
        text: "Booked-call attribution now shows cleaner activity events for each lead.",
        date: "Jan 2026",
      },
    ],
  },
  logoStrip: ["Northline Ops", "Summit Systems", "Peakline Group", "Operator House", "Signal Partners", "Closeflow"],
  pricingComparison: {
    human: {
      title: "Human Setter",
      symbol: "cross",
      bullets: [
        "Coverage depends on shifts and availability",
        "Usually 20-35 active threads/day",
        "Quality ramps over 6-10 weeks",
        "Follow-up consistency varies by rep",
        "Needs weekly management and QA overhead",
      ],
      cost: "$3000+/mo",
      costNote: "base pay + commission + supervision",
    },
    ai: {
      title: "AI Setter",
      symbol: "check",
      bullets: [
        "Runs continuously across every timezone",
        "Handles 150+ concurrent active threads",
        "Learns your playbook in under 72 hours",
        "Applies the same phase logic every time",
        "Escalates to humans only when needed",
      ],
      cost: "$229/mo",
      costNote: "flat subscription · no payroll overhead",
    },
  } as { human: LandingComparisonCard; ai: LandingComparisonCard },
  singlePlan: {
    name: "Integrity AI Setter",
    price: "$229/mo",
    note: "per month",
    cta: "Get started",
    bullets: [
      "Inbox triage and lead routing",
      "Phase movement with consistent logic",
      "Always-on responses and follow-up",
      "Setter handoff notes when needed",
      "24/7 coverage across all timezones",
      "Consistent follow-up cadence by default",
      "High-volume thread handling without extra headcount",
    ],
  } as LandingSinglePlan,
  faq: [
    {
      question: "What channels does Integrity support?",
      answer:
        "Integrity is built around DM-style inbound workflows. You can centralize lead conversations and operate phases from one interface.",
    },
    {
      question: "Can setters work independently inside the system?",
      answer:
        "Yes. Ownership, notes, and lead actions are setter-ready, with controls so managers can keep workflow quality tight.",
    },
    {
      question: "How do phases and lead status stay consistent?",
      answer:
        "Phase decisions are recorded at conversation level and mirrored in pipeline views so reports and actions stay aligned.",
    },
    {
      question: "Do you track booked calls?",
      answer:
        "Yes. Integrity captures link and booking activity so teams can tie outreach effort to conversion outcomes.",
    },
    {
      question: "Is this only for coaches?",
      answer:
        "No. It is optimized for coaches and agencies, but any inbound-heavy sales workflow can use it.",
    },
    {
      question: "Can we migrate without downtime?",
      answer:
        "Most teams start with one workspace and phase map, then shift setter operations once inbox flow is stable.",
    },
  ] as LandingFaq[],
  finalCta: {
    title: "For those who care about speed and quality",
    description: "Set your routing rules once, keep the inbox clean, and move leads toward booked calls with less drag.",
    primary: { label: "Get started", href: "/auth" },
    secondary: { label: "Contact sales", href: "mailto:support@theacq.app" },
  },
  footer: {
    columns: [
      {
        title: "Product",
        links: [
          { label: "Homepage", href: "/homepage" },
          { label: "Product", href: "/homepage#product" },
          { label: "Pricing", href: "/homepage#pricing" },
          { label: "Contact", href: "/homepage#contact" },
        ] as LandingFooterLink[],
      },
      {
        title: "Company",
        links: [
          { label: "Get started", href: "/auth" },
          { label: "Updates", href: "/homepage#updates" },
          { label: "Support", href: "mailto:support@theacq.app" },
        ] as LandingFooterLink[],
      },
      {
        title: "Resources",
        links: [
          { label: "Privacy", href: "/privacy" },
          { label: "Terms", href: "/terms" },
          { label: "Data deletion", href: "/data-deletion" },
        ] as LandingFooterLink[],
      },
      {
        title: "Legal",
        links: [
          { label: "Dashboard", href: "/dashboard" },
          { label: "Messages", href: "/messages" },
          { label: "Leads", href: "/outreach" },
        ] as LandingFooterLink[],
      },
    ],
    legalLinks: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Data deletion", href: "/data-deletion" },
    ],
  },
  appMock: {
    sidebar: ["Inbox", "Priority", "Phases", "Tasks", "Meetings", "Links", "Settings"],
    conversations: [
      { name: "Nina - Fitness Brand", preview: "Can you send the booking link?", phase: "Qualified", time: "2m" },
      { name: "Julian - Agency Owner", preview: "Need help with setter workflow.", phase: "In contact", time: "7m" },
      { name: "Ana - Course Creator", preview: "Just clicked the offer page.", phase: "Priority", time: "11m" },
      { name: "Corey - Consultant", preview: "What is included in onboarding?", phase: "New lead", time: "21m" },
    ],
    feed: [
      "Lead clicked booking link · 09:14",
      "Setter assigned to Nina thread · 09:11",
      "Phase moved to Qualified · 09:09",
      "Call booked confirmation captured · 09:05",
    ],
  },
} as const;
