// vvault/app/page.tsx
"use client";

import React, { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence, useReducedMotion, easeOut } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Lock,
  Mail,
  Play,
  Sparkles,
  Zap,
  Shield,
  Timer,
  LineChart,
  Link as LinkIcon,
} from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * VIDEO
 * Mets ici ton lien embed quand tu l’auras.
 * Exemples :
 * - YouTube embed: https://www.youtube.com/embed/VIDEO_ID
 * - Vimeo embed: https://player.vimeo.com/video/VIDEO_ID
 */
const VIDEO_EMBED_URL = ""; // <- vide = placeholder propre

const PRICING = {
  pro: { price: "€8.99", suffix: "/mo", name: "Pro" },
  ultra: { price: "€24.99", suffix: "/mo", name: "Ultra" },
};

export default function HomePage() {
  const prefersReducedMotion = useReducedMotion();
  const liftOnHover = !prefersReducedMotion;

  // waitlist
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  // ui
  const [faqOpen, setFaqOpen] = useState<string | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoLoadTimeoutRef = useRef<number | null>(null);

  const isLoading = status === "loading";

  const heroVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 10 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: easeOut },
      },
    }),
    [prefersReducedMotion]
  );

  const sectionVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 14 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, ease: easeOut },
      },
    }),
    [prefersReducedMotion]
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    const { error } = await supabase.from("beta_waitlist").insert([
      {
        email: cleanEmail,
        source: "vvault-landing",
      },
    ]);

    if (error) {
      const msg = (error.message || "").toLowerCase();
      if (error.code === "23505" || msg.includes("duplicate")) {
        setStatus("success");
        setMessage("You’re already in the vault. 🎧");
        return;
      }

      setStatus("error");
      setMessage("Something went wrong. Please try again.");
      return;
    }

    setStatus("success");
    setMessage("You’re in. We’ll email you before the beta opens.");
    setEmail("");
  }

  function scrollToId(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    if (!videoOpen) return;

    document.documentElement.classList.add("overflow-hidden");
    videoLoadTimeoutRef.current = window.setTimeout(() => setVideoLoaded(true), 60);

    return () => {
      if (videoLoadTimeoutRef.current) {
        window.clearTimeout(videoLoadTimeoutRef.current);
        videoLoadTimeoutRef.current = null;
      }
      document.documentElement.classList.remove("overflow-hidden");
    };
  }, [videoOpen]);

  function openVideo() {
    setVideoOpen(true);
  }

  function closeVideo() {
    setVideoOpen(false);
    setVideoLoaded(false);
    if (videoLoadTimeoutRef.current) {
      window.clearTimeout(videoLoadTimeoutRef.current);
      videoLoadTimeoutRef.current = null;
    }
  }

  const badge = (
    <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] border border-lime-400/35 bg-lime-400/10 text-lime-200">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-65 animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-400" />
      </span>
      Private beta
    </span>
  );

  return (
    <div className="min-h-screen bg-[#050509] text-slate-100">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-lime-400/10 blur-3xl" />
        <div className="absolute -bottom-56 right-[-120px] h-[520px] w-[520px] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-150px,rgba(255,255,255,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,5,9,0.35),rgba(5,5,9,0.9),rgba(5,5,9,1))]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:64px_64px]" />
      </div>

      {/* NAV */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pt-6">
        <nav className="flex items-center justify-between">
          <button
            onClick={() => scrollToId("top")}
            className="group inline-flex items-center gap-3 rounded-2xl px-2 py-2 transition hover:bg-white/[0.04]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-800 bg-white/[0.03] shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] transition group-hover:border-slate-700">
              <Sparkles className="h-5 w-5 text-lime-200" />
            </div>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-sm font-semibold tracking-[0.18em] uppercase text-slate-200">
                vvault
              </span>
              <span className="text-[11px] text-slate-500">store • send • track</span>
            </div>
          </button>

          <div className="hidden items-center gap-2 md:flex">
            <NavLink onClick={() => scrollToId("product")} label="Product" />
            <NavLink onClick={() => scrollToId("how")} label="How it works" />
            <NavLink onClick={() => scrollToId("pricing")} label="Pricing" />
            <NavLink onClick={() => scrollToId("faq")} label="FAQ" />

            <button
              onClick={() => scrollToId("beta")}
              className="ml-2 inline-flex items-center gap-2 rounded-full bg-white text-slate-900 px-4 py-2 text-sm font-medium border border-slate-200 shadow-sm transition hover:bg-white/95 hover:shadow-md active:scale-[0.99]"
            >
              Join beta
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => scrollToId("beta")}
            className="md:hidden inline-flex items-center gap-2 rounded-full bg-white text-slate-900 px-4 py-2 text-sm font-medium border border-slate-200 shadow-sm transition hover:bg-white/95 active:scale-[0.99]"
          >
            Join
            <ArrowRight className="h-4 w-4" />
          </button>
        </nav>
      </div>

      {/* CONTENT */}
      <div id="top" className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-20 pt-12">
        {/* HERO */}
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <motion.section
            initial="hidden"
            animate="show"
            variants={heroVariants}
            className="space-y-7"
          >
            <div className="flex flex-wrap items-center gap-3">
              {badge}
              <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium border border-slate-800 bg-white/[0.03] text-slate-300">
                <Shield className="h-4 w-4 text-slate-300" />
                Built for producers who send weekly
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.02]">
                Stop guessing who’s{" "}
                <span className="relative inline-block">
                  really interested
                  <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-lime-300/0 via-lime-300/60 to-lime-300/0" />
                </span>{" "}
                in your beats.
              </h1>

              <p className="max-w-xl text-base sm:text-lg leading-relaxed text-slate-400">
                vvault is a producer-first library + send tool that tracks every step:
                open, click, play, download. So you instantly know who to follow up with
                (and who to ignore).
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={() => scrollToId("beta")}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white text-slate-900 px-5 py-3 text-sm font-semibold border border-slate-200 shadow-sm transition hover:bg-white/95 hover:shadow-md active:scale-[0.99]"
              >
                Join the private beta
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={() => scrollToId("video")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white/[0.03] text-slate-200 px-5 py-3 text-sm font-medium border border-slate-800 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] transition hover:border-slate-700 hover:bg-white/[0.05] active:scale-[0.99]"
              >
                Watch the demo
                <Play className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 border border-slate-800 bg-white/[0.02]">
                <Timer className="h-4 w-4" />
                2 min form
              </span>
              <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 border border-slate-800 bg-white/[0.02]">
                <Lock className="h-4 w-4" />
                limited spots
              </span>
              <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 border border-slate-800 bg-white/[0.02]">
                <LineChart className="h-4 w-4" />
                receipts, not vibes
              </span>
            </div>
          </motion.section>

          {/* HERO SIDE CARD */}
          <motion.aside
            initial="hidden"
            animate="show"
            variants={heroVariants}
            className="space-y-4"
          >
            <div className="rounded-3xl border border-slate-800 bg-white/[0.03] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                    What vvault does
                  </div>
                  <div className="mt-2 text-sm text-slate-300">
                    Turn sends into a measurable pipeline.
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-800 bg-white/[0.02]">
                  <Zap className="h-5 w-5 text-lime-200" />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <FeatureRow icon={<Sparkles className="h-4 w-4" />} text="Clean library: upload, tags, packs, favorites." />
                <FeatureRow icon={<LinkIcon className="h-4 w-4" />} text="Tracked links for beats and packs." />
                <FeatureRow icon={<Mail className="h-4 w-4" />} text="Send campaigns with daily safety limits." />
                <FeatureRow icon={<LineChart className="h-4 w-4" />} text="Open, click, play, download per contact." />
              </div>

              <div className="mt-5 rounded-2xl border border-slate-800 bg-black/20 p-4">
                <div className="text-xs text-slate-400">
                  Outcome
                </div>
                <div className="mt-1 text-sm text-slate-200">
                  You know exactly who’s warm, right now.
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-white/[0.02] p-5">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                  Beta pricing
                </div>
                <span className="text-[11px] text-slate-500">locked for early users</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <MiniPrice name="Pro" price={PRICING.pro.price} suffix={PRICING.pro.suffix} />
                <MiniPrice name="Ultra" price={PRICING.ultra.price} suffix={PRICING.ultra.suffix} />
              </div>
            </div>
          </motion.aside>
        </div>

        {/* VIDEO */}
        <motion.section
          id="video"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={sectionVariants}
          className="mt-14"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                Demo
              </div>
              <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">
                Watch how vvault works in 90 seconds
              </h2>
              <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-400">
                Upload your beats, generate tracked links, send, then watch the timeline update in real time.
              </p>
            </div>
            <button
              onClick={openVideo}
              className="mt-3 sm:mt-0 inline-flex items-center justify-center gap-2 rounded-full bg-white text-slate-900 px-4 py-2.5 text-sm font-semibold border border-slate-200 shadow-sm transition hover:bg-white/95 hover:shadow-md active:scale-[0.99]"
            >
              Play demo
              <Play className="h-4 w-4" />
            </button>
          </div>

          <VideoPreview onClick={openVideo} hasVideo={Boolean(VIDEO_EMBED_URL)} />
        </motion.section>

        {/* PROBLEM */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={sectionVariants}
          className="mt-16"
        >
          <div className="rounded-3xl border border-slate-800 bg-white/[0.03] p-6 sm:p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]">
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
              The problem
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">
              The real problem isn’t sending beats. It’s not knowing what happened after.
            </h2>
            <p className="mt-3 max-w-3xl text-sm sm:text-base text-slate-400 leading-relaxed">
              You send 10 beats. Two people say “fire bro”. But you don’t know who actually listened,
              who downloaded, or who just kept you on unread. vvault turns sending into a measurable pipeline.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <KpiPill title="Open" desc="Know who even saw it." />
              <KpiPill title="Play" desc="Know who actually listened." />
              <KpiPill title="Download" desc="Know who took the files." />
            </div>
          </div>
        </motion.section>

        {/* PRODUCT */}
        <motion.section
          id="product"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={sectionVariants}
          className="mt-16"
        >
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                What you get
              </div>
              <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">
                Everything you need to turn sends into placements
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl">
                No spreadsheets. No guessing. Just receipts.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <FeatureCard
              title="Tracked delivery"
              icon={<LineChart className="h-5 w-5 text-lime-200" />}
              liftOnHover={liftOnHover}
              items={[
                "Email open tracking",
                "Link click tracking",
                "Play + download tracking",
                "Per-contact timeline",
              ]}
            />
            <FeatureCard
              title="Clean library"
              icon={<Sparkles className="h-5 w-5 text-lime-200" />}
              liftOnHover={liftOnHover}
              items={[
                "Upload beats and packs",
                "Auto-read BPM + key from filename",
                "Tags, colors, search, favorites",
                "Fast edits, clean organization",
              ]}
            />
            <FeatureCard
              title="Campaign sending"
              icon={<Mail className="h-5 w-5 text-lime-200" />}
              liftOnHover={liftOnHover}
              items={[
                "Send 1-to-1 or to groups",
                "Campaign stats dashboard",
                "Daily send safety limits",
                "Built to protect deliverability",
              ]}
            />
            <FeatureCard
              title="Chrome for Gmail (Ultra)"
              icon={<Shield className="h-5 w-5 text-lime-200" />}
              liftOnHover={liftOnHover}
              items={[
                "Auto-add open pixel",
                "Auto-insert tracked links",
                "Opened checkmarks inside Gmail",
                "Tracking without changing your workflow",
              ]}
              badge="Coming soon"
            />
          </div>
        </motion.section>

        {/* HOW IT WORKS */}
        <motion.section
          id="how"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={sectionVariants}
          className="mt-16"
        >
          <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
            How it works
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">
            Three steps
          </h2>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <StepCard
              step="01"
              title="Upload"
              desc="Upload beats and packs, organize instantly."
              liftOnHover={liftOnHover}
              icon={<Sparkles className="h-5 w-5" />}
            />
            <StepCard
              step="02"
              title="Generate"
              desc="Create tracked links for a beat or a pack."
              liftOnHover={liftOnHover}
              icon={<LinkIcon className="h-5 w-5" />}
            />
            <StepCard
              step="03"
              title="Send"
              desc="Send and watch open → click → play → download."
              liftOnHover={liftOnHover}
              icon={<LineChart className="h-5 w-5" />}
            />
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => scrollToId("beta")}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-slate-900 px-5 py-3 text-sm font-semibold border border-slate-200 shadow-sm transition hover:bg-white/95 hover:shadow-md active:scale-[0.99]"
            >
              Join the private beta
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.section>

        {/* PRICING */}
        <motion.section
          id="pricing"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={sectionVariants}
          className="mt-16"
        >
          <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
            Pricing
          </div>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Simple pricing
            </h2>
            <p className="text-sm text-slate-400">
              Start Pro. Upgrade when you want Gmail power features.
            </p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <PriceCard
              highlight={false}
              name={PRICING.pro.name}
              price={PRICING.pro.price}
              suffix={PRICING.pro.suffix}
              liftOnHover={liftOnHover}
              desc="For producers who want full tracking + organization."
              bullets={[
                "Library (upload, tags, packs)",
                "Tracked links + public pages",
                "Tracking: open, click, play, download",
                "CRM basics + timelines",
                "Campaign sending with safety limits",
              ]}
              cta="Get Pro in beta"
              onCta={() => scrollToId("beta")}
            />
            <PriceCard
              highlight
              name={PRICING.ultra.name}
              price={PRICING.ultra.price}
              suffix={PRICING.ultra.suffix}
              liftOnHover={liftOnHover}
              desc="For producers who want automation + Gmail edge."
              bullets={[
                "Everything in Pro",
                "Chrome Gmail extension features",
                "Unlimited tracking for individual sends via extension",
                "Advanced analytics + insights",
                "Priority features and early access",
              ]}
              cta="Get Ultra in beta"
              onCta={() => scrollToId("beta")}
              topBadge="Best for power users"
            />
          </div>

          <div className="mt-4 text-center text-xs text-slate-500">
            Beta pricing may be locked for early users.
          </div>
        </motion.section>

        {/* BETA FORM */}
        <motion.section
          id="beta"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={sectionVariants}
          className="mt-16"
        >
          <div className="rounded-3xl border border-slate-800 bg-white/[0.03] p-6 sm:p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                  Join the private beta
                </div>
                <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">
                  Stop sending into the void.
                </h2>
                <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-400 leading-relaxed">
                  We’re onboarding a small group first so we can make vvault perfect for real producers.
                  Drop your email and you’ll get access as soon as your spot opens.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {badge}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500"
                  >
                    Your email
                  </label>
                  <div className="group flex items-center gap-2 rounded-2xl border border-slate-800 bg-[#0A0A10] px-3 py-3 transition focus-within:border-slate-600 focus-within:ring-1 focus-within:ring-slate-500/40">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="address@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={cx(
                    "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold border shadow-sm transition active:scale-[0.99]",
                    "bg-white text-slate-900 border-slate-200 hover:bg-white/95 hover:shadow-md",
                    "disabled:opacity-60 disabled:cursor-not-allowed"
                  )}
                >
                  {isLoading ? "Joining..." : "Join beta"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 border border-slate-800 bg-white/[0.02]">
                  <Timer className="h-4 w-4" />
                  takes 2 minutes
                </span>
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 border border-slate-800 bg-white/[0.02]">
                  <Shield className="h-4 w-4" />
                  no spam
                </span>
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 border border-slate-800 bg-white/[0.02]">
                  <Sparkles className="h-4 w-4" />
                  early users may lock pricing
                </span>
              </div>

              {message && (
                <motion.p
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cx(
                    "mt-4 text-sm text-center",
                    status === "success" ? "text-lime-300" : "text-red-400"
                  )}
                >
                  {message}
                </motion.p>
              )}
            </form>
          </div>
        </motion.section>

        {/* FAQ */}
        <motion.section
          id="faq"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={sectionVariants}
          className="mt-16"
        >
          <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
            FAQ
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">
            Questions
          </h2>

          <div className="mt-6 grid gap-3">
            <FaqItem
              id="gmail"
              openId={faqOpen}
              setOpenId={setFaqOpen}
              q="Does it work with Gmail?"
              a="Yes. You can send campaigns with safe limits, and the Ultra plan adds Gmail Chrome features."
            />
            <FaqItem
              id="deliverability"
              openId={faqOpen}
              setOpenId={setFaqOpen}
              q="Will this hurt my deliverability?"
              a="vvault uses daily safety limits and clean sending patterns to keep things safe."
            />
            <FaqItem
              id="packs"
              openId={faqOpen}
              setOpenId={setFaqOpen}
              q="Can I send packs too?"
              a="Yes. Beats and packs both get tracked links and public pages."
            />
            <FaqItem
              id="secure"
              openId={faqOpen}
              setOpenId={setFaqOpen}
              q="Do you host the files securely?"
              a="Yes. Downloads are served through vvault so you’re not exposing raw bucket links."
            />
            <FaqItem
              id="beatstars"
              openId={faqOpen}
              setOpenId={setFaqOpen}
              q="Is this BeatStars?"
              a="No. vvault focuses on sending + tracking + follow-ups so you know who’s serious."
            />
          </div>

          <div className="mt-10 flex justify-center">
            <button
              onClick={() => scrollToId("beta")}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-slate-900 px-5 py-3 text-sm font-semibold border border-slate-200 shadow-sm transition hover:bg-white/95 hover:shadow-md active:scale-[0.99]"
            >
              Join the private beta
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.section>

        {/* FOOTER */}
        <footer className="mt-16 border-t border-slate-900/70 pt-8 text-center text-xs text-slate-600">
          <div className="flex flex-wrap justify-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 border border-slate-800 bg-white/[0.02]">
              <Check className="h-4 w-4 text-lime-300" />
              store
            </span>
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 border border-slate-800 bg-white/[0.02]">
              <Check className="h-4 w-4 text-lime-300" />
              send
            </span>
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 border border-slate-800 bg-white/[0.02]">
              <Check className="h-4 w-4 text-lime-300" />
              track
            </span>
          </div>
          <div className="mt-4">© {new Date().getFullYear()} vvault</div>
        </footer>
      </div>

      {/* VIDEO MODAL */}
      <AnimatePresence>
        {videoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onMouseDown={closeVideo}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            <motion.div
              initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.98, y: prefersReducedMotion ? 0 : 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.98, y: prefersReducedMotion ? 0 : 6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-800 bg-[#07070D] shadow-2xl"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                <div className="text-sm font-medium text-slate-200">vvault demo</div>
                <button
                  onClick={closeVideo}
                  className="rounded-xl border border-slate-800 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/[0.06] hover:border-slate-700"
                >
                  Close
                </button>
              </div>

              <div className="relative aspect-video w-full bg-black">
                {!VIDEO_EMBED_URL ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
                      <Lock className="h-4 w-4" />
                      Add your embed URL in <span className="text-slate-200 font-medium">VIDEO_EMBED_URL</span>
                    </div>
                    <div className="text-sm text-slate-400 max-w-md">
                      When you have the video, paste the embed link and the modal will auto-load it only after click.
                    </div>
                  </div>
                ) : (
                  <>
                    {!videoLoaded ? (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                        Loading...
                      </div>
                    ) : (
                      <iframe
                        className="absolute inset-0 h-full w-full"
                        src={VIDEO_EMBED_URL}
                        title="vvault demo video"
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* --------------------------- small components --------------------------- */

function NavLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.04] hover:text-slate-100"
    >
      {label}
    </button>
  );
}

function FeatureRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="group flex items-start gap-3 rounded-2xl border border-slate-800 bg-white/[0.02] p-3 transition hover:bg-white/[0.04] hover:border-slate-700">
      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-white/[0.02] text-slate-200 transition group-hover:border-slate-700">
        {icon}
      </div>
      <div className="text-sm text-slate-300 leading-relaxed">{text}</div>
    </div>
  );
}

