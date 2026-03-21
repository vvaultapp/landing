create table if not exists public.landing_manual_stats (
  id smallint primary key default 1 check (id = 1),
  money_paid_total_cents bigint not null default 0,
  app_store_review_label text not null default '4.9/5',
  updated_at timestamptz not null default now()
);

alter table public.landing_manual_stats enable row level security;

drop policy if exists "landing_manual_stats_public_read" on public.landing_manual_stats;
create policy "landing_manual_stats_public_read"
on public.landing_manual_stats
for select
using (true);

insert into public.landing_manual_stats (id, money_paid_total_cents, app_store_review_label)
values (1, 0, '4.9/5')
on conflict (id) do nothing;
