"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Locale } from "@/lib/useLocale";

type AuthUser = { id: string; email: string | null };

type Profile = {
  id: string;
  name: string | null;
  picture: string | null;
  handle: string | null;
};

const COPY = {
  en: {
    login: "Login",
    signedInAs: "Signed in as",
    signout: "Sign out",
    viewVvault: "Open my VVault",
    google: "Continue with Google",
    or: "or",
    emailPlaceholder: "you@email.com",
    magicLinkCta: "Email me a magic link",
    magicLinkSent: (email: string) => `Link sent to ${email}. Check your inbox.`,
    sending: "Sending…",
    enterEmail: "Enter your email first.",
  },
  fr: {
    login: "Connexion",
    signedInAs: "Connecté en tant que",
    signout: "Se déconnecter",
    viewVvault: "Ouvrir mon VVault",
    google: "Continuer avec Google",
    or: "ou",
    emailPlaceholder: "toi@email.com",
    magicLinkCta: "Recevoir un lien magique",
    magicLinkSent: (email: string) => `Lien envoyé à ${email}. Vérifie tes mails.`,
    sending: "Envoi…",
    enterEmail: "Entre d'abord ton email.",
  },
};

export function AuthHeaderButton({ locale = "en" }: { locale?: Locale }) {
  const t = COPY[locale === "fr" ? "fr" : "en"];

  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [pending, start] = useTransition();
  const [magicSentTo, setMagicSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      const u = data.user;
      setUser(u ? { id: u.id, email: u.email ?? null } : null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user;
      setUser(u ? { id: u.id, email: u.email ?? null } : null);
      setReady(true);
    });
    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    let cancel = false;
    supabase
      .from("profiles")
      .select("id, name, picture, handle")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancel || !data) return;
        setProfile(data as Profile);
      });
    return () => {
      cancel = true;
    };
  }, [user]);

  useEffect(() => {
    if (!open) return;
    function onMouse(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onMouse);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onMouse);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function withGoogle() {
    setError(null);
    const { error: e } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href },
    });
    if (e) setError(e.message);
  }

  function sendMagic() {
    if (!email) {
      setError(t.enterEmail);
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

  async function signOut() {
    await supabase.auth.signOut();
    setOpen(false);
    setProfile(null);
    setMagicSentTo(null);
    setEmail("");
  }

  // Avoid an SSR-hydration flash where the wrong button renders before
  // we know the auth state. Keep the slot reserved instead.
  if (!ready) {
    return <div className="h-9 w-[88px] rounded-full bg-white/[0.04]" aria-hidden />;
  }

  const displayName =
    profile?.name?.trim() ||
    profile?.handle?.trim() ||
    (user?.email ? user.email.split("@")[0] : "");
  const handleTag = profile?.handle?.trim() || null;
  const avatarSrc = profile?.picture || null;

  return (
    <div ref={rootRef} className="relative">
      {user ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="inline-flex h-9 max-w-[180px] items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] py-1 pr-2.5 pl-1 text-[13px] font-medium text-white/85 transition hover:bg-white/[0.06]"
        >
          <Avatar src={avatarSrc} name={displayName} size={26} />
          <span className="hidden truncate sm:inline">{displayName}</span>
          <ChevronIcon open={open} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="inline-flex h-9 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.03] px-4 text-[13px] font-semibold text-white transition hover:bg-white/[0.07]"
        >
          {t.login}
        </button>
      )}

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-[280px] origin-top-right rounded-2xl border border-white/[0.08] bg-black/95 p-3 shadow-2xl shadow-black/50 backdrop-blur-xl">
          {user ? (
            <>
              <div className="flex items-start gap-3 px-1.5 pt-1 pb-3">
                <Avatar src={avatarSrc} name={displayName} size={38} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-semibold text-white">
                    {displayName}
                  </div>
                  {handleTag ? (
                    <div className="truncate text-[12px] text-sky-300/85">
                      @{handleTag}
                    </div>
                  ) : null}
                  {user.email ? (
                    <div className="truncate text-[11.5px] text-white/45">
                      {user.email}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="h-px bg-white/[0.06]" />
              {handleTag ? (
                <a
                  href={`https://vvault.app/${handleTag}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 flex h-9 w-full items-center justify-center rounded-xl px-3 text-[13px] text-white/85 transition hover:bg-white/[0.05]"
                >
                  {t.viewVvault}
                </a>
              ) : null}
              <button
                type="button"
                onClick={signOut}
                className="mt-0.5 flex h-9 w-full items-center justify-center rounded-xl px-3 text-[13px] text-white/80 transition hover:bg-white/[0.05]"
              >
                {t.signout}
              </button>
            </>
          ) : magicSentTo ? (
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/5 px-3 py-2.5 text-[12.5px] text-emerald-200">
              {t.magicLinkSent(magicSentTo)}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={withGoogle}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-white px-4 text-[13px] font-semibold text-black transition hover:bg-white/90"
              >
                <GoogleIcon />
                {t.google}
              </button>
              <div className="flex items-center gap-2 py-0.5 text-[12px] text-white/55">
                <span className="h-px flex-1 bg-white/[0.07]" />
                {t.or}
                <span className="h-px flex-1 bg-white/[0.07]" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="h-10 w-full rounded-full border border-white/[0.1] bg-black/40 px-3.5 text-[13px] text-white placeholder-white/35 outline-none focus:border-sky-400/60"
              />
              <button
                type="button"
                onClick={sendMagic}
                disabled={pending}
                className="inline-flex h-10 items-center justify-center rounded-full bg-sky-400 px-4 text-[13px] font-semibold text-black transition hover:bg-sky-300 disabled:opacity-50"
              >
                {pending ? t.sending : t.magicLinkCta}
              </button>
              {error ? (
                <p className="px-1 text-[11.5px] text-rose-300">{error}</p>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function Avatar({
  src,
  name,
  size,
}: {
  src: string | null;
  name: string;
  size: number;
}) {
  const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-sky-400/20 font-semibold text-sky-200"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.45) }}
    >
      {initial}
    </span>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 text-white/55 transition-transform ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 18 18" aria-hidden>
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
