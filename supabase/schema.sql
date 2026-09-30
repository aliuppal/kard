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

-- ── profiles ─────────────────────────────────────────────────────────────
-- One row per signed-in user (web or mobile), created automatically on
-- sign-up — Google or email/password both go through the same auth.users
-- table, so one trigger covers both.
create table if not exists public.profiles (
  id          uuid        primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  city        text        check (city is null or char_length(city) <= 60),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

drop policy if exists "profiles: read own or admin" on public.profiles;
create policy "profiles: read own or admin" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- ── user_cards ───────────────────────────────────────────────────────────
-- A signed-in user's wallet, synced between the web app and the mobile app.
-- Signed-out visitors keep using on-device storage only (see app.js / mobile).
create table if not exists public.user_cards (
  id         bigint generated always as identity primary key,
  user_id    uuid        not null references auth.users (id) on delete cascade,
  bank       text        not null,
  card_type  text        not null check (card_type in ('credit', 'debit')),
  network    text,
  nickname   text        check (nickname is null or char_length(nickname) <= 30),
  last4      text        check (last4 is null or last4 ~ '^\d{4}$'),
  created_at timestamptz not null default now()
);

-- Card product id from catalog.js CARD_PRODUCTS (e.g. 'hbl-platinum-cc'); null = 'other / not listed'.
alter table public.user_cards add column if not exists product text;

create index if not exists user_cards_user_idx on public.user_cards (user_id);

alter table public.user_cards enable row level security;

drop policy if exists "user_cards: owner only" on public.user_cards;
create policy "user_cards: owner only" on public.user_cards
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── row-level security: deals ───────────────────────────────────────────
-- Link to where an offer was published (bank page or aggregator).
alter table public.deals add column if not exists source_url text;

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

-- ── enable Google sign-in ────────────────────────────────────────────────
-- Authentication → Sign In / Providers → Google → paste the Client ID and
-- Client Secret from Google Cloud Console (OAuth consent screen + OAuth
-- client for "Web application"). Add Supabase's callback URL, shown on that
-- same page, as an Authorized redirect URI in Google Cloud Console.
--
-- Regular users signing in with Google is expected and fine to leave open —
-- it only creates a `profiles` row and lets them sync their card wallet.
-- It does NOT grant admin access; that is controlled solely by the
-- `admins` table below, checked by every write policy above.

-- ── make yourself an admin ───────────────────────────────────────────────
-- Sign in once (Google, on the public site, is easiest) so a profile row for
-- you exists, then run this with your email — grants /admin access only:
--
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'you@example.com'
--   on conflict do nothing;
--
-- To find who already has admin access:
--
--   select p.email, p.full_name from public.admins a
--   join public.profiles p on p.id = a.user_id;