function MiniPrice({ name, price, suffix }: { name: string; price: string; suffix: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-white/[0.02] p-4 transition hover:border-slate-700 hover:bg-white/[0.04]">
      <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">{name}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-2xl font-semibold text-slate-100">{price}</div>
        <div className="text-xs text-slate-500">{suffix}</div>
      </div>
    </div>
  );
}

function VideoPreview({ onClick, hasVideo }: { onClick: () => void; hasVideo: boolean }) {
  return (
    <button
      onClick={onClick}
      className="group mt-6 block w-full overflow-hidden rounded-3xl border border-slate-800 bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] transition hover:border-slate-700 hover:bg-white/[0.04] active:scale-[0.997]"
      aria-label="Play demo video"
    >
      <div className="relative aspect-video w-full">
        <div className="absolute inset-0 bg-[radial-gradient(900px_420px_at_50%_0%,rgba(163,230,53,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.15),rgba(0,0,0,0.65))]" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-700 bg-white/[0.06] shadow-lg transition group-hover:scale-[1.03] group-hover:bg-white/[0.08]">
              <Play className="h-7 w-7 text-lime-200" />
            </div>
            <div className="text-sm font-medium text-slate-200">
              {hasVideo ? "Play the demo" : "Video placeholder (click to open)"}
            </div>
            <div className="text-xs text-slate-500">
              {hasVideo ? "Opens in a clean modal" : "Add VIDEO_EMBED_URL later"}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-800 px-4 py-3 text-[11px] text-slate-500">
        <span className="rounded-full border border-slate-800 bg-white/[0.02] px-3 py-1">Know who’s warm</span>
        <span className="rounded-full border border-slate-800 bg-white/[0.02] px-3 py-1">Follow up at the right time</span>
        <span className="rounded-full border border-slate-800 bg-white/[0.02] px-3 py-1">Keep everything organized</span>
      </div>
    </button>
  );
}

