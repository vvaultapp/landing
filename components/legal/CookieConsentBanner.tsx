'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import {
  CONSENT_UPDATED_EVENT,
  acceptAll,
  applyConsentToTrackers,
  defaultConsent,
  hasUserDecided,
  readConsent,
  rejectAll,
  savePreferences,
  type ConsentState,
} from '@/lib/consent';

type View = 'banner' | 'preferences';

export default function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<ConsentState>(() => defaultConsent());
  const [view, setView] = useState<View>('banner');
  const [analyticsChecked, setAnalyticsChecked] = useState(false);
  const [marketingChecked, setMarketingChecked] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Hydrate after mount so SSR markup matches CSR (banner shouldn't appear
  // on the server because we don't know the user's choice).
  useEffect(() => {
    const next = readConsent();
    setState(next);
    setAnalyticsChecked(next.analytics);
    setMarketingChecked(next.marketing);
    // Default-deny stance: push 'denied' to GA Consent Mode + Meta Pixel
    // immediately on every load until the user decides.
    applyConsentToTrackers(next);
    setMounted(true);

    const onUpdated = (event: Event) => {
      const ce = event as CustomEvent<ConsentState>;
      if (ce.detail) {
        setState(ce.detail);
        setAnalyticsChecked(ce.detail.analytics);
        setMarketingChecked(ce.detail.marketing);
      }
    };
    window.addEventListener(CONSENT_UPDATED_EVENT, onUpdated);

    // Allow the footer link "Cookie preferences" to open the modal again
    // after the initial decision.
    const onOpenPrefs = () => {
      setView('preferences');
    };
    window.addEventListener('vvault:open-cookie-preferences', onOpenPrefs);

    return () => {
      window.removeEventListener(CONSENT_UPDATED_EVENT, onUpdated);
      window.removeEventListener('vvault:open-cookie-preferences', onOpenPrefs);
    };
  }, []);

  // ResizeObserver: keeps a CSS variable in sync with the live banner
  // height so globals.css can pad the body and effectively "push the
  // whole site up" — content stays scrollable, never hidden behind it.
  useEffect(() => {
    if (!mounted) return;
    const el = containerRef.current;
    if (!el) return;

    const setVar = () => {
      const h = el.getBoundingClientRect().height;
      document.documentElement.style.setProperty(
        '--vv-cookie-banner-height',
        `${Math.max(0, Math.round(h))}px`,
      );
    };

    setVar();
    const ro = new ResizeObserver(setVar);
    ro.observe(el);
    window.addEventListener('resize', setVar);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', setVar);
      document.documentElement.style.removeProperty('--vv-cookie-banner-height');
    };
  }, [mounted, view, state]);

  if (!mounted) return null;

  const userDecided = hasUserDecided(state);
  // Hide unless the user hasn't decided yet OR they re-opened preferences.
  if (userDecided && view === 'banner') return null;

  const handleAcceptAll = () => {
    acceptAll();
    setView('banner');
  };
  const handleRejectAll = () => {
    rejectAll();
    setView('banner');
  };
  const handleSavePrefs = () => {
    savePreferences({ analytics: analyticsChecked, marketing: marketingChecked });
    setView('banner');
  };

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Cookie preferences"
      className="fixed inset-x-0 bottom-0 z-[1000] border-t border-white/[0.08] bg-[#111114] text-white shadow-[0_-12px_40px_rgba(0,0,0,0.6)]"
    >
      {/* Top-right dismiss — clicking it counts as a "reject non-essential"
          choice (CNIL: closing without choosing is not implicit consent). */}
      <button
        type="button"
        aria-label="Reject non-essential cookies and close"
        onClick={handleRejectAll}
        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md text-white/50 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="mx-auto w-full max-w-[1400px] px-5 py-2.5 sm:px-8 sm:py-3">
        {view === 'banner' ? (
          <BannerView
            onAcceptAll={handleAcceptAll}
            onRejectAll={handleRejectAll}
            onCustomize={() => setView('preferences')}
          />
        ) : (
          <PreferencesView
            analytics={analyticsChecked}
            marketing={marketingChecked}
            onChangeAnalytics={setAnalyticsChecked}
            onChangeMarketing={setMarketingChecked}
            onAcceptAll={handleAcceptAll}
            onRejectAll={handleRejectAll}
            onSave={handleSavePrefs}
            onClose={() => userDecided && setView('banner')}
            allowClose={userDecided}
          />
        )}
      </div>
    </div>
  );
}

