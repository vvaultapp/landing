-- VVault Tournament: schema, indexes, RLS.
--
-- A tournament is a single-elimination music competition. Producers
-- submit a track they own (a vvault.app/t/<slug> link). An optional
-- qualification phase narrows the field to 32 via public vote; then
-- five 1v1 knockout rounds (32 → 16 → 8 → 4 → 2 → 1) play out.
--
-- All writes go through API routes with the service role key — RLS
-- here just guards public reads. The /tournament page reads with the
-- anon key.
--
-- To apply: paste into the Supabase SQL editor or run via MCP / CLI.

set search_path = public;

-- ─── Tournaments ─────────────────────────────────────────────────────
create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  status text not null default 'draft'         -- draft | live | complete
    check (status in ('draft', 'live', 'complete')),
  has_qualification boolean not null default true,
  max_participants int not null default 1000,
  is_featured boolean not null default false,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Exactly one featured tournament at a time (the one rendered at /tournament).
create unique index if not exists tournaments_one_featured
  on public.tournaments (is_featured) where is_featured;

create index if not exists tournaments_slug_idx on public.tournaments (slug);
create index if not exists tournaments_status_idx on public.tournaments (status);

-- ─── Phases ──────────────────────────────────────────────────────────
create table if not exists public.tournament_phases (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  kind text not null
    check (kind in ('submission', 'qualification', 'round')),
  round_number int,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'complete')),
  starts_at timestamptz,
  ends_at timestamptz,
  auto_advance boolean not null default false,
  voting_duration_seconds int,
  -- Per-phase salt for voter fingerprints. md5 (not cryptographic) is fine
  -- here: the real strength of the fingerprint comes from the HMAC computed
  -- server-side with TOURNAMENT_VOTER_SECRET / SUPABASE_SERVICE_ROLE_KEY.
  -- Avoids depending on pgcrypto being in the default search_path.
  voter_salt text default md5(random()::text || clock_timestamp()::text),
  created_at timestamptz not null default now()
);

create index if not exists tournament_phases_active_idx
  on public.tournament_phases (status, ends_at);
create index if not exists tournament_phases_tournament_idx
  on public.tournament_phases (tournament_id, kind, round_number);

-- ─── Participants ────────────────────────────────────────────────────
create table if not exists public.tournament_participants (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  user_id uuid not null,
  vvault_username text,
  track_url text not null,
  track_slug text not null,
  track_title text,
  track_artwork_url text,
  submitted_at timestamptz not null default now(),
  qualified boolean not null default false,
  eliminated_in_round int,
  unique (tournament_id, user_id),
  unique (tournament_id, track_slug)
);

create index if not exists tournament_participants_tournament_idx
  on public.tournament_participants (tournament_id, qualified);

-- ─── Matches ─────────────────────────────────────────────────────────
create table if not exists public.tournament_matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  round_number int not null,
  slot int not null,
  participant_a uuid references public.tournament_participants(id),
  participant_b uuid references public.tournament_participants(id),
  winner_id uuid references public.tournament_participants(id),
  votes_a int not null default 0,
  votes_b int not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'complete')),
  unique (tournament_id, round_number, slot)
);

create index if not exists tournament_matches_round_idx
  on public.tournament_matches (tournament_id, round_number, slot);

-- ─── Votes ───────────────────────────────────────────────────────────
create table if not exists public.tournament_votes (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  phase_id uuid not null references public.tournament_phases(id) on delete cascade,
  match_id uuid references public.tournament_matches(id) on delete cascade,
  participant_id uuid not null references public.tournament_participants(id) on delete cascade,
  voter_fingerprint text not null,
  voter_user_id uuid,
  created_at timestamptz not null default now()
);

-- Bracket: one vote per fingerprint per match.
create unique index if not exists tournament_votes_match_uniq
  on public.tournament_votes (phase_id, voter_fingerprint, match_id)
  where match_id is not null;

-- Qualification: one vote per fingerprint per participant (a voter can like
-- many tracks, but only once per track).
create unique index if not exists tournament_votes_qual_uniq
  on public.tournament_votes (phase_id, voter_fingerprint, participant_id)
  where match_id is null;

create index if not exists tournament_votes_phase_idx
  on public.tournament_votes (phase_id, participant_id);

-- ─── Match counter trigger ───────────────────────────────────────────
-- Keeps tournament_matches.votes_a / votes_b in sync for O(1) reads.
create or replace function public.tournament_bump_match_vote()
returns trigger language plpgsql as $$
begin
  if new.match_id is not null then
    update public.tournament_matches m
       set votes_a = m.votes_a + (case when new.participant_id = m.participant_a then 1 else 0 end),
           votes_b = m.votes_b + (case when new.participant_id = m.participant_b then 1 else 0 end)
     where m.id = new.match_id;
  end if;
  return new;
end $$;

drop trigger if exists trg_tournament_bump_match_vote on public.tournament_votes;
create trigger trg_tournament_bump_match_vote
  after insert on public.tournament_votes
  for each row execute function public.tournament_bump_match_vote();

-- ─── RLS ─────────────────────────────────────────────────────────────
alter table public.tournaments enable row level security;
alter table public.tournament_phases enable row level security;
alter table public.tournament_participants enable row level security;
alter table public.tournament_matches enable row level security;
alter table public.tournament_votes enable row level security;

drop policy if exists "tournaments_public_read" on public.tournaments;
create policy "tournaments_public_read" on public.tournaments
  for select using (true);

drop policy if exists "tournament_phases_public_read" on public.tournament_phases;
create policy "tournament_phases_public_read" on public.tournament_phases
  for select using (true);

drop policy if exists "tournament_participants_public_read" on public.tournament_participants;
create policy "tournament_participants_public_read" on public.tournament_participants
  for select using (true);

drop policy if exists "tournament_matches_public_read" on public.tournament_matches;
create policy "tournament_matches_public_read" on public.tournament_matches
  for select using (true);

-- Votes table is service-role-only. Public can only see aggregates via
-- the votes_a / votes_b columns on tournament_matches.
drop policy if exists "tournament_votes_no_read" on public.tournament_votes;
create policy "tournament_votes_no_read" on public.tournament_votes
  for select using (false);

-- ─── Featured tournament view ────────────────────────────────────────
-- Convenience view used by /api/tournament/current. Returns the
-- single featured tournament row (or no rows if there isn't one).
create or replace view public.tournament_current as
  select t.*
    from public.tournaments t
   where t.is_featured = true
   limit 1;

-- ─── Counters view ───────────────────────────────────────────────────
-- Vote totals per participant per phase. Used in qualification ranking
-- and admin diagnostics. The trigger above keeps match counters live;
-- qualification counts come from this view (since they're not stored).
create or replace view public.tournament_qualification_counts as
  select
    v.phase_id,
    v.participant_id,
    count(*) as votes
  from public.tournament_votes v
  where v.match_id is null
  group by v.phase_id, v.participant_id;
