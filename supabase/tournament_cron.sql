-- Tournament auto-advance: pg_cron schedule.
--
-- DO NOT APPLY THIS UNTIL the underlying functions exist and you've
-- exercised the admin "end phase now" button at least once — once
-- active, this fires every 30 seconds and transitions live state.
--
-- Prereqs:
--   1. supabase/tournament.sql has been applied (tables + counter trigger).
--   2. The tournament_close_phase plpgsql function below is in place
--      (this file installs it).
--   3. pg_cron extension is enabled (Supabase has it on by default).
--
-- To pause: select cron.unschedule('tournament-auto-advance');

-- ─── Phase transition function ───────────────────────────────────────
-- Closes the given phase, marks winners, and opens the next phase.
-- Idempotent: running on an already-closed phase is a no-op.
-- Called both from the API route ("end phase now") and from the cron
-- job below.
create or replace function public.tournament_close_phase(p_phase_id uuid)
returns void language plpgsql security definer as $$
declare
  v_phase  public.tournament_phases%rowtype;
  v_t      public.tournaments%rowtype;
  v_next_round int;
  v_next_phase_id uuid;
  v_now timestamptz := now();
  v_match record;
  v_qual record;
  v_seed int := 0;
  v_qualified uuid[];
  v_qual_count int;
  v_next_match_count int;
  v_pairs record;
  v_next_voting int;
