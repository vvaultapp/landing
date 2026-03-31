"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DocsLocaleContext } from "./DocsLocaleContext";

/* ------------------------------------------------------------------ */
/*  Sidebar navigation data                                           */
/* ------------------------------------------------------------------ */

type NavItem = { label: string; href: string };
type NavSection = { title: string; items: NavItem[] };

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Getting started",
    items: [
      { label: "Introduction", href: "/docs/introduction" },
      { label: "Quickstart", href: "/docs/quickstart" },
    ],
  },
  {
    title: "Features",
    items: [
      { label: "Library", href: "/docs/library" },
      { label: "Campaigns", href: "/docs/campaigns" },
      { label: "Analytics", href: "/docs/analytics" },
      { label: "Contacts", href: "/docs/contacts" },
      { label: "Sales & Marketplace", href: "/docs/sales" },
      { label: "Opportunities", href: "/docs/opportunities" },
      { label: "Profile", href: "/docs/profile" },
      { label: "Link in Bio", href: "/docs/link-in-bio" },
      { label: "Studio", href: "/docs/studio" },
      { label: "Certificate", href: "/docs/certificate" },
    ],
  },
  {
    title: "Account",
    items: [{ label: "Plans & Pricing", href: "/docs/plans" }],
  },
];

/* ------------------------------------------------------------------ */
/*  Search index                                                      */
/* ------------------------------------------------------------------ */

type SearchEntry = { title: string; section: string; href: string; keywords: string[] };