function BannerView({
  onAcceptAll,
  onRejectAll,
  onCustomize,
}: {
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onCustomize: () => void;
}) {
  return (
    <div className="flex flex-col gap-2.5 pr-7 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <p className="min-w-0 text-[12px] leading-snug text-white/70">
        <span className="font-semibold text-white">We use cookies.</span>{' '}
        Cookies help this site function, measure usage, and support marketing.{' '}
        <button
          type="button"
          onClick={onCustomize}
          className="font-medium text-white underline underline-offset-2 hover:text-white"
        >
          Manage
        </button>{' '}
        anytime — see our{' '}
        <Link
          href="/privacy#cookies"
          className="font-medium text-white underline underline-offset-2 hover:text-white"
        >
          cookie policy
        </Link>
        .
      </p>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onRejectAll}
          className="inline-flex h-7 items-center rounded-full border border-white/20 bg-transparent px-3.5 text-[11px] font-semibold text-white transition-colors hover:bg-white/10"
        >
          Reject non-essential
        </button>
        <button
          type="button"
          onClick={onAcceptAll}
          className="inline-flex h-7 items-center rounded-full bg-white px-4 text-[11px] font-semibold text-black transition-colors hover:bg-white/90"
        >
          Accept all
        </button>
      </div>
    </div>
  );
}

function PreferencesView(props: {
  analytics: boolean;
  marketing: boolean;
  onChangeAnalytics: (next: boolean) => void;
  onChangeMarketing: (next: boolean) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onSave: () => void;
  onClose: () => void;
  allowClose: boolean;
}) {
  return (
    <div className="space-y-3 pr-7">
      <div>
        <div className="text-[13px] font-semibold text-white">Cookie preferences</div>
        <p className="mt-0.5 text-[11px] text-white/60">
          Strictly necessary cookies are always on because the site cannot
          function without them.
        </p>
      </div>

      <div className="space-y-1.5">
        <CategoryRow
          title="Strictly necessary"
          description="Authentication, language, security. Cannot be disabled."
          locked
          checked
        />
        <CategoryRow
          title="Analytics"
          description="Helps us understand how the site is used (Google Analytics, Vercel Analytics)."
          checked={props.analytics}
          onChange={props.onChangeAnalytics}
        />
        <CategoryRow
          title="Marketing"
          description="Lets us measure the effectiveness of our ads (Meta Pixel)."
          checked={props.marketing}
          onChange={props.onChangeMarketing}
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={props.onRejectAll}
          className="inline-flex h-7 items-center rounded-full border border-white/20 bg-transparent px-3.5 text-[11px] font-semibold text-white transition-colors hover:bg-white/10"
        >
          Reject non-essential
        </button>
        <button
          type="button"
          onClick={props.onAcceptAll}
          className="inline-flex h-7 items-center rounded-full border border-white/20 bg-transparent px-3.5 text-[11px] font-semibold text-white transition-colors hover:bg-white/10"
        >
          Accept all
        </button>
        <button
          type="button"
          onClick={props.onSave}
          className="inline-flex h-7 items-center rounded-full bg-white px-4 text-[11px] font-semibold text-black transition-colors hover:bg-white/90"
        >
          Save preferences
        </button>
      </div>
    </div>
  );
}

function CategoryRow({
  title,
  description,
  checked,
  locked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  locked?: boolean;
  onChange?: (next: boolean) => void;
}) {
  return (
    <label
      className={`flex items-start justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 ${
        locked ? 'opacity-90' : 'cursor-pointer hover:bg-white/[0.07]'
      }`}
    >
      <div className="min-w-0">
        <div className="text-[12px] font-semibold text-white">{title}</div>
        <div className="mt-0.5 text-[10.5px] text-white/55">{description}</div>
      </div>
      <input
        type="checkbox"
        checked={checked}
        disabled={locked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-white"
      />
    </label>
  );
}
