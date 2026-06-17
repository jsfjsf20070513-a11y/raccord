-- setup_vocabulary.sql
-- Creates `public.review_states` for the bilingual French SRS vocabulary
-- trainer. Idempotent: safe to run repeatedly (every CREATE POLICY is paired
-- with a DROP POLICY IF EXISTS, DDL is guarded by IF NOT EXISTS). Does NOT drop
-- anything.
--
-- Run order: this can be run any time after the project has `auth.users`
-- (i.e. after setup_admin.sql). It is independent of the content tables.
--
-- ⚠ Shared-Supabase red line: this project shares one Supabase instance with the
-- original class site. review_states is per-user and self-scoped — a user may
-- only see and write THEIR OWN rows (auth.uid() = user_id). Keep these policies
-- aligned with the canonical posture in harden_rls.sql; do not relax the
-- self-scope guards.

-- 1) Table -------------------------------------------------------------------
create table if not exists public.review_states (
  user_id           uuid        not null references auth.users (id) on delete cascade,
  word_id           text        not null,
  proficiency_level integer     not null default 0,
  streak_count      integer     not null default 0,
  last_result       text,
  next_review_at    timestamptz not null default now(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  primary key (user_id, word_id),
  constraint review_states_last_result_check
    check (last_result is null or last_result in ('correct', 'wrong')),
  constraint review_states_level_nonneg
    check (proficiency_level >= 0)
);

-- "due now" queries hit this index: where user_id = ? and next_review_at <= now()
create index if not exists review_states_due_idx
  on public.review_states (user_id, next_review_at);

-- 2) Row-level security ------------------------------------------------------
alter table public.review_states enable row level security;

-- SELECT: only your own rows.
drop policy if exists "review_states_select_own" on public.review_states;
create policy "review_states_select_own"
on public.review_states
for select
using ( auth.uid() = user_id );

-- INSERT: you may only create rows owned by yourself.
drop policy if exists "review_states_insert_own" on public.review_states;
create policy "review_states_insert_own"
on public.review_states
for insert
with check ( auth.uid() = user_id );

-- UPDATE: you may only mutate your own rows, and may not reassign ownership.
drop policy if exists "review_states_update_own" on public.review_states;
create policy "review_states_update_own"
on public.review_states
for update
using ( auth.uid() = user_id )
with check ( auth.uid() = user_id );

-- DELETE: you may only delete your own rows.
drop policy if exists "review_states_delete_own" on public.review_states;
create policy "review_states_delete_own"
on public.review_states
for delete
using ( auth.uid() = user_id );

-- 3) Grants ------------------------------------------------------------------
-- anon has no business here (the trainer requires sign-in); revoke explicitly.
revoke all on public.review_states from anon;
grant select, insert, update, delete on public.review_states to authenticated;
