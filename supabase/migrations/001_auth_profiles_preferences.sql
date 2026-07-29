-- Sports Mart — profiles, preferences, cart (Supabase Auth + RLS)
-- Run in Supabase SQL Editor or via Supabase CLI.

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Questionnaire preferences per user
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  age_group text,
  primary_sport text,
  additional_sports text[] not null default '{}',
  product_types text[] not null default '{}',
  experience_level text,
  budget_min numeric,
  budget_max numeric,
  preferred_benefits text[] not null default '{}',
  raw_preferences jsonb,
  updated_at timestamptz not null default now()
);

-- Cart lines for authenticated users (guest cart merges here on login)
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null,
  quantity integer not null check (quantity > 0),
  size text not null default '',
  color text not null default '',
  updated_at timestamptz not null default now(),
  unique (user_id, product_id, size, color)
);

create index if not exists cart_items_user_id_idx on public.cart_items (user_id);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(nullif(excluded.full_name, ''), profiles.full_name),
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.cart_items enable row level security;

-- Profiles policies
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Preferences policies
drop policy if exists "prefs_select_own" on public.user_preferences;
create policy "prefs_select_own"
  on public.user_preferences for select
  using (auth.uid() = user_id);

drop policy if exists "prefs_insert_own" on public.user_preferences;
create policy "prefs_insert_own"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

drop policy if exists "prefs_update_own" on public.user_preferences;
create policy "prefs_update_own"
  on public.user_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "prefs_delete_own" on public.user_preferences;
create policy "prefs_delete_own"
  on public.user_preferences for delete
  using (auth.uid() = user_id);

-- Cart policies
drop policy if exists "cart_select_own" on public.cart_items;
create policy "cart_select_own"
  on public.cart_items for select
  using (auth.uid() = user_id);

drop policy if exists "cart_insert_own" on public.cart_items;
create policy "cart_insert_own"
  on public.cart_items for insert
  with check (auth.uid() = user_id);

drop policy if exists "cart_update_own" on public.cart_items;
create policy "cart_update_own"
  on public.cart_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "cart_delete_own" on public.cart_items;
create policy "cart_delete_own"
  on public.cart_items for delete
  using (auth.uid() = user_id);
