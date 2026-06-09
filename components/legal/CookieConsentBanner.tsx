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
      /* Mobile: full-width dark strip pinned to the bottom edge.
         Tablet + desktop (md+): compact white card LOCKED to the
         bottom-right corner. We use the md breakpoint (768px) instead
         of lg (1024px) so tablets and small laptops also see the
         card variant — earlier the lg gap let some viewports fall
         back to the mobile full-width layout. `left-auto` is set
         explicitly so the mobile `inset-x-0` (= left:0 right:0)
         can't leak through and stretch the banner across the page. */
      className="fixed inset-x-0 bottom-0 z-[1000] border-t border-[rgb(var(--ov)_/_0.08)] bg-[rgb(var(--bg))] text-[rgb(var(--fg))] shadow-[0_-12px_40px_rgb(var(--ov)_/_0.3)] md:inset-x-auto md:bottom-7 md:right-7 md:left-auto md:w-[380px] md:max-w-[calc(100vw-3.5rem)] md:rounded-2xl md:border md:border-[rgb(var(--ov)_/_0.1)] md:bg-[rgb(var(--bg))] md:text-[rgb(var(--fg))] md:shadow-[0_18px_48px_rgba(16,17,18,0.16),0_2px_8px_rgba(16,17,18,0.08)]"
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
          className="absolute right-4 top-4 z-[1] inline-flex h-9 w-9 items-center justify-center rounded-full bg-[rgb(var(--ov)_/_0.06)] text-[rgb(var(--fg))] transition-colors hover:bg-[rgb(var(--ov)_/_0.1)] sm:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}

      <div className="mx-auto w-full max-w-[1400px] px-6 py-6 sm:px-10 sm:py-7 md:mx-0 md:max-w-none md:px-7 md:py-8">
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
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-10 md:flex-col md:gap-5">
      <div className="min-w-0 max-w-[760px]">
        <h2 className="text-[15px] font-semibold leading-snug text-[rgb(var(--fg))] sm:text-base md:text-[15px] md:font-medium md:text-[rgb(var(--fg))]">
          We value your privacy
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-[rgb(var(--fg)_/_0.65)] sm:text-[14px] md:mt-2 md:text-[13px] md:text-[rgb(var(--fg))]/60">
          Cookies help this site function, measure usage, and support marketing.{" "}
          <button
            type="button"
            onClick={onCustomize}
            className="font-medium text-[rgb(var(--fg))] underline underline-offset-2 hover:text-[rgb(var(--fg))] md:text-[rgb(var(--fg))] md:hover:text-[rgb(var(--fg))]"
          >
            Manage
          </button>{" "}
          anytime or read our{" "}
          <Link
            href="/privacy#cookies"
            className="font-medium text-[rgb(var(--fg))] underline underline-offset-2 hover:text-[rgb(var(--fg))] md:text-[rgb(var(--fg))] md:hover:text-[rgb(var(--fg))]"
          >
            cookie policy
          </Link>
          .
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2.5 sm:justify-end md:w-full md:justify-stretch md:gap-2.5">
        <button
          type="button"
          onClick={onRejectAll}
          className="inline-flex h-10 items-center rounded-full border border-[rgb(var(--ov)_/_0.2)] bg-transparent px-5 text-[13px] font-medium text-[rgb(var(--fg))] transition-colors hover:bg-[rgb(var(--ov)_/_0.1)] md:h-11 md:flex-1 md:justify-center md:border-[rgb(var(--ov)_/_0.15)] md:px-4 md:text-[13px] md:text-[rgb(var(--fg))] md:hover:bg-[rgb(var(--ov)_/_0.06)]"
        >
          Reject
        </button>
        <button
          type="button"
          onClick={onAcceptAll}
          className="inline-flex h-10 items-center rounded-full bg-[rgb(var(--inv))] px-6 text-[13px] font-semibold text-[rgb(var(--inv-fg))] transition-opacity hover:opacity-90 md:h-11 md:flex-1 md:justify-center md:px-4 md:text-[13px]"
        >
          Accept
        </button>
        {/* Desktop dismiss — only on sm/md viewports (sm:inline-flex
            md:hidden). On the lg+ compact card layout there's not
            enough horizontal room for a separate X, and the Reject
            button already provides the same effect. */}
        <button
          type="button"
          aria-label="Reject non-essential cookies and close"
          onClick={onDismiss}
          className="ml-1 hidden h-10 w-10 items-center justify-center rounded-full text-[rgb(var(--fg))] transition-colors hover:bg-[rgb(var(--ov)_/_0.1)] sm:inline-flex md:hidden"
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
          <h2 className="text-[15px] font-semibold leading-snug text-[rgb(var(--fg))] sm:text-base md:font-medium md:text-[rgb(var(--fg))]">
            Cookie preferences
          </h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[rgb(var(--fg)_/_0.65)] sm:text-[14px] md:text-[13px] md:text-[rgb(var(--fg))]/60">
            Strictly necessary cookies are always on because the site cannot
            function without them. Toggle the others to your preference.
          </p>
        </div>
        {props.allowClose ? (
          <button
            type="button"
            aria-label="Close preferences"
            onClick={props.onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[rgb(var(--fg)_/_0.55)] transition-colors hover:bg-[rgb(var(--ov)_/_0.1)] hover:text-[rgb(var(--fg))] md:text-[rgb(var(--fg))]/55 md:hover:bg-[rgb(var(--bg)_/_0.06)] md:hover:text-[rgb(var(--fg))]"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-2.5 md:gap-2.5 sm:grid-cols-3 md:grid-cols-1">
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

      <div className="flex flex-wrap items-center justify-end gap-2.5 md:gap-2">
        <button
          type="button"
          onClick={props.onRejectAll}
          className="inline-flex h-10 items-center rounded-full border border-[rgb(var(--ov)_/_0.2)] bg-transparent px-5 text-[13px] font-medium text-[rgb(var(--fg))] transition-colors hover:bg-[rgb(var(--ov)_/_0.1)] md:h-9 md:border-[rgb(var(--ov)_/_0.15)] md:px-4 md:text-[12.5px] md:text-[rgb(var(--fg))] md:hover:bg-[rgb(var(--ov)_/_0.06)]"
        >
          Reject non-essential
        </button>
        <button
          type="button"
          onClick={props.onAcceptAll}
          className="inline-flex h-10 items-center rounded-full border border-[rgb(var(--ov)_/_0.2)] bg-transparent px-5 text-[13px] font-medium text-[rgb(var(--fg))] transition-colors hover:bg-[rgb(var(--ov)_/_0.1)] md:h-9 md:border-[rgb(var(--ov)_/_0.15)] md:px-4 md:text-[12.5px] md:text-[rgb(var(--fg))] md:hover:bg-[rgb(var(--ov)_/_0.06)]"
        >
          Accept all
        </button>
        <button
          type="button"
          onClick={props.onSave}
          className="inline-flex h-10 items-center rounded-full bg-[rgb(var(--inv))] px-6 text-[13px] font-semibold text-black transition-colors hover:bg-[rgb(var(--ov)_/_0.9)] md:h-9 md:bg-[rgb(var(--bg))] md:px-4 md:text-[12.5px] md:text-[rgb(var(--fg))] md:hover:bg-[rgb(var(--bg)_/_0.85)]"
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
      className={`flex items-start gap-3 rounded-2xl border border-[rgb(var(--ov)_/_0.1)] bg-[rgb(var(--ov)_/_0.04)] p-4 transition-colors md:border-black/[0.08] md:bg-[rgb(var(--bg)_/_0.025)] ${
        interactive
          ? 'cursor-pointer hover:border-[rgb(var(--ov)_/_0.15)] hover:bg-[rgb(var(--ov)_/_0.06)] md:hover:border-black/[0.14] md:hover:bg-[rgb(var(--ov)_/_0.06)]'
          : ''
      }`}
    >
      <Checkbox checked={checked} locked={locked} onChange={onChange} />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-[rgb(var(--fg))] md:text-[rgb(var(--fg))]">
            {title}
          </span>
          {locked ? (
            <span className="rounded-full bg-[rgb(var(--ov)_/_0.1)] px-1.5 py-px text-[9px] font-medium uppercase tracking-wide text-[rgb(var(--fg)_/_0.55)] md:bg-[rgb(var(--bg)_/_0.08)] md:text-[rgb(var(--fg))]/55">
              Always on
            </span>
          ) : null}
        </div>
        <div className="mt-1 text-[12px] leading-relaxed text-[rgb(var(--fg)_/_0.55)] md:text-[rgb(var(--fg))]/55">
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
          ? 'border-white bg-[rgb(var(--inv))] md:border-black md:bg-[rgb(var(--bg))]'
          : 'border-[rgb(var(--ov)_/_0.3)] bg-transparent md:border-black/30'
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
        className={`h-3 w-3 text-black transition-opacity duration-150 md:text-[rgb(var(--fg))] ${
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
