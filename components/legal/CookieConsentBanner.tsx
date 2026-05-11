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
      {/* Mobile-only dismiss. On mobile the layout is a vertical stack
          (title / body / buttons) so there's no clean horizontal row to
          host the X. Anchor it to the banner's top-right corner instead.
          Hidden on sm+ where the inline X inside BannerView takes over. */}
      {view === 'banner' ? (
        <button
          type="button"
          aria-label="Reject non-essential cookies and close"
          onClick={handleRejectAll}
          className="absolute right-4 top-4 z-[1] inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#111114] text-white transition-colors hover:bg-white/10 sm:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}

      <div className="mx-auto w-full max-w-[1400px] px-6 py-6 sm:px-10 sm:py-7">
        {view === 'banner' ? (
          <BannerView
            onAcceptAll={handleAcceptAll}
            onRejectAll={handleRejectAll}
            onCustomize={() => setView('preferences')}
            onDismiss={handleRejectAll}
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
  onDismiss,
}: {
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onCustomize: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
      <div className="min-w-0 max-w-[760px]">
        <h2 className="text-[15px] font-semibold leading-snug text-white sm:text-base">
          We use cookies
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-white/65 sm:text-[14px]">
          Cookies help this site function, measure usage, and support marketing.
        </p>
        <p className="mt-1 text-[13.5px] leading-relaxed text-white/65 sm:text-[14px]">
          <button
            type="button"
            onClick={onCustomize}
            className="font-medium text-white underline underline-offset-2 hover:text-white"
          >
            Manage
          </button>{' '}
          your cookie preferences anytime. Learn more about our{' '}
          <Link
            href="/privacy#cookies"
            className="font-medium text-white underline underline-offset-2 hover:text-white"
          >
            cookie policy
          </Link>
          .
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2.5 sm:justify-end">
        <button
          type="button"
          onClick={onRejectAll}
          className="inline-flex h-10 items-center rounded-full border border-white/20 bg-transparent px-5 text-[13px] font-medium text-white transition-colors hover:bg-white/10"
        >
          Reject non-essential
        </button>
        <button
          type="button"
          onClick={onAcceptAll}
          className="inline-flex h-10 items-center rounded-full bg-white px-6 text-[13px] font-semibold text-black transition-colors hover:bg-white/90"
        >
          Accept all
        </button>
        {/* Desktop dismiss. Counts as "reject non-essential" per CNIL:
            closing without choosing is not implicit consent. On mobile
            the X lives at the banner's top-right corner instead. */}
        <button
          type="button"
          aria-label="Reject non-essential cookies and close"
          onClick={onDismiss}
          className="ml-1 hidden h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 sm:inline-flex"
        >
          <X className="h-4 w-4" />
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
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0 max-w-[760px]">
          <h2 className="text-[15px] font-semibold leading-snug text-white sm:text-base">
            Cookie preferences
          </h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-white/65 sm:text-[14px]">
            Strictly necessary cookies are always on because the site cannot
            function without them. Toggle the others to your preference.
          </p>
        </div>
        {props.allowClose ? (
          <button
            type="button"
            aria-label="Close preferences"
            onClick={props.onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/55 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
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

      <div className="flex flex-wrap items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={props.onRejectAll}
          className="inline-flex h-10 items-center rounded-full border border-white/20 bg-transparent px-5 text-[13px] font-medium text-white transition-colors hover:bg-white/10"
        >
          Reject non-essential
        </button>
        <button
          type="button"
          onClick={props.onAcceptAll}
          className="inline-flex h-10 items-center rounded-full border border-white/20 bg-transparent px-5 text-[13px] font-medium text-white transition-colors hover:bg-white/10"
        >
          Accept all
        </button>
        <button
          type="button"
          onClick={props.onSave}
          className="inline-flex h-10 items-center rounded-full bg-white px-6 text-[13px] font-semibold text-black transition-colors hover:bg-white/90"
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
  const interactive = !locked;
  return (
    <label
      className={`flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-colors ${
        interactive ? 'cursor-pointer hover:border-white/15 hover:bg-white/[0.06]' : ''
      }`}
    >
      <Checkbox checked={checked} locked={locked} onChange={onChange} />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-white">{title}</span>
          {locked ? (
            <span className="rounded-full bg-white/10 px-1.5 py-px text-[9px] font-medium uppercase tracking-wide text-white/55">
              Always on
            </span>
          ) : null}
        </div>
        <div className="mt-1 text-[12px] leading-relaxed text-white/55">
          {description}
        </div>
      </div>
    </label>
  );
}

function Checkbox({
  checked,
  locked,
  onChange,
}: {
  checked: boolean;
  locked?: boolean;
  onChange?: (next: boolean) => void;
}) {
  return (
    <span
      role="checkbox"
      aria-checked={checked}
      aria-disabled={locked ? true : undefined}
      tabIndex={locked ? -1 : 0}
      onKeyDown={(e) => {
        if (locked) return;
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onChange?.(!checked);
        }
      }}
      onClick={(e) => {
        if (locked) {
          e.preventDefault();
          return;
        }
      }}
      className={`relative mt-0.5 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition-colors ${
        checked
          ? 'border-white bg-white'
          : 'border-white/30 bg-transparent'
      } ${locked ? 'opacity-60' : ''}`}
    >
      <svg
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={`h-3 w-3 text-black transition-opacity duration-150 ${
          checked ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <path d="M2.5 6.5 5 9l4.5-5.5" />
      </svg>
      {/* Hidden native input so click-on-row still toggles via the
          surrounding <label>. The visual is rendered above. */}
      <input
        type="checkbox"
        checked={checked}
        disabled={locked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />
    </span>
  );
}
