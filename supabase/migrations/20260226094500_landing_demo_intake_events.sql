create table if not exists public.landing_demo_intake_events (
  id uuid primary key default gen_random_uuid(),
  session_key text not null,
  stage text not null check (stage in ('qualification', 'contact', 'calendar_view', 'calendar_scheduled')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_landing_demo_intake_events_session_key
  on public.landing_demo_intake_events (session_key);

create index if not exists idx_landing_demo_intake_events_created_at
  on public.landing_demo_intake_events (created_at desc);

alter table public.landing_demo_intake_events enable row level security;

drop policy if exists "landing_demo_intake_events_insert_public" on public.landing_demo_intake_events;
create policy "landing_demo_intake_events_insert_public"
  on public.landing_demo_intake_events
  for insert
  to anon, authenticated
  with check (true);

grant insert on public.landing_demo_intake_events to anon, authenticated;
