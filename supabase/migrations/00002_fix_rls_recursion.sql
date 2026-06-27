create or replace function public.is_family_member(family_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.family_members
    where family_members.family_id = $1
    and family_members.user_id = auth.uid()
  );
$$;

drop policy if exists "members can read own family members" on public.family_members;
drop policy if exists "members can read family transactions" on public.transactions;
drop policy if exists "members can read own families" on public.families;

create policy "members can read own family members"
  on public.family_members for select
  using (public.is_family_member(family_id));

create policy "members can read family transactions"
  on public.transactions for select
  using (public.is_family_member(family_id));

create policy "members can read own families"
  on public.families for select
  using (public.is_family_member(id));