begin
  select * into v_phase from public.tournament_phases where id = p_phase_id for update;
  if not found or v_phase.status = 'complete' then
    return;
  end if;

  select * into v_t from public.tournaments where id = v_phase.tournament_id;

  -- Mark this phase complete.
  update public.tournament_phases
     set status = 'complete', ends_at = coalesce(ends_at, v_now)
   where id = p_phase_id;

  -- ── Closing submission: open qualification (or seed round 1).
  if v_phase.kind = 'submission' then
    if v_t.has_qualification then
      insert into public.tournament_phases (tournament_id, kind, status, voting_duration_seconds)
        values (v_t.id, 'qualification', 'pending', null);
    else
      -- No qualification: admin must seed via /api/admin/tournament/seed-bracket.
      null;
    end if;
    return;
  end if;

  -- ── Closing qualification: pick top 32, build round 1.
  if v_phase.kind = 'qualification' then
    -- Tag qualified participants. Ties broken by submission time.
    update public.tournament_participants p
       set qualified = true
      from (
        select tp.id
          from public.tournament_participants tp
          left join public.tournament_qualification_counts c
            on c.participant_id = tp.id and c.phase_id = p_phase_id
         where tp.tournament_id = v_t.id
         order by coalesce(c.votes, 0) desc, tp.submitted_at asc
         limit 32
      ) ranked
     where p.id = ranked.id;

    -- Collect them in seeding order (top vote = seed 1).
    select array_agg(tp.id order by coalesce(c.votes, 0) desc, tp.submitted_at asc)
      into v_qualified
      from public.tournament_participants tp
      left join public.tournament_qualification_counts c
        on c.participant_id = tp.id and c.phase_id = p_phase_id
     where tp.tournament_id = v_t.id and tp.qualified = true;

    v_qual_count := coalesce(array_length(v_qualified, 1), 0);

    -- Build round-1 matches with standard 1v32 seeding.
    if v_qual_count >= 2 then
      for v_seed in 1..(v_qual_count / 2) loop
        insert into public.tournament_matches
          (tournament_id, round_number, slot, participant_a, participant_b, status)
        values (
          v_t.id, 1, v_seed,
          v_qualified[v_seed],
          v_qualified[v_qual_count - v_seed + 1],
          'pending'
        );
      end loop;

      insert into public.tournament_phases
        (tournament_id, kind, round_number, status)
      values (v_t.id, 'round', 1, 'pending');
    else
      update public.tournaments set status = 'complete' where id = v_t.id;
    end if;
    return;
  end if;

  -- ── Closing a round: pick winners, pair them for the next round.
  if v_phase.kind = 'round' then
    -- Decide winners for this round's matches.
    for v_match in
      select * from public.tournament_matches
       where tournament_id = v_t.id and round_number = v_phase.round_number
       order by slot asc
    loop
      if v_match.winner_id is null then
        -- Auto-pick on votes; tie → participant_a wins (deterministic; admin can override).
        update public.tournament_matches
           set winner_id = case
                             when v_match.votes_b > v_match.votes_a then v_match.participant_b
                             else v_match.participant_a
                           end,
               status = 'complete'
         where id = v_match.id;
      else
        update public.tournament_matches set status = 'complete' where id = v_match.id;
      end if;
    end loop;

    -- Mark losers as eliminated in this round.
    update public.tournament_participants p
       set eliminated_in_round = v_phase.round_number
      from public.tournament_matches m
     where m.tournament_id = v_t.id
       and m.round_number = v_phase.round_number
       and p.id in (m.participant_a, m.participant_b)
       and p.id <> m.winner_id
       and p.eliminated_in_round is null;

    -- How many winners advance?
    select count(*) into v_next_match_count
      from public.tournament_matches
     where tournament_id = v_t.id
       and round_number = v_phase.round_number;

    if v_next_match_count = 1 then
      -- That was the final. Crown the champion.
      update public.tournaments set status = 'complete' where id = v_t.id;
      return;
    end if;

    v_next_round := v_phase.round_number + 1;
    v_seed := 0;

    -- Pair winners: slot 1 vs slot 2, slot 3 vs slot 4, etc.
    for v_pairs in
      select
        a.winner_id as p_a,
        b.winner_id as p_b,
        ((a.slot - 1) / 2 + 1) as new_slot
      from public.tournament_matches a
      join public.tournament_matches b
        on a.tournament_id = b.tournament_id
       and a.round_number = b.round_number
       and a.slot + 1 = b.slot
       and a.slot % 2 = 1
      where a.tournament_id = v_t.id and a.round_number = v_phase.round_number
      order by a.slot asc
    loop
      insert into public.tournament_matches
        (tournament_id, round_number, slot, participant_a, participant_b, status)
      values (v_t.id, v_next_round, v_pairs.new_slot, v_pairs.p_a, v_pairs.p_b, 'pending');
    end loop;

    -- Open the next round phase.
    v_next_voting := v_phase.voting_duration_seconds;
    insert into public.tournament_phases
      (tournament_id, kind, round_number, status, voting_duration_seconds, auto_advance)
    values (v_t.id, 'round', v_next_round, 'pending', v_next_voting, v_phase.auto_advance)
    returning id into v_next_phase_id;
    return;
  end if;
end $$;

-- ─── Auto-advance driver ─────────────────────────────────────────────
-- Closes any active phase whose ends_at has passed. Called by pg_cron
-- every 30s.
--
-- When auto_advance = true: full close_phase (mark complete + open next).
-- When auto_advance = false: just mark complete; admin must manually
-- open the next phase. This is the path used for the Signups phase
-- (open → closed via timer, closed → next phase via admin click).
create or replace function public.tournament_auto_advance()
returns void language plpgsql security definer as $$
declare
  r record;
begin
  for r in
    select id, auto_advance from public.tournament_phases
     where status = 'active'
       and ends_at is not null
       and ends_at <= now()
  loop
    if r.auto_advance then
      perform public.tournament_close_phase(r.id);
    else
      update public.tournament_phases
         set status = 'complete'
       where id = r.id and status = 'active';
    end if;
  end loop;
end $$;

-- ─── Schedule ────────────────────────────────────────────────────────
select cron.schedule(
  'tournament-auto-advance',
  '*/30 * * * * *',  -- every 30 seconds
  $$ select public.tournament_auto_advance(); $$
);
