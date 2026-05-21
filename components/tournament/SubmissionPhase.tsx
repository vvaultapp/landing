"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { supabase } from "@/lib/supabaseClient";
import { parseTrackUrl } from "@/lib/tournament/parseTrackUrl";
import type { ParticipantWithVotes, TournamentState } from "@/lib/tournament/types";
import type { TournamentCopy } from "./copy";
import { BracketShowcase } from "./BracketShowcase";

type Props = {
  state: TournamentState;
  copy: TournamentCopy;
};

export function SubmissionPhase({ state, copy }: Props) {
  const { tournament, participants } = state;
  const [user, setUser] = useState<{ id: string; email: string | null } | null>(null);
  const [mySubmission, setMySubmission] = useState<ParticipantWithVotes | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [link, setLink] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user)
        setUser({ id: data.user.id, email: data.user.email ?? null });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user;
      setUser(u ? { id: u.id, email: u.email ?? null } : null);
    });
    return () => sub?.subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setMySubmission(null);
      return;
    }
    const found = participants.find((p) => p.user_id === user.id) ?? null;
    setMySubmission(found);
  }, [user, participants]);

  const sampleRanked = useMemo<ParticipantWithVotes[]>(() => {
    return participants
      .slice()
      .sort((a, b) => a.submitted_at.localeCompare(b.submitted_at))
      .slice(0, 16);
  }, [participants]);

  const isFull = participants.length >= tournament.max_participants;
  const parsed = parseTrackUrl(link);

  function submit() {
    if (!parsed) {
      setError("Lien VVault invalide.");
      return;
    }
    setError(null);
    start(async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token ?? null;
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
        const res = await fetch(`/api/tournament/${tournament.slug}/submit`, {
          method: "POST",
          headers,
          body: JSON.stringify({ track_url: parsed.url }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(json.error || "Could not submit.");
          return;
        }
        setMySubmission(json.participant ?? null);
        setEditOpen(false);
        setLink("");
      } catch {
        setError("Network error.");
      }
    });
  }

  function openEdit() {
    setError(null);
    setLink(mySubmission?.track_url ?? "");
    setEditOpen(true);
  }

  function closeEdit() {
    setEditOpen(false);
    setError(null);
  }

  return (
    <>
      <section
        className={`mx-auto w-full max-w-[1400px] px-5 sm:px-8 pt-[96px] sm:pt-[88px] ${
          user ? "pb-[140px] sm:pb-[112px]" : "pb-10 sm:pb-14"
        }`}
      >
        <BracketShowcase ranked={sampleRanked} />
      </section>

      {user ? (
        <SubmissionFooter
          copy={copy}
          mySubmission={mySubmission}
          isFull={isFull}
          link={link}
          setLink={setLink}
          parsed={parsed}
          pending={pending}
          error={error}
          onSubmit={submit}
          onOpenEdit={openEdit}
        />
      ) : null}

      {editOpen ? (
        <EditSubmissionModal
          copy={copy}
          link={link}
          setLink={setLink}
          parsed={parsed}
          pending={pending}
          error={error}
          onSubmit={submit}
          onClose={closeEdit}
        />
      ) : null}
    </>
  );
}

type FooterProps = {
  copy: TournamentCopy;
  mySubmission: ParticipantWithVotes | null;
  isFull: boolean;
  link: string;
  setLink: (v: string) => void;
  parsed: ReturnType<typeof parseTrackUrl>;
  pending: boolean;
  error: string | null;
  onSubmit: () => void;
  onOpenEdit: () => void;
};

function SubmissionFooter({
  copy,
  mySubmission,
  isFull,
  link,
  setLink,
  parsed,
  pending,
  error,
  onSubmit,
  onOpenEdit,
}: FooterProps) {
  return (
    <footer
      id="submission-footer"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.08] bg-black/85 backdrop-blur-xl"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-px h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
        }}
      />
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-8 sm:py-5">
        {mySubmission ? (
          <MySubmissionView submission={mySubmission} onEdit={onOpenEdit} />
        ) : isFull ? (
          <p className="text-[14px] text-white">{copy.submission.fullState}</p>
        ) : (
          <PasteLinkView
            copy={copy}
            link={link}
            setLink={setLink}
            parsed={parsed}
            pending={pending}
            error={error}
            onSubmit={onSubmit}
          />
        )}
      </div>
    </footer>
  );
}

