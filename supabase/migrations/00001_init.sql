-- 家账数据库初始化

-- 1. 用户扩展表
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text,
  avatar_url  text,
  created_at  timestamptz default now()
);

-- 2. 家庭表
create table public.families (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  invite_code text not null unique,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz default now()
);

-- 3. 家庭成员表
create table public.family_members (
  id         uuid primary key default gen_random_uuid(),
  family_id  uuid not null references public.families(id) on delete cascade,
  user_id    uuid not null references public.profiles(id),
  role       text not null default 'member' check (role in ('admin', 'member')),
  joined_at  timestamptz default now(),
  unique(family_id, user_id)
);

-- 4. 账单表
create table public.transactions (
  id               uuid primary key default gen_random_uuid(),
  family_id        uuid not null references public.families(id) on delete cascade,
  user_id          uuid not null references public.profiles(id),
  type             text not null check (type in ('income', 'expense')),
  category         text not null,
  amount           decimal(12,2) not null,
  payment_method   text,
  note             text,
  tags             text[],
  transaction_date date not null default current_date,
  created_at       timestamptz default now()
);

-- 5. 索引
create index idx_transactions_family_date on public.transactions(family_id, transaction_date desc);
create index idx_family_members_user on public.family_members(user_id);
create index idx_family_members_family on public.family_members(family_id);

-- 6. 自动创建 profile（用户注册时触发）
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''));
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 7. RLS 开启
alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.transactions enable row level security;

-- 8. RLS 策略
-- profiles
create policy "users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- families
create policy "members can read own families"
  on public.families for select
  using (
    auth.uid() in (
      select user_id from public.family_members where family_id = families.id
    )
  );

create policy "authenticated users can insert families"
  on public.families for insert
  with check (auth.role() = 'authenticated');

-- family_members
create policy "members can read own family members"
  on public.family_members for select
  using (
    family_id in (
      select family_id from public.family_members where user_id = auth.uid()
    )
  );

create policy "authenticated users can insert family members"
  on public.family_members for insert
  with check (auth.role() = 'authenticated');

-- transactions
create policy "members can read family transactions"
  on public.transactions for select
  using (
    family_id in (
      select family_id from public.family_members where user_id = auth.uid()
    )
  );

create policy "users insert own transactions"
  on public.transactions for insert
  with check (
    auth.uid() = user_id
    and family_id in (
      select family_id from public.family_members where user_id = auth.uid()
    )
  );

create policy "users update own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "users delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);
