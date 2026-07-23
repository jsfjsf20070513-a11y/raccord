-- Supabase setup for the Carnet testimony register.
-- Public readers see the register; authenticated users can only create,
-- update, or remove rows carrying their own auth.uid(). No email/PII column
-- is stored or exposed.

create table if not exists public.testimonials (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 120),
  signature text not null default 'anonyme' check (char_length(signature) between 1 and 24),
  created_at timestamptz not null default now()
);

alter table public.testimonials enable row level security;

drop policy if exists "testimonials_select_public" on public.testimonials;
drop policy if exists "testimonials_insert_own" on public.testimonials;
drop policy if exists "testimonials_update_own" on public.testimonials;
drop policy if exists "testimonials_delete_own" on public.testimonials;

create policy "testimonials_select_public"
on public.testimonials
for select
to public
using ( true );

create policy "testimonials_insert_own"
on public.testimonials
for insert
to authenticated
with check ( auth.uid() = user_id );

create policy "testimonials_update_own"
on public.testimonials
for update
to authenticated
using ( auth.uid() = user_id )
with check ( auth.uid() = user_id );

create policy "testimonials_delete_own"
on public.testimonials
for delete
to authenticated
using ( auth.uid() = user_id );

revoke all on table public.testimonials from anon, authenticated;
grant select on table public.testimonials to anon, authenticated;
grant insert, update, delete on table public.testimonials to authenticated;
grant usage, select on sequence public.testimonials_id_seq to authenticated;
