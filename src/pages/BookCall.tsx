import { useEffect, useRef, useState } from "react";
import { LandingNav } from "@/components/landing/LandingNav";
import { supabase } from "@/integrations/supabase/client";

type Phase = "form" | "calendar";

type IntakeState = {
  fullName: string;
  workEmail: string;
  setterCount: string;
  monthlyConversationVolume: string;
  currentChallenge: string;
  phone: string;
  instagramHandle: string;
};

const SETTER_COUNT_OPTIONS = ["No setters yet", "1 setter", "2-3 setters", "4-6 setters", "7+ setters"];

const CONVERSATION_VOLUME_OPTIONS = [
  "Under 300 per month",
  "300-1,000 per month",
  "1,000-2,500 per month",
  "2,500+ per month",
];

const INPUT_CLASS =
  "h-11 w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 text-sm text-white/86 outline-none transition-colors placeholder:text-white/30 focus:border-white/28";

const SELECT_CLASS =
  "book-call-select h-11 w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 text-sm text-white/86 outline-none transition-colors focus:border-white/28";

const TEXTAREA_CLASS =
  "min-h-[116px] w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-sm text-white/86 outline-none transition-colors placeholder:text-white/30 focus:border-white/28";

function getOrCreateDemoSessionKey(): string {
  const key = "integrity_demo_session";
  try {
    const existing = window.localStorage.getItem(key);
    if (existing && existing.length > 12) return existing;
  } catch {
    // Ignore localStorage failures.
  }

  const next =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `demo-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  try {
    window.localStorage.setItem(key, next);
  } catch {
    // Ignore localStorage failures.
  }

  return next;
}

function loadCalendlyWidgetScript(): Promise<void> {
  const existing = document.querySelector<HTMLScriptElement>("script[data-calendly-widget='1']");
  if (existing) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    script.dataset.calendlyWidget = "1";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Calendly widget"));
    document.head.appendChild(script);
  });
}

export default function BookCall() {
  const [phase, setPhase] = useState<Phase>("form");
  const [sessionKey] = useState(() => getOrCreateDemoSessionKey());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intake, setIntake] = useState<IntakeState>({
    fullName: "",
    workEmail: "",
    setterCount: "",
    monthlyConversationVolume: "",
    currentChallenge: "",
    phone: "",
    instagramHandle: "",
  });

  const calendarViewLoggedRef = useRef(false);

  const persistEvent = async (stage: string, payload: Record<string, unknown>) => {
    const sb = supabase as any;
    const { error: insertError } = await sb.from("landing_demo_intake_events").insert([
      {
        session_key: sessionKey,
        stage,
        payload,
      },
    ]);

    if (insertError) throw insertError;
  };

  const handleContinueToCalendar = async () => {
    setError(null);

    if (!intake.fullName.trim() || !intake.workEmail.trim() || !intake.setterCount || !intake.currentChallenge.trim()) {
      setError("Fill full name, work email, setter count, and your current challenge before continuing.");
      return;
    }

    try {
      setSaving(true);

      await Promise.all([
        persistEvent("qualification", {
          setterCount: intake.setterCount,
          monthlyConversationVolume: intake.monthlyConversationVolume,
          currentChallenge: intake.currentChallenge,
        }),
        persistEvent("contact", {
          fullName: intake.fullName,
          workEmail: intake.workEmail,
          phone: intake.phone,
          instagramHandle: intake.instagramHandle,
        }),
      ]);

      setPhase("calendar");
    } catch (persistError: any) {
      setError(persistError?.message || "Could not save your information. Please retry.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    document.title = "Book a Demo | Integrity";
  }, []);

  useEffect(() => {
    if (phase !== "calendar") return;

    let cancelled = false;

    const initializeCalendar = async () => {
      await loadCalendlyWidgetScript();
      if (cancelled || calendarViewLoggedRef.current) return;
      calendarViewLoggedRef.current = true;

      await persistEvent("calendar_view", {
        viewedAt: new Date().toISOString(),
      });
    };

    const onMessage = async (event: MessageEvent) => {
      const eventName = typeof event?.data?.event === "string" ? event.data.event : "";
      if (eventName !== "calendly.event_scheduled") return;

      try {
        await persistEvent("calendar_scheduled", {
          scheduledAt: new Date().toISOString(),
          calendly: event.data,
        });
      } catch {
        // Tracking errors should not block booking completion.
      }
    };

    initializeCalendar().catch((calendarError: any) => {
      if (!cancelled) {
        setError(calendarError?.message || "Calendly failed to load. Refresh and try again.");
      }
    });

    window.addEventListener("message", onMessage);
    return () => {
      cancelled = true;
      window.removeEventListener("message", onMessage);
    };
  }, [phase]);

  return (
    <div className="landing-root min-h-screen bg-[#080808] font-sans text-[#f0f0f0]">
      <LandingNav />

      <main className="pb-24 pt-34 sm:pb-28 sm:pt-32">
        <section className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
          {phase === "form" ? (
            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.04fr)] lg:gap-10">
              <div className="pt-1">
                <h1 className="font-display text-[1.95rem] leading-[1] text-white sm:text-[2.4rem]">Book a strategy call</h1>

                <ul className="mt-7 space-y-3.5 text-base text-white/85">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/24 text-[10px] text-white/84">
                      ✓
                    </span>
                    <span>See where your current inbox flow is leaking qualified leads.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/24 text-[10px] text-white/84">
                      ✓
                    </span>
                    <span>Map the fastest path to consistent setter execution.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/24 text-[10px] text-white/84">
                      ✓
                    </span>
                    <span>Leave with a practical rollout plan based on your volume.</span>
                  </li>
                </ul>

                <div className="mt-12 border-t border-white/10 pt-7">
                  <p className="text-base text-white/34">Need product help before booking?</p>
                  <a
                    href="mailto:support@theacq.app"
                    className="mt-2.5 inline-flex items-center gap-2 text-base text-white/34 transition-colors duration-200 hover:text-white/56"
                  >
                    Contact support
                    <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>

              <div className="overflow-hidden rounded-[16px] border border-white/10 bg-transparent">
                <div className="border-b border-white/10 px-5 py-3.5 text-base text-white/86">Tell us where you need leverage</div>

                <div className="px-5 py-5">
                  {error ? (
                    <div className="mb-5 rounded-xl border border-[#ff6f6f]/35 bg-[#2a1010]/45 px-4 py-3 text-sm text-[#ffc6c6]">
                      {error}
                    </div>
                  ) : null}

                  <div className="space-y-5">
                    <label className="grid gap-2">
                      <span className="text-sm text-white/34">Full name</span>
                      <input
                        value={intake.fullName}
                        onChange={(event) => setIntake((prev) => ({ ...prev, fullName: event.target.value }))}
                        placeholder="Your name"
                        className={INPUT_CLASS}
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm text-white/34">Work email</span>
                      <input
                        type="email"
                        value={intake.workEmail}
                        onChange={(event) => setIntake((prev) => ({ ...prev, workEmail: event.target.value }))}
                        placeholder="you@company.com"
                        className={INPUT_CLASS}
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm text-white/34">How many setters do you have?</span>
                      <select
                        value={intake.setterCount}
                        onChange={(event) => setIntake((prev) => ({ ...prev, setterCount: event.target.value }))}
                        className={SELECT_CLASS}
                      >
                        <option value="" className="bg-[#080808] text-white/70">
                          Select team size
                        </option>
                        {SETTER_COUNT_OPTIONS.map((option) => (
                          <option key={option} value={option} className="bg-[#080808] text-white">
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm text-white/34">Monthly conversation volume (optional)</span>
                      <select
                        value={intake.monthlyConversationVolume}
                        onChange={(event) =>
                          setIntake((prev) => ({ ...prev, monthlyConversationVolume: event.target.value }))
                        }
                        className={SELECT_CLASS}
                      >
                        <option value="" className="bg-[#080808] text-white/70">
                          Select volume
                        </option>
                        {CONVERSATION_VOLUME_OPTIONS.map((option) => (
                          <option key={option} value={option} className="bg-[#080808] text-white">
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm text-white/34">What should we solve first?</span>
                      <textarea
                        value={intake.currentChallenge}
                        onChange={(event) => setIntake((prev) => ({ ...prev, currentChallenge: event.target.value }))}
                        placeholder="Describe your current process, bottlenecks, and what outcome you want from this call."
                        className={TEXTAREA_CLASS}
                      />
                    </label>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <label className="grid gap-2">
                        <span className="text-sm text-white/34">Phone (optional)</span>
                        <input
                          value={intake.phone}
                          onChange={(event) => setIntake((prev) => ({ ...prev, phone: event.target.value }))}
                          placeholder="+1 000 000 0000"
                          className={INPUT_CLASS}
                        />
                      </label>

                      <label className="grid gap-2">
                        <span className="text-sm text-white/34">Instagram handle (optional)</span>
                        <input
                          value={intake.instagramHandle}
                          onChange={(event) => setIntake((prev) => ({ ...prev, instagramHandle: event.target.value }))}
                          placeholder="@youraccount"
                          className={INPUT_CLASS}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-white/36">Prefer email? support@theacq.app</p>
                    <button
                      type="button"
                      onClick={handleContinueToCalendar}
                      disabled={saving}
                      className="inline-flex items-center bg-white px-5 py-2.5 text-sm font-semibold text-black rounded-none transition-[border-radius,background-color] duration-200 hover:rounded-md hover:bg-white/95 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {saving ? "Saving..." : "Continue to calendar"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-[1040px] rounded-[20px] border border-white/10 bg-transparent p-5 sm:p-7">
              {error ? (
                <div className="mb-5 rounded-xl border border-[#ff6f6f]/35 bg-[#2a1010]/45 px-4 py-3 text-sm text-[#ffc6c6]">
                  {error}
                </div>
              ) : null}

              <h2 className="font-display text-[1.7rem] leading-[1.02] text-white sm:text-[2.2rem]">Choose a time</h2>
              <p className="mt-3 text-sm leading-7 text-white/58 sm:text-base">
                Pick a slot below. We already captured your intake details and will tailor the session before the call.
              </p>

              <div className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-white">
                <div
                  className="calendly-inline-widget"
                  data-url="https://calendly.com/edwardsens-contact/30min"
                  style={{ minWidth: 320, height: 700 }}
                />
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
