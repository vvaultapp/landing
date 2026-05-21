"use client";

import { useState, useTransition } from "react";
import type { Tournament } from "@/lib/tournament/types";

type TournamentRow = Tournament & {
  current_phase?: { kind: string; round_number: number | null; status: string } | null;
};

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}

export function Dashboard({ tournaments }: { tournaments: TournamentRow[] }) {
  const [creating, setCreating] = useState(false);
  return (
    <div className="min-h-screen bg-[#f7f7f7] text-[#101112]">
      <header className="sticky top-0 z-50 border-b border-[#101112]/[0.06] bg-[#f7f7f7]/65 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex w-full max-w-[1100px] items-center justify-between px-6 py-4 sm:px-10">
          <span className="text-[13px] font-semibold uppercase tracking-[0.18em]">
            VVAULT · TOURNAMENT ADMIN
          </span>
          <a href="/tournament" className="text-[13px] text-[#101112]/65 hover:text-[#101112]">
            ↗ Public page
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1100px] px-6 pb-20 pt-10 sm:px-10">
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-[34px] font-semibold leading-tight">Tournaments</h1>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="rounded-2xl bg-black px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#101112]/90"
          >
            New tournament
          </button>
        </div>

        {tournaments.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-dashed border-[#101112]/15 bg-white px-6 py-12 text-center text-[14px] text-[#101112]/55">
            No tournaments yet. Click <strong>New tournament</strong> to create one.
            <br />
            <span className="mt-2 inline-block text-[12.5px] text-[#101112]/40">
              (Make sure <code>supabase/tournament.sql</code> has been applied first.)
            </span>
          </p>
        ) : (
          <ul className="mt-8 space-y-3">
            {tournaments.map((t) => (
              <TournamentRow key={t.id} t={t} />
            ))}
          </ul>
        )}

        {creating ? <CreateModal onClose={() => setCreating(false)} /> : null}
      </main>
    </div>
  );
}

function TournamentRow({ t }: { t: TournamentRow }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function call(url: string, body: unknown) {
    setError(null);
    start(async () => {
      try {
        await postJson(url, body);
        window.location.reload();
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  return (
    <li className="rounded-2xl border border-[#101112]/[0.06] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[18px] font-semibold leading-tight">{t.title}</h2>
            {t.is_featured ? (
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-[0.06em] text-sky-700">
                Featured
              </span>
            ) : null}
            <span className="rounded-full bg-[#101112]/[0.06] px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-[0.06em] text-[#101112]/65">
              {t.status}
            </span>
          </div>
          <div className="mt-1 text-[12.5px] text-[#101112]/55">
            <code>/{t.slug}</code>
            {t.has_qualification ? " · with qualification" : " · no qualification"}
            {" · cap "}
            {t.max_participants}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`/admin/tournament/${t.slug}`}
            className="rounded-2xl border border-[#101112]/[0.12] bg-white px-3 py-2 text-[12.5px] font-medium hover:bg-[#101112]/[0.04]"
          >
            Manage →
          </a>
          {!t.is_featured ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => call("/api/admin/tournament/feature", { id: t.id })}
              className="rounded-2xl border border-[#101112]/[0.12] bg-white px-3 py-2 text-[12.5px] font-medium hover:bg-[#101112]/[0.04] disabled:opacity-50"
            >
              {pending ? "…" : "Set featured"}
            </button>
          ) : null}
        </div>
      </div>
      {error ? <p className="mt-3 text-[12.5px] text-[#c8443c]">{error}</p> : null}
    </li>
  );
}

function CreateModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("VVault Tournament — Season 1");
  const [slug, setSlug] = useState("season-1");
  const [hasQual, setHasQual] = useState(true);
  const [cap, setCap] = useState(1000);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    start(async () => {
      try {
        await postJson("/api/admin/tournament/create", {
          title,
          slug,
          has_qualification: hasQual,
          max_participants: cap,
        });
        window.location.reload();
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-[440px] rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-[18px] font-semibold">New tournament</h3>
          <button onClick={onClose} className="text-[#101112]/50 hover:text-[#101112]">
            ✕
          </button>
        </div>
        <div className="mt-5 space-y-3">
          <Field label="Title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 w-full rounded-xl border border-[#101112]/[0.1] bg-white px-3 text-[14px]"
            />
          </Field>
          <Field label="Slug (in URL: /tournament/<slug>)">
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value.replace(/[^a-z0-9-]/gi, "-").toLowerCase())}
              className="h-11 w-full rounded-xl border border-[#101112]/[0.1] bg-white px-3 text-[14px]"
            />
          </Field>
          <Field label="Max participants">
            <input
              type="number"
              value={cap}
              min={16}
              onChange={(e) => setCap(parseInt(e.target.value) || 1000)}
              className="h-11 w-full rounded-xl border border-[#101112]/[0.1] bg-white px-3 text-[14px]"
            />
          </Field>
          <label className="flex items-center gap-2 text-[13.5px]">
            <input
              type="checkbox"
              checked={hasQual}
              onChange={(e) => setHasQual(e.target.checked)}
            />
            Include qualification phase
          </label>
        </div>
        {error ? <p className="mt-3 text-[12.5px] text-[#c8443c]">{error}</p> : null}
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-2xl border border-[#101112]/[0.12] px-4 py-2 text-[13px] font-medium"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={pending || !title || !slug}
            className="rounded-2xl bg-black px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[#101112]/55">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