const SEARCH_INDEX: SearchEntry[] = [
  // Introduction
  { title: "Introduction", section: "Getting started", href: "/docs/introduction", keywords: ["introduction", "what is vvault", "overview", "getting started"] },
  { title: "What is vvault?", section: "Introduction", href: "/docs/introduction#what-is-vvault", keywords: ["what", "vvault", "about", "platform"] },
  { title: "Key features", section: "Introduction", href: "/docs/introduction#key-features", keywords: ["features", "key", "overview"] },
  { title: "Plans", section: "Introduction", href: "/docs/introduction#plans", keywords: ["plans", "pricing", "free", "pro", "ultra"] },
  { title: "Security & privacy", section: "Introduction", href: "/docs/introduction#security", keywords: ["security", "privacy", "encryption", "safe", "secure", "data", "private"] },
  { title: "Getting help", section: "Introduction", href: "/docs/introduction#getting-help", keywords: ["help", "support", "contact"] },
  // Quickstart
  { title: "Quickstart", section: "Getting started", href: "/docs/quickstart", keywords: ["quickstart", "start", "begin", "setup", "guide"] },
  { title: "Create your account", section: "Quickstart", href: "/docs/quickstart#create-account", keywords: ["account", "create", "sign up", "register"] },
  { title: "Upload your first tracks", section: "Quickstart", href: "/docs/quickstart#upload-tracks", keywords: ["upload", "tracks", "first", "files", "music"] },
  { title: "Create a pack", section: "Quickstart", href: "/docs/quickstart#create-pack", keywords: ["pack", "create", "bundle"] },
  { title: "Send your first campaign", section: "Quickstart", href: "/docs/quickstart#send-campaign", keywords: ["campaign", "send", "first", "email"] },
  { title: "Track engagement", section: "Quickstart", href: "/docs/quickstart#track-engagement", keywords: ["track", "engagement", "analytics"] },
  { title: "Next steps", section: "Quickstart", href: "/docs/quickstart#next-steps", keywords: ["next", "steps", "continue"] },
  // Library
  { title: "Library", section: "Features", href: "/docs/library", keywords: ["library", "files", "tracks", "audio", "music"] },
  { title: "Uploading files", section: "Library", href: "/docs/library#uploading", keywords: ["upload", "files", "import", "add"] },
  { title: "Storage limits", section: "Library", href: "/docs/library#storage", keywords: ["storage", "limits", "space", "capacity", "gb"] },
  { title: "Packs", section: "Library", href: "/docs/library#packs", keywords: ["packs", "bundle", "collection", "group"] },
  { title: "Metadata", section: "Library", href: "/docs/library#metadata", keywords: ["metadata", "tags", "bpm", "key", "genre", "info"] },
  { title: "Folders", section: "Library", href: "/docs/library#folders", keywords: ["folders", "organize", "directory"] },
  // Campaigns
  { title: "Campaigns", section: "Features", href: "/docs/campaigns", keywords: ["campaigns", "email", "send", "outreach", "marketing"] },
  { title: "Channels", section: "Campaigns", href: "/docs/campaigns#channels", keywords: ["channels", "email", "instagram", "messages", "sms", "dm"] },
  { title: "Creating a campaign", section: "Campaigns", href: "/docs/campaigns#creating", keywords: ["create", "campaign", "compose", "write"] },
  { title: "Sending limits", section: "Campaigns", href: "/docs/campaigns#limits", keywords: ["limits", "sending", "daily", "recipients", "quota"] },
  { title: "Gmail integration", section: "Campaigns", href: "/docs/campaigns#gmail", keywords: ["gmail", "integration", "google", "connect", "oauth"] },
  { title: "Scheduling", section: "Campaigns", href: "/docs/campaigns#scheduling", keywords: ["scheduling", "schedule", "later", "time", "date"] },
  // Analytics
  { title: "Analytics", section: "Features", href: "/docs/analytics", keywords: ["analytics", "stats", "data", "metrics", "tracking"] },
  { title: "KPI metrics", section: "Analytics", href: "/docs/analytics#kpis", keywords: ["kpi", "metrics", "opens", "clicks", "plays", "downloads"] },
  { title: "Dashboard", section: "Analytics", href: "/docs/analytics#dashboard", keywords: ["dashboard", "overview", "summary", "charts"] },
  { title: "Engagement funnel", section: "Analytics", href: "/docs/analytics#funnel", keywords: ["funnel", "engagement", "conversion"] },
  { title: "Best time to send", section: "Analytics", href: "/docs/analytics#best-time", keywords: ["best time", "send", "optimal", "timing"] },
  // Contacts
  { title: "Contacts", section: "Features", href: "/docs/contacts", keywords: ["contacts", "crm", "people", "recipients", "audience"] },
  { title: "Managing contacts", section: "Contacts", href: "/docs/contacts#managing", keywords: ["managing", "add", "import", "create", "contact"] },
  { title: "Groups and tags", section: "Contacts", href: "/docs/contacts#groups", keywords: ["groups", "tags", "segment", "label", "organize"] },
  { title: "Engagement scoring", section: "Contacts", href: "/docs/contacts#scoring", keywords: ["scoring", "engagement", "score", "hot", "warm", "cold"] },
  { title: "Contact timeline", section: "Contacts", href: "/docs/contacts#timeline", keywords: ["timeline", "activity", "history", "log"] },
  // Sales
  { title: "Sales & Marketplace", section: "Features", href: "/docs/sales", keywords: ["sales", "marketplace", "sell", "store", "commerce"] },
  { title: "License types", section: "Sales", href: "/docs/sales#licenses", keywords: ["license", "types", "basic", "premium", "stems", "exclusive", "unlimited", "sound kit"] },
  { title: "Pricing", section: "Sales", href: "/docs/sales#pricing", keywords: ["pricing", "price", "cost", "set price"] },
  { title: "Commission", section: "Sales", href: "/docs/sales#commission", keywords: ["commission", "fee", "percentage", "5%", "0%"] },
  { title: "Payouts", section: "Sales", href: "/docs/sales#payouts", keywords: ["payouts", "payout", "withdrawal", "money", "payment", "7-day"] },
  { title: "Checkout flow", section: "Sales", href: "/docs/sales#checkout", keywords: ["checkout", "flow", "purchase", "buy"] },
  // Opportunities
  { title: "Opportunities", section: "Features", href: "/docs/opportunities", keywords: ["opportunities", "placements", "submissions", "requests"] },
  { title: "How it works", section: "Opportunities", href: "/docs/opportunities#how-it-works", keywords: ["how", "works", "process"] },
  { title: "Categories", section: "Opportunities", href: "/docs/opportunities#categories", keywords: ["categories", "types", "genres"] },
  { title: "Submissions", section: "Opportunities", href: "/docs/opportunities#submissions", keywords: ["submissions", "submit", "apply", "send"] },
  { title: "Paid submissions", section: "Opportunities", href: "/docs/opportunities#paid", keywords: ["paid", "submissions", "premium", "cost"] },
  // Profile
  { title: "Profile", section: "Features", href: "/docs/profile", keywords: ["profile", "page", "public", "artist"] },
  { title: "Public page", section: "Profile", href: "/docs/profile#public-page", keywords: ["public", "page", "profile", "visible"] },
  { title: "Placements", section: "Profile", href: "/docs/profile#placements", keywords: ["placements", "credits", "work"] },
  { title: "Social links", section: "Profile", href: "/docs/profile#social", keywords: ["social", "links", "instagram", "spotify", "youtube"] },
  { title: "Theme customization", section: "Profile", href: "/docs/profile#themes", keywords: ["theme", "customization", "colors", "appearance", "design"] },
  // Link in Bio
  { title: "Link in Bio", section: "Features", href: "/docs/link-in-bio", keywords: ["link in bio", "bio", "linktree", "links", "landing"] },
  { title: "Overview", section: "Link in Bio", href: "/docs/link-in-bio#overview", keywords: ["overview", "about"] },
  { title: "What's included", section: "Link in Bio", href: "/docs/link-in-bio#included", keywords: ["included", "features", "what"] },
  // Studio
  { title: "Studio", section: "Features", href: "/docs/studio", keywords: ["studio", "video", "content", "create"] },
  { title: "Video specs", section: "Studio", href: "/docs/studio#specs", keywords: ["video", "specs", "specifications", "format", "resolution"] },
  { title: "Availability", section: "Studio", href: "/docs/studio#availability", keywords: ["availability", "available", "access"] },
  // Certificate
  { title: "Certificate", section: "Features", href: "/docs/certificate", keywords: ["certificate", "verification", "proof", "authenticity"] },
  { title: "Protection", section: "Certificate", href: "/docs/certificate#protection", keywords: ["protection", "copyright", "ownership"] },
  // Plans
  { title: "Plans & Pricing", section: "Account", href: "/docs/plans", keywords: ["plans", "pricing", "subscription", "cost", "free", "pro", "ultra"] },
  { title: "Free plan", section: "Plans", href: "/docs/plans#free", keywords: ["free", "plan", "starter", "basic"] },
  { title: "Pro plan", section: "Plans", href: "/docs/plans#pro", keywords: ["pro", "plan", "8.99", "paid"] },
  { title: "Ultra plan", section: "Plans", href: "/docs/plans#ultra", keywords: ["ultra", "plan", "24.99", "premium", "top"] },
  { title: "Comparison table", section: "Plans", href: "/docs/plans#comparison", keywords: ["comparison", "compare", "table", "differences"] },
];