function MySubmissionView({
  submission,
  onEdit,
}: {
  submission: ParticipantWithVotes;
  onEdit: () => void;
}) {
  return (
    <div className="flex w-full items-center gap-3">
      <a
        href={submission.track_url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex min-w-0 flex-1 items-center gap-3"
      >
        {submission.track_artwork_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={submission.track_artwork_url}
            alt=""
            className="h-12 w-12 shrink-0 rounded-xl object-cover sm:h-14 sm:w-14"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-white/55 sm:h-14 sm:w-14">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M9 17V7l11-2v10a3 3 0 1 1-2-2.83V7.27L11 8.6V19a3 3 0 1 1-2-2.83V17z" />
            </svg>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-[12px] text-white/70">Your submission</div>
          <div className="mt-0.5 flex items-center gap-2 truncate text-[15px] font-medium text-white">
            <span className="truncate group-hover:underline">
              {submission.track_title || submission.track_slug}
            </span>
            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-white/85 transition group-hover:bg-white/[0.14]">
              <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </div>
        </div>
      </a>
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.04] px-4 text-[13px] font-medium text-white transition hover:bg-white/[0.08]"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
        </svg>
        Edit submission
      </button>
    </div>
  );
}

function PasteLinkView({
  copy,
  link,
  setLink,
  parsed,
  pending,
  error,
  onSubmit,
}: {
  copy: TournamentCopy;
  link: string;
  setLink: (v: string) => void;
  parsed: ReturnType<typeof parseTrackUrl>;
  pending: boolean;
  error: string | null;
  onSubmit: () => void;
}) {
  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <div className="flex-1">
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder={copy.submission.placeholder}
          className="h-11 w-full rounded-full border border-white/[0.1] bg-white/[0.025] px-4 text-[14px] text-white placeholder-white/40 outline-none focus:border-sky-400/60"
        />
        {error || (link && !parsed) ? (
          <p className="mt-1.5 pl-3 text-[12px] text-rose-300">
            {error || "Lien VVault invalide."}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onSubmit}
        disabled={pending || !parsed}
        className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-white px-6 text-[14px] font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
      >
        {pending ? copy.submission.submittingCta : copy.submission.confirmCta}
      </button>
    </div>
  );
}

function EditSubmissionModal({
  copy,
  link,
  setLink,
  parsed,
  pending,
  error,
  onSubmit,
  onClose,
}: {
  copy: TournamentCopy;
  link: string;
  setLink: (v: string) => void;
  parsed: ReturnType<typeof parseTrackUrl>;
  pending: boolean;
  error: string | null;
  onSubmit: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[480px] rounded-[28px] border border-white/[0.08] bg-[#0b0c10] p-6 shadow-2xl shadow-black/60 sm:p-7"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-white/65 transition hover:bg-white/[0.05] hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
            <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
        <h2 className="text-[20px] font-semibold text-white">Edit submission</h2>
        <p className="mt-1.5 text-[13.5px] text-white/70">
          Paste a new VVault track link. Your previous submission will be replaced.
        </p>
        <div className="mt-5 flex flex-col gap-3">
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder={copy.submission.placeholder}
            autoFocus
            className="h-12 w-full rounded-2xl border border-white/[0.1] bg-black/40 px-4 text-[14px] text-white placeholder-white/40 outline-none focus:border-sky-400/60"
          />
          {error || (link && !parsed) ? (
            <p className="text-[12.5px] text-rose-300">
              {error || "Lien VVault invalide."}
            </p>
          ) : null}
          <div className="mt-1 flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-white/[0.1] bg-transparent px-5 text-[14px] font-medium text-white transition hover:bg-white/[0.04]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={pending || !parsed}
              className="inline-flex h-11 flex-[1.4] items-center justify-center rounded-full bg-white px-5 text-[14px] font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
            >
              {pending ? copy.submission.submittingCta : "Replace track"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