function KpiPill({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-white/[0.02] p-4 transition hover:bg-white/[0.04] hover:border-slate-700">
      <div className="text-sm font-semibold text-slate-200">{title}</div>
      <div className="mt-1 text-xs text-slate-500">{desc}</div>
    </div>
  );
}

function FeatureCard({
  title,
  icon,
  items,
  badge,
  liftOnHover,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  badge?: string;
  liftOnHover?: boolean;
}) {
  return (
    <motion.div
      whileHover={liftOnHover ? { y: -2 } : undefined}
      transition={liftOnHover ? { duration: 0.18, ease: "easeOut" } : undefined}
      className="group rounded-3xl border border-slate-800 bg-white/[0.03] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] transition hover:border-slate-700 hover:bg-white/[0.04]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-800 bg-white/[0.02] transition group-hover:border-slate-700">
            {icon}
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-100">{title}</div>
            {badge ? (
              <div className="mt-1 inline-flex items-center rounded-full border border-slate-800 bg-white/[0.02] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                {badge}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <ul className="mt-5 space-y-2">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-3 text-sm text-slate-300">
            <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-800 bg-white/[0.02]">
              <Check className="h-3.5 w-3.5 text-lime-300" />
            </span>
            <span className="leading-relaxed">{it}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function StepCard({
  step,
  title,
  desc,
  icon,
  liftOnHover,
}: {
  step: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  liftOnHover?: boolean;
}) {
  return (
    <motion.div
      whileHover={liftOnHover ? { y: -2 } : undefined}
      transition={liftOnHover ? { duration: 0.18, ease: "easeOut" } : undefined}
      className="group rounded-3xl border border-slate-800 bg-white/[0.03] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] transition hover:border-slate-700 hover:bg-white/[0.04]"
    >
      <div className="flex items-start justify-between">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
          {step}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-800 bg-white/[0.02] text-slate-200 transition group-hover:border-slate-700">
          {icon}
        </div>
      </div>

      <div className="mt-4 text-lg font-semibold text-slate-100">{title}</div>
      <div className="mt-2 text-sm text-slate-400 leading-relaxed">{desc}</div>
    </motion.div>
  );
}

function PriceCard({
  highlight,
  name,
  price,
  suffix,
  desc,
  bullets,
  cta,
  onCta,
  topBadge,
  liftOnHover,
}: {
  highlight: boolean;
  name: string;
  price: string;
  suffix: string;
  desc: string;
  bullets: string[];
  cta: string;
  onCta: () => void;
  topBadge?: string;
  liftOnHover?: boolean;
}) {
  return (
    <motion.div
      whileHover={liftOnHover ? { y: -2 } : undefined}
      transition={liftOnHover ? { duration: 0.18, ease: "easeOut" } : undefined}
      className={cx(
        "relative overflow-hidden rounded-3xl border p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] transition",
        highlight
          ? "border-lime-400/35 bg-[linear-gradient(to_bottom,rgba(163,230,53,0.08),rgba(255,255,255,0.03))] hover:border-lime-400/55"
          : "border-slate-800 bg-white/[0.03] hover:border-slate-700 hover:bg-white/[0.04]"
      )}
    >
      {highlight ? (
        <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-lime-400/12 blur-3xl" />
      ) : null}

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-slate-100">{name}</div>
            {topBadge ? (
              <div className="mt-2 inline-flex items-center rounded-full border border-lime-400/35 bg-lime-400/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-lime-200">
                {topBadge}
              </div>
            ) : null}
            <div className="mt-3 flex items-baseline gap-2">
              <div className="text-4xl font-semibold tracking-tight text-slate-100">{price}</div>
              <div className="text-sm text-slate-500">{suffix}</div>
            </div>
            <div className="mt-2 text-sm text-slate-400">{desc}</div>
          </div>
        </div>

        <ul className="mt-5 space-y-2">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-3 text-sm text-slate-300">
              <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-800 bg-white/[0.02]">
                <Check className="h-3.5 w-3.5 text-lime-300" />
              </span>
              <span className="leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={onCta}
          className={cx(
            "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold border shadow-sm transition active:scale-[0.99]",
            highlight
              ? "bg-white text-slate-900 border-slate-200 hover:bg-white/95 hover:shadow-md"
              : "bg-white/[0.03] text-slate-100 border-slate-800 hover:bg-white/[0.06] hover:border-slate-700"
          )}
        >
          {cta}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

function FaqItem({
  id,
  openId,
  setOpenId,
  q,
  a,
}: {
  id: string;
  openId: string | null;
  setOpenId: (v: string | null) => void;
  q: string;
  a: string;
}) {
  const isOpen = openId === id;

  return (
    <div className="rounded-3xl border border-slate-800 bg-white/[0.03] shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] overflow-hidden">
      <button
        onClick={() => setOpenId(isOpen ? null : id)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/[0.03]"
      >
        <div className="text-sm sm:text-base font-medium text-slate-200">{q}</div>
        <ChevronDown
          className={cx(
            "h-5 w-5 text-slate-500 transition",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