/* ------------------------------------------------------------------ */
/*  i18n                                                              */
/* ------------------------------------------------------------------ */

type Lang = "en" | "fr";

const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  en: {
    "Getting started": "Getting started",
    Features: "Features",
    Account: "Account",
    Introduction: "Introduction",
    Quickstart: "Quickstart",
    Library: "Library",
    Campaigns: "Campaigns",
    Analytics: "Analytics",
    Contacts: "Contacts",
    "Sales & Marketplace": "Sales & Marketplace",
    Opportunities: "Opportunities",
    Profile: "Profile",
    "Link in Bio": "Link in Bio",
    Studio: "Studio",
    Certificate: "Certificate",
    "Plans & Pricing": "Plans & Pricing",
    "Search docs...": "Search docs...",
    "On this page": "On this page",
    "Log in": "Log in",
    "Sign up": "Sign up",
    "Back to home": "Back to home",
    Light: "Light",
    Dark: "Dark",
    English: "English",
    French: "French",
    Homepage: "Homepage",
  },
  fr: {
    "Getting started": "Pour commencer",
    Features: "Fonctionnalités",
    Account: "Compte",
    Introduction: "Introduction",
    Quickstart: "Démarrage rapide",
    Library: "Bibliothèque",
    Campaigns: "Campagnes",
    Analytics: "Analytiques",
    Contacts: "Contacts",
    "Sales & Marketplace": "Ventes & Marketplace",
    Opportunities: "Opportunités",
    Profile: "Profil",
    "Link in Bio": "Lien en Bio",
    Studio: "Studio",
    Certificate: "Certificat",
    "Plans & Pricing": "Plans & Tarifs",
    "Search docs...": "Rechercher...",
    "On this page": "Sur cette page",
    "Log in": "Connexion",
    "Sign up": "S'inscrire",
    "Back to home": "Retour à l'accueil",
    Light: "Clair",
    Dark: "Sombre",
    English: "Anglais",
    French: "Français",
    Homepage: "Accueil",
  },
};

