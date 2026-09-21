-- Kard — database schema. Run once in Supabase → SQL Editor. Safe to re-run.

-- ── deals ────────────────────────────────────────────────────────────────
create table if not exists public.deals (
  id            bigint generated always as identity primary key,
  merchant      text        not null check (char_length(merchant) between 1 and 120),
  category      text        not null,
  all_cities    boolean     not null default false,          -- true = valid across Pakistan
  cities        text[]      not null default '{}',
  banks         text[]      not null,
  card_types    text[]      not null default '{credit,debit}',
  networks      text[],                                      -- null/empty = any network
  offer         text        not null check (char_length(offer) between 1 and 60),
  discount_pct  numeric     not null default 0,              -- used for "biggest discount" sorting
  max_discount  text,
  min_spend     text,
  schedule_type text        not null check (schedule_type in ('daily','weekly','monthly','range')),
  weekdays      smallint[]  not null default '{}',           -- 0 = Sunday … 6 = Saturday
  month_dates   smallint[]  not null default '{}',           -- day of month, 1–31
  start_date    date,
  end_date      date,                                        -- null = ongoing
  terms         text,
  active        boolean     not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint deals_banks_ck      check (cardinality(banks) >= 1),
  constraint deals_types_ck      check (cardinality(card_types) >= 1 and card_types <@ array['credit','debit']),
  constraint deals_pct_ck        check (discount_pct between 0 and 100),
  constraint deals_cities_ck     check (all_cities or cardinality(cities) >= 1),
  constraint deals_weekdays_ck   check (weekdays <@ array[0,1,2,3,4,5,6]::smallint[]),
  constraint deals_monthdates_ck check (month_dates <@ array[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]::smallint[]),
  constraint deals_schedule_ck   check (
       schedule_type = 'daily'
    or (schedule_type = 'weekly'  and cardinality(weekdays)    >= 1)
    or (schedule_type = 'monthly' and cardinality(month_dates) >= 1)
    or (schedule_type = 'range'   and start_date is not null and end_date is not null)
  ),
  constraint deals_dates_ck      check (start_date is null or end_date is null or end_date >= start_date)
);

create index if not exists deals_active_idx on public.deals (active);

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists deals_touch on public.deals;
create trigger deals_touch before update on public.deals
  for each row execute function public.touch_updated_at();

-- ── admins ───────────────────────────────────────────────────────────────
-- Identified by auth user id (not email), so nobody can gain access by signing
-- up with an admin's email address.
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.admins enable row level security;   -- no policies: not readable through the API

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ── row-level security ───────────────────────────────────────────────────
alter table public.deals enable row level security;

drop policy if exists "public can read active deals" on public.deals;
create policy "public can read active deals" on public.deals
  for select to anon, authenticated
  using (active or public.is_admin());

drop policy if exists "admins can insert deals" on public.deals;
create policy "admins can insert deals" on public.deals
  for insert to authenticated with check (public.is_admin());

drop policy if exists "admins can update deals" on public.deals;
create policy "admins can update deals" on public.deals
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins can delete deals" on public.deals;
create policy "admins can delete deals" on public.deals
  for delete to authenticated using (public.is_admin());

-- ── make yourself an admin ───────────────────────────────────────────────
-- 1. Supabase → Authentication → Users → "Add user" (email + password, tick auto-confirm).
-- 2. Then run this with that email:
--
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'you@example.com'
--   on conflict do nothing;
--
-- 3. Recommended: Authentication → Sign In / Providers → turn OFF "Allow new users to sign up".
