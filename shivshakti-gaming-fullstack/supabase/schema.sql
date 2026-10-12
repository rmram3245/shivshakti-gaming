-- ShivShakti Gaming schema starter.
-- Run in Supabase Dashboard > SQL Editor. Review all policies before production.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'member' check (role in ('member','admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''), 'member')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  bonus_percent numeric(5,2),
  is_active boolean not null default false,
  terms text not null default 'Terms and eligibility apply.',
  created_at timestamptz not null default now()
);

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  amount numeric(14,2) not null,
  kind text not null check (kind in ('deposit','bonus','withdrawal','adjustment','reversal')),
  status text not null default 'pending' check (status in ('pending','posted','rejected','reversed')),
  description text not null default '',
  external_reference text unique,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists wallet_transactions_user_created_idx
on public.wallet_transactions(user_id, created_at desc);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;

create or replace function public.get_my_wallet_balance()
returns numeric
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(sum(t.amount), 0)::numeric
  from public.wallet_transactions t
  where t.user_id = (select auth.uid()) and t.status = 'posted';
$$;
revoke all on function public.get_my_wallet_balance() from public;
grant execute on function public.get_my_wallet_balance() to authenticated;

alter table public.profiles enable row level security;
alter table public.promotions enable row level security;
alter table public.wallet_transactions enable row level security;

drop policy if exists "profiles select self or admin" on public.profiles;
create policy "profiles select self or admin" on public.profiles
for select to authenticated using (id = (select auth.uid()) or public.is_admin());

-- No profile UPDATE policy is created here. This intentionally prevents users
-- from changing their own role through the public API. Add a safe, narrowly scoped
-- display-name RPC or column-level grants only after reviewing the security model.

drop policy if exists "active promotions readable" on public.promotions;
create policy "active promotions readable" on public.promotions
for select to anon, authenticated using (is_active = true or public.is_admin());

drop policy if exists "admin manages promotions" on public.promotions;
create policy "admin manages promotions" on public.promotions
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "users read own transactions or admin" on public.wallet_transactions;
create policy "users read own transactions or admin" on public.wallet_transactions
for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "admin inserts ledger transactions" on public.wallet_transactions;
create policy "admin inserts ledger transactions" on public.wallet_transactions
for insert to authenticated with check (public.is_admin() and created_by = (select auth.uid()));

-- No public insert/update/delete policy for wallet_transactions. Do not accept client-supplied
-- deposits or balances. Verified payment webhooks should call a server-side, idempotent ledger
-- function after provider verification.

insert into public.promotions(title, description, bonus_percent, is_active, terms)
select '10% Deposit Bonus', 'Eligible deposits may qualify for a 10% promotional bonus.', 10, true,
       'Example copy only. Publish approved terms, eligibility, caps, expiry and jurisdiction limits before launch.'
where not exists (select 1 from public.promotions where title = '10% Deposit Bonus');

-- After registering your own account, confirm its UUID/email in Authentication > Users.
-- Then manually promote that account in SQL Editor (replace UUID):
-- update public.profiles set role = 'admin' where id = 'YOUR_AUTH_USER_UUID';
