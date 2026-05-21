"use client";

import { useState, useTransition } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { TournamentCopy } from "./copy";

type Mode = "choose" | "email-password" | "magic-link";

export function ConnectVvault({ copy }: { copy: TournamentCopy }) {
  const [mode, setMode] = useState<Mode>("choose");
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [magicSentTo, setMagicSentTo] = useState<string | null>(null);

  async function withGoogle() {
    setError(null);
    const { error: e } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href },
    });
    if (e) setError(e.message);
  }

  function submitPassword() {
    if (!email || !password) {
      setError("Email et mot de passe requis.");
      return;
    }
    setError(null);
    start(async () => {
      const fn = isSignup
        ? supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.href },
          })
        : supabase.auth.signInWithPassword({ email, password });
      const { error: e } = await fn;
      if (e) setError(e.message);
    });
  }

  function sendMagic() {
    if (!email) {
      setError(copy.auth.emailLabel + " ?");
      return;
    }
    setError(null);
    start(async () => {
      const { error: e } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.href },
      });
      if (e) {
        setError(e.message);
        return;
      }
      setMagicSentTo(email);
    });
  }

  if (magicSentTo) {
    return (
      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/5 px-5 py-4 text-[14px] text-emerald-200">
        {copy.auth.magicLinkSent(magicSentTo)}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[15px] font-semibold text-white">{copy.auth.connectTitle}</h3>

      <button
        type="button"
        onClick={withGoogle}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-[14px] font-semibold text-black transition hover:bg-white/90"
      >
        <GoogleIcon />
        {copy.auth.google}
      </button>

      <Divider label={copy.auth.orDivider} />

      <label className="block">
        <span className="text-[13px] font-medium text-white/85">
          {copy.auth.emailLabel}
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={copy.auth.emailPlaceholder}
          className="mt-1.5 h-11 w-full rounded-2xl border border-white/[0.1] bg-black/40 px-4 text-[14.5px] text-white placeholder-white/35 outline-none focus:border-sky-400/60"
        />
      </label>

      {mode === "email-password" ? (
        <label className="block">
          <span className="text-[13px] font-medium text-white/85">
            {copy.auth.passwordLabel}
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={copy.auth.passwordPlaceholder}
            className="mt-1.5 h-11 w-full rounded-2xl border border-white/[0.1] bg-black/40 px-4 text-[14.5px] text-white placeholder-white/35 outline-none focus:border-sky-400/60"
          />
        </label>
      ) : null}

      {mode === "email-password" ? (
        <>
          <button
            type="button"
            onClick={submitPassword}
            disabled={pending}
            className="inline-flex h-11 items-center justify-center rounded-full bg-sky-400 px-5 text-[14px] font-semibold text-black transition hover:bg-sky-300 disabled:opacity-50"
          >
            {pending ? copy.auth.sending : isSignup ? copy.auth.signupCta : copy.auth.signinCta}
          </button>
          <div className="flex flex-wrap items-center justify-between gap-2 text-[12.5px] text-white/55">
            <button
              type="button"
              onClick={() => setIsSignup((v) => !v)}
              className="underline-offset-2 hover:underline"
            >
              {isSignup ? copy.auth.toggleToSignin : copy.auth.toggleToSignup}
            </button>
            <button
              type="button"
              onClick={() => setMode("magic-link")}
              className="underline-offset-2 hover:underline"
            >
              {copy.auth.magicLinkCta} →
            </button>
          </div>
        </>
      ) : mode === "magic-link" ? (
        <>
          <button
            type="button"
            onClick={sendMagic}
            disabled={pending}
            className="inline-flex h-11 items-center justify-center rounded-full bg-sky-400 px-5 text-[14px] font-semibold text-black transition hover:bg-sky-300 disabled:opacity-50"
          >
            {pending ? copy.auth.sending : copy.auth.magicLinkCta}
          </button>
          <button
            type="button"
            onClick={() => setMode("email-password")}
            className="text-left text-[12.5px] text-white/55 underline-offset-2 hover:underline"
          >
            ← {copy.auth.signinCta} / {copy.auth.signupCta}
          </button>
        </>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("email-password")}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.025] px-5 text-[13.5px] font-semibold text-white transition hover:bg-white/[0.05]"
          >
            {copy.auth.signinCta}
          </button>
          <button
            type="button"
            onClick={() => setMode("magic-link")}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.025] px-5 text-[13.5px] font-semibold text-white transition hover:bg-white/[0.05]"
          >
            {copy.auth.magicLinkCta}
          </button>
        </div>
      )}

      {error ? <p className="text-[12.5px] text-rose-300">{error}</p> : null}
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-1 text-[12px] text-white/55">
      <span className="h-px flex-1 bg-white/[0.08]" />
      {label}
      <span className="h-px flex-1 bg-white/[0.08]" />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92a8.78 8.78 0 0 0 2.68-6.6z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72A5.41 5.41 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.34l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}