function t(key: string, lang: Lang): string {
  return TRANSLATIONS[lang]?.[key] ?? key;
}

/* ------------------------------------------------------------------ */
/*  Search bar with live suggestions                                  */
/* ------------------------------------------------------------------ */

function SearchBar({ lang }: { lang: Lang }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    const scored = SEARCH_INDEX.map((entry) => {
      let score = 0;
      if (entry.title.toLowerCase().includes(q)) score += 10;
      if (entry.title.toLowerCase().startsWith(q)) score += 5;
      if (entry.section.toLowerCase().includes(q)) score += 3;
      for (const kw of entry.keywords) {
        if (kw.includes(q)) score += 4;
        if (kw.startsWith(q)) score += 2;
      }
      return { ...entry, score };
    }).filter((e) => e.score > 0);
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 8);
  }, [query]);

  useEffect(() => setSelectedIndex(-1), [results]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "/") {
        if (focused) {
          e.preventDefault();
          inputRef.current?.blur();
        } else if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }
      if (e.key === "Escape" && focused) {
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [focused]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && selectedIndex >= 0 && results[selectedIndex]) {
      e.preventDefault();
      navigate(results[selectedIndex].href);
    }
  }

  function navigate(href: string) {
    setQuery("");
    setFocused(false);
    inputRef.current?.blur();
    router.push(href);
  }

  const showDropdown = focused && results.length > 0;

  return (
    <div ref={wrapperRef} className="relative">
      <div
        className={`flex items-center gap-2 rounded-xl border bg-white px-3 py-1.5 text-[13px] outline-none transition-all duration-300 ease-out ${
          focused ? "border-[#ccc] shadow-sm" : "border-[#e5e5e5] hover:border-[#ccc]"
        }`}
        style={{}}
        onClick={() => inputRef.current?.focus()}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={focused ? "#666" : "#bbb"} strokeWidth="2" strokeLinecap="round" className="shrink-0 transition-colors">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("Search docs...", lang)}
          className="min-w-0 flex-1 bg-transparent text-[#333] placeholder-[#bbb] outline-none focus:outline-none focus:ring-0"
          style={{ outline: "none", boxShadow: "none" }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
        />
        <kbd className={`rounded-md border border-[#e5e5e5] bg-[#fafafa] px-1.5 py-0.5 font-sans text-[11px] text-[#bbb] transition-opacity duration-150 ${focused ? "opacity-0" : "opacity-100"}`}>/</kbd>
      </div>

      {/* Dropdown results */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-[#e5e5e5] bg-white shadow-lg">
          {results.map((r, i) => (
            <button
              key={r.href}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); navigate(r.href); }}
              onMouseEnter={() => setSelectedIndex(i)}
              className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-[13px] transition-colors ${
                i === selectedIndex ? "bg-[#f5f5f5]" : "hover:bg-[#fafafa]"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round" className="shrink-0">
                <path d="M9 12h6M9 16h6M9 8h6M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
              </svg>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-[#111]">{r.title}</p>
                <p className="truncate text-[12px] text-[#999]">{r.section}</p>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" className="shrink-0">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar                                                           */
/* ------------------------------------------------------------------ */

function Sidebar({ pathname, onNavigate, lang }: { pathname: string; onNavigate?: () => void; lang: Lang }) {
  return (
    <nav className="flex flex-col gap-6">
      {NAV_SECTIONS.map((section) => (
        <div key={section.title}>
          <p className="mb-1.5 text-[13px] font-semibold text-[#1a1a1a]">
            {t(section.title, lang)}
          </p>
          <ul className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={`block rounded-xl px-2.5 py-1.5 text-[13.5px] transition-colors ${
                      active
                        ? "bg-[#f0f0f0] font-medium text-[#111]"
                        : "text-[#666] hover:bg-[#f5f5f5] hover:text-[#222]"
                    }`}
                  >
                    {t(item.label, lang)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  "On this page" TOC with progress bar                              */
/* ------------------------------------------------------------------ */

function TableOfContents({ lang }: { lang: Lang }) {
  const [headings, setHeadings] = useState<{ id: string; text: string }[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const isClickScrolling = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => {
      const container = document.getElementById("docs-content");
      if (!container) return;
      const els = container.querySelectorAll("h2[id]");
      const items: { id: string; text: string }[] = [];
      els.forEach((el) => items.push({ id: el.id, text: el.textContent ?? "" }));
      setHeadings(items);
      if (items.length > 0) setActiveId(items[0].id);
    }, 150);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (headings.length === 0) return;
    const scrollRoot = document.getElementById("docs-content")?.closest("main") ?? null;
    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickScrolling.current) return;
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { root: scrollRoot, rootMargin: "-32px 0px -60% 0px", threshold: 0 }
    );
    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  const handleClick = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setActiveId(id);
    isClickScrolling.current = true;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => { isClickScrolling.current = false; }, 800);
    }
  }, []);

  if (headings.length === 0) return null;

  const activeIndex = headings.findIndex((h) => h.id === activeId);

  return (
    <div>
      <p className="mb-3 pl-3 text-[13px] font-semibold text-[#1a1a1a]">
        {t("On this page", lang)}
      </p>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-px bg-[#e5e5e5]" />
        {activeIndex >= 0 && (
          <div
            className="absolute left-0 w-0.5 rounded-full bg-[#111] transition-all duration-200"
            style={{ top: `${activeIndex * 32}px`, height: "24px" }}
          />
        )}
        <div className="flex flex-col">
          {headings.map((h) => (
            <a
              key={h.id}
              href={`#${h.id}`}
              onClick={(e) => handleClick(e, h.id)}
              className={`block py-1 pl-3 text-[13px] leading-snug transition-colors ${
                activeId === h.id ? "font-medium text-[#111]" : "text-[#999] hover:text-[#444]"
              }`}
              style={{ minHeight: "32px", display: "flex", alignItems: "center" }}
            >
              {h.text}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile hamburger icon                                             */
/* ------------------------------------------------------------------ */

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-[#666]">
      {open ? (
        <>
          <path d="M4.5 4.5l9 9" />
          <path d="M13.5 4.5l-9 9" />
        </>
      ) : (
        <>
          <path d="M3 5.5h12" />
          <path d="M3 9h12" />
          <path d="M3 12.5h12" />
        </>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Language selector                                                 */
/* ------------------------------------------------------------------ */

function LanguageSelector({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-xl px-2 py-1.5 text-[13px] text-[#666] transition-colors hover:text-[#111]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span>{lang === "en" ? "EN" : "FR"}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-36 overflow-hidden rounded-xl border border-[#e5e5e5] bg-white shadow-lg">
          <button
            type="button"
            onClick={() => { setLang("en"); setOpen(false); }}
            className={`flex w-full items-center gap-2.5 px-3 py-2 text-[13px] transition-colors ${lang === "en" ? "bg-[#f5f5f5] font-medium text-[#111]" : "text-[#666] hover:bg-[#fafafa]"}`}
          >
            {t("English", lang)}
          </button>
          <button
            type="button"
            onClick={() => { setLang("fr"); setOpen(false); }}
            className={`flex w-full items-center gap-2.5 px-3 py-2 text-[13px] transition-colors ${lang === "fr" ? "bg-[#f5f5f5] font-medium text-[#111]" : "text-[#666] hover:bg-[#fafafa]"}`}
          >
            {t("French", lang)}
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Links menu (link icon → homepage)                                 */
/* ------------------------------------------------------------------ */

function LinksMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center rounded-xl px-2 py-1.5 text-[#666] transition-colors hover:text-[#111]"
        aria-label="Links menu"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-xl border border-[#e5e5e5] bg-white shadow-lg">
          <a
            href="/"
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#666] transition-colors hover:bg-[#fafafa] hover:text-[#111]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Homepage
          </a>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Layout                                                            */
/* ------------------------------------------------------------------ */

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);
  const [lang, setLang] = useState<Lang>("en");

  /* Detect language from landing page (localStorage), cookie (IP detection), or browser */
  useEffect(() => {
    try {
      // 1. Check localStorage (set by landing page or docs language selector)
      const shared = localStorage.getItem("vvault-locale") as Lang | null;
      const stored = localStorage.getItem("vvault-docs-lang") as Lang | null;
      const fromStorage = shared ?? stored;
      if (fromStorage === "en" || fromStorage === "fr") {
        setLang(fromStorage);
        return;
      }
      // 2. Check cookie set by proxy (IP-based detection)
      const cookieMatch = document.cookie.match(/(?:^|;\s*)vvault_locale=(en|fr)/);
      if (cookieMatch) {
        setLang(cookieMatch[1] as Lang);
        return;
      }
      // 3. Check browser language
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith("fr")) {
        setLang("fr");
      }
    } catch {}
  }, []);

  /* Persist language to both keys */
  useEffect(() => {
    try {
      localStorage.setItem("vvault-docs-lang", lang);
      localStorage.setItem("vvault-locale", lang);
    } catch {}
  }, [lang]);

  /* Force light scrollbar + background on docs pages */
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.style.colorScheme = "light";
    body.style.background = "#fafafa";
    return () => {
      html.style.colorScheme = "";
      body.style.background = "";
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    requestAnimationFrame(() => {
      if (mainRef.current) mainRef.current.scrollTop = 0;
    });
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <div className="docs-root flex h-screen flex-col bg-[#fafafa] font-sans text-[#1a1a1a]">
      {/* -------- Top bar (fixed height) -------- */}
      <header className="z-50 shrink-0 bg-[#fafafa]">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between">
          <div className="flex shrink-0 items-center gap-3 pl-[18px] lg:w-60">
            {/* Logo with hover "Back to home" on the left */}
            <div
              className="relative flex items-center"
              onMouseEnter={() => setLogoHovered(true)}
              onMouseLeave={() => setLogoHovered(false)}
            >
              <Link
                href="/"
                className="flex items-center gap-1.5 transition-transform duration-300 ease-out"
                style={{ transform: logoHovered ? "translateX(24px)" : "translateX(0)" }}
              >
                <span className="font-bold tracking-[0.12em] text-[#111]" style={{ fontVariantCaps: "all-small-caps", fontSize: "27px", lineHeight: 1 }}>
                  vvault
                </span>
                <span className="font-semibold text-[#111]" style={{ fontSize: "18px", lineHeight: 1, position: "relative", top: "4px" }}>
                  Docs
                </span>
              </Link>

              {/* "Back to home" arrow — centered with logo */}
              <Link
                href="/"
                className="absolute left-0 top-1/2 flex items-center whitespace-nowrap rounded-xl text-[#999] transition-all duration-300 ease-out hover:text-[#111]"
                style={{
                  transform: logoHovered ? "translateY(calc(-50% + 2px)) translateX(0)" : "translateY(calc(-50% + 2px)) translateX(12px)",
                  opacity: logoHovered ? 1 : 0,
                  filter: logoHovered ? "blur(0px)" : "blur(4px)",
                  pointerEvents: logoHovered ? "auto" : "none",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5" />
                  <path d="m12 19-7-7 7-7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Desktop: all buttons */}
          <div className="hidden flex-1 items-center justify-end gap-1.5 px-6 lg:flex">
            <LinksMenu />
            <LanguageSelector lang={lang} setLang={setLang} />
            <a
              href="https://vvault.app/login"
              className="rounded-xl px-3 py-1.5 text-[13px] text-[#666] transition-colors hover:text-[#111]"
            >
              {t("Log in", lang)}
            </a>
            <a
              href="https://vvault.app/signup"
              className="rounded-xl bg-[#111] px-3.5 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#333]"
            >
              {t("Sign up", lang)}
            </a>
          </div>
          {/* Mobile: sign up + hamburger */}
          <div className="flex flex-1 items-center justify-end gap-2 px-4 lg:hidden">
            <a
              href="https://vvault.app/signup"
              className="rounded-xl bg-[#111] px-3.5 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#333]"
            >
              {t("Sign up", lang)}
            </a>
            <button type="button" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle navigation" className="flex h-9 w-9 items-center justify-center rounded-xl text-[#666] transition-colors hover:text-[#111]">
              <MenuIcon open={mobileOpen} />
            </button>
          </div>
        </div>
      </header>

      {/* -------- Mobile overlay -------- */}
      {mobileOpen && (
        <div className="fixed inset-0 top-14 z-40 bg-black/20 backdrop-blur-sm lg:hidden" onClick={closeMobile} />
      )}

      {/* -------- Three-column body (fills remaining height) -------- */}
      <div className="mx-auto flex w-full min-h-0 flex-1 max-w-[1440px] px-2 sm:px-0">
        {/* Left sidebar — scrolls independently */}
        <aside
          className={`fixed top-14 z-40 flex h-[calc(100vh-3.5rem)] w-60 shrink-0 flex-col bg-[#fafafa] transition-transform duration-200 ease-in-out lg:relative lg:top-0 lg:h-auto lg:translate-x-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Scrollable nav content */}
          <div className="flex-1 overflow-y-auto pl-[18px] pr-2 pb-4 pt-5">
            {/* Search bar in sidebar */}
            <div className="mb-5">
              <SearchBar lang={lang} />
            </div>
            <Sidebar pathname={pathname} onNavigate={closeMobile} lang={lang} />
          </div>

          {/* Mobile-only: pinned bottom bar with language + homepage */}
          <div className="shrink-0 border-t border-[#e5e5e5] bg-[#fafafa] px-[18px] py-3 lg:hidden">
            <div className="flex items-center gap-2">
              <LanguageSelector lang={lang} setLang={setLang} />
              <a
                href="/"
                className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-[13px] text-[#666] transition-colors hover:text-[#111]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                {t("Homepage", lang)}
              </a>
            </div>
          </div>
        </aside>

        {/* Main content — scrolls internally, rounded corners stay */}
        <main ref={mainRef} className="min-w-0 flex-1 overflow-y-auto rounded-t-2xl border border-b-0 border-[#e5e5e5] bg-white">
          <div className="px-6 pb-24 pt-8 sm:px-10 lg:px-16">
            <div id="docs-content" className="mx-auto max-w-[720px]">
              <DocsLocaleContext.Provider value={lang}>
                {children}
              </DocsLocaleContext.Provider>
            </div>
          </div>
        </main>

        {/* Right sidebar — TOC, scrolls independently */}
        <aside className="hidden w-52 shrink-0 overflow-y-auto bg-[#fafafa] pl-5 pr-3 pb-10 pt-8 xl:block">
          <TableOfContents lang={lang} />
        </aside>
      </div>
    </div>
  );
}
