-- harden_rls.sql
-- Idempotent hardening pass for the math-class site Supabase project.
-- Safe to run as many times as needed; every CREATE POLICY is paired
-- with a DROP POLICY IF EXISTS, and table / column DDL is guarded by
-- IF NOT EXISTS.  This file does NOT drop any tables or columns.
--
-- Run order (fresh project):
--   1) setup_admin.sql                -- creates `public.profiles`,
--                                        the `handle_new_user()` trigger
--                                        on auth.users, and the seed
--                                        super_admin row.
--   2) setup_official_content.sql     -- creates `albums` / `album_photos` /
--                                        `resources`.  Its policies reference
--                                        `public.profiles`, so step 1 must run
--                                        before this.
--   3) setup_storage_buckets.sql      -- creates the `gallery-photos` bucket
--                                        and its `storage.objects` policies.
--                                        Also references `public.profiles`.
--   4) harden_rls.sql (this file)     -- canonical RLS state.  Overrides the
--                                        first-cut policies installed by
--                                        steps 1-3 with the centralised
--                                        `public.is_admin()` /
--                                        `public.is_super_admin()` helpers and
--                                        the moderation-insert guard.
--
-- This file is also self-sufficient with respect to the `public.profiles`
-- table itself: section 0 below creates it if missing, so harden_rls.sql
-- still works when run on its own.  setup_admin.sql remains responsible
-- for the one-time bootstrap pieces that don't belong in an idempotent
-- hardening pass: the `handle_new_user()` trigger that auto-creates a
-- profile row whenever a user signs up, and the seed INSERT that
-- promotes a specific email to super_admin.
--
-- After this file runs, the policies it creates are the authoritative
-- set; treat enable_rls.sql / setup_admin_v2.sql as historical and do
-- not re-run them without re-running this script afterwards.

-- =========================================================================
-- 0. Ensure public.profiles exists.  Mirrors the schema in setup_admin.sql
--    so this file can run first on a fresh project (the policies and
--    is_admin() helper below assume the table is in place).  The
--    new-user trigger and super_admin seed live in setup_admin.sql and
--    are intentionally NOT duplicated here.
-- =========================================================================
create table if not exists public.profiles (
  id uuid not null references auth.users(id) on delete cascade primary key,
  email text,
  role text default 'user' check (role in ('user', 'admin', 'super_admin')),
  created_at timestamptz default now()
);

create table if not exists public.testimonials (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 120),
  signature text not null default 'anonyme' check (char_length(signature) between 1 and 24),
  created_at timestamptz not null default now()
);

-- =========================================================================
-- 1. Admin check helpers.  SECURITY DEFINER functions let policies read
--    `public.profiles` without recursively triggering profiles RLS, and
--    they centralise the admin definition so we never need to do JSON
--    LIKE matching against `auth.users.raw_app_meta_data` or trust
--    `auth.jwt()` claims that a client could spoof.
--
--    Both helpers are intentionally NO-argument: they only ever check
--    `auth.uid()`.  This prevents an authenticated client from probing
--    "is user X an admin?" for arbitrary X (which the previous
--    `is_admin(uid uuid default auth.uid())` signature allowed via
--    `select public.is_admin('<someone-elses-uuid>')`).
--
--    Drop any previous parameterised signature first so re-running this
--    script on a project that already has the old function succeeds.
--
--    Idempotency footgun: a prior run of `harden_rls.sql` installed
--    policies in sections 3 and 4 below that call `public.is_admin()`.
--    Under the previous `is_admin(uid uuid default auth.uid())`
--    signature those policies depend on the parameterised function in
--    PostgreSQL's catalog, and `DROP FUNCTION` refuses to run while any
--    dependent policy still exists.  We therefore pre-emptively drop
--    every policy that could hold such a dependency BEFORE dropping
--    the old function (non-CASCADE).  Sections 3 and 4 will re-create
--    these policies further down using the new no-arg signature; the
--    second `drop policy if exists` for each of these names in those
--    sections is a harmless no-op on re-run.
--
--    `is_super_admin(uuid)` was never shipped, so its drop is purely
--    defensive — nothing should depend on it.
-- =========================================================================
drop policy if exists "comments_select_admin_ops"           on public.comments;
drop policy if exists "comments_insert_self"                on public.comments;
-- Historical policy name from an earlier draft of this script.  It is
-- already in the section-3 drop block below, but is repeated here in
-- case a prior database version installed it with a dependency on the
-- old `public.is_admin(uuid)` signature -- the function drop would
-- otherwise fail.
drop policy if exists "comments_insert_moderation_admin_only" on public.comments;
drop policy if exists "comments_update_own"                 on public.comments;
drop policy if exists "comments_delete_own_or_admin"        on public.comments;
drop policy if exists "albums_admin_write"                  on public.albums;
drop policy if exists "album_photos_admin_write"            on public.album_photos;
drop policy if exists "resources_admin_write"               on public.resources;
drop policy if exists "testimonials_delete_own_or_admin"     on public.testimonials;

drop function if exists public.is_admin(uuid);
drop function if exists public.is_super_admin(uuid);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('admin', 'super_admin')
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'super_admin'
  );
$$;

revoke all on function public.is_admin()       from public;
revoke all on function public.is_super_admin() from public;
grant execute on function public.is_admin()       to anon, authenticated, service_role;
grant execute on function public.is_super_admin() to anon, authenticated, service_role;

-- =========================================================================
-- 2. profiles
--    - RLS on.
--    - SELECT: own row only (the existing admin policies rely on
--      `EXISTS (... profiles WHERE id = auth.uid())` which is visible
--      to the user themselves, so no broader read is needed).
--    - UPDATE: super_admin only, and the new row must still be a valid
--      role to avoid privilege escalation via UPDATE-with-check.
--    - INSERT/DELETE: handled by the `handle_new_user()` trigger
--      (security definer) and `auth.users` cascade; no client policy.
-- =========================================================================
alter table public.profiles enable row level security;

drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can insert their own profile"      on public.profiles;
drop policy if exists "Users can update own profile"            on public.profiles;
drop policy if exists "Users can view own profile"              on public.profiles;
drop policy if exists "Super Admins can update roles"           on public.profiles;
drop policy if exists "profiles_select_own"                     on public.profiles;
drop policy if exists "profiles_update_super_admin"             on public.profiles;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ( auth.uid() = id );

-- Route the super_admin check through `public.is_super_admin()` so the
-- policy does NOT self-reference `public.profiles`.  A bare `select ...
-- from public.profiles` inside a profiles policy is evaluated with this
-- same RLS in force, which at best forces every super_admin write to
-- pass through `profiles_select_own` (subtly correct only for the
-- common case) and at worst triggers recursion errors.  The
-- SECURITY DEFINER helper bypasses RLS on the lookup row and keeps the
-- policy intent explicit.
create policy "profiles_update_super_admin"
on public.profiles
for update
to authenticated
using ( public.is_super_admin() )
with check (
  public.is_super_admin()
  -- Prevent a super_admin from writing an invalid role string.
  and role in ('user', 'admin', 'super_admin')
);

-- =========================================================================
-- 2b. testimonials
--     Public-readable class register with owner-bound writes. The table has
--     no email column; identity is kept only as auth.users FK for RLS.
-- =========================================================================
alter table public.testimonials enable row level security;

drop policy if exists "testimonials_select_public"       on public.testimonials;
drop policy if exists "testimonials_insert_own"          on public.testimonials;
drop policy if exists "testimonials_update_own"          on public.testimonials;
drop policy if exists "testimonials_delete_own"          on public.testimonials;
drop policy if exists "testimonials_delete_own_or_admin" on public.testimonials;

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

create policy "testimonials_delete_own_or_admin"
on public.testimonials
for delete
to authenticated
using (
  auth.uid() = user_id
  or public.is_admin()
);

revoke all on table public.testimonials from anon, authenticated;
grant select on table public.testimonials to anon, authenticated;
grant insert, update, delete on table public.testimonials to authenticated;
grant usage, select on sequence public.testimonials_id_seq to authenticated;

-- =========================================================================
-- 3. comments  (also holds the ops_queue rows on album_id = 0)
--    Frontend contract (src/lib/opsQueue.js, src/components/Comments.jsx):
--      * Public comments are rows with album_id <> 0.
--      * Ops-queue submissions are rows with album_id = 0 and content
--        prefixed by `__mathclass_ops__::{...}`.
--      * Moderation receipts are ops-queue rows whose envelope `kind`
--        is "moderation".  They must NOT be forgeable by ordinary
--        users, otherwise a peer can spoof a "deleted" / "published"
--        notice into someone else's case file.
-- =========================================================================
alter table public.comments enable row level security;

-- Drop every comments policy this repo has ever named, in any file, so
-- the final state is whatever this script defines.
drop policy if exists "Enable read access for all users"                                            on public.comments;
drop policy if exists "Public published comments are viewable by everyone"                           on public.comments;
drop policy if exists "Authenticated users can read own ops submissions"                             on public.comments;
drop policy if exists "Authenticated users can read moderation receipts for own ops submissions"     on public.comments;
drop policy if exists "Admins can read all ops submissions"                                          on public.comments;
drop policy if exists "Enable insert for authenticated users only"                                   on public.comments;
drop policy if exists "Enable update for users based on user_id"                                     on public.comments;
drop policy if exists "Enable delete for users based on user_id"                                     on public.comments;
drop policy if exists "Users can delete their own comments"                                          on public.comments;
drop policy if exists "Users can delete own comments OR admins can delete any"                       on public.comments;
drop policy if exists "comments_select_public"                                                       on public.comments;
drop policy if exists "comments_select_own_ops"                                                      on public.comments;
drop policy if exists "comments_select_receipts_for_me"                                              on public.comments;
drop policy if exists "comments_select_admin_ops"                                                    on public.comments;
drop policy if exists "comments_insert_self"                                                         on public.comments;
drop policy if exists "comments_insert_moderation_admin_only"                                        on public.comments;
drop policy if exists "comments_update_own"                                                          on public.comments;
drop policy if exists "comments_delete_own_or_admin"                                                 on public.comments;

-- SELECT: public comments (album_id <> 0) readable by anyone.
create policy "comments_select_public"
on public.comments
for select
to public
using ( album_id is distinct from 0 );

-- SELECT: a contributor sees their own ops-queue rows.
create policy "comments_select_own_ops"
on public.comments
for select
to authenticated
using (
  album_id = 0
  and auth.uid() = user_id
);

-- SELECT: a contributor sees moderation receipts that explicitly target
-- their user id.  The LIKE matching is unavoidable without a schema
-- change (content is a text column), but combined with the
-- moderation-insert policy below, only admins can write rows that
-- satisfy this filter, so the LIKE cannot be weaponised by peers.
create policy "comments_select_receipts_for_me"
on public.comments
for select
to authenticated
using (
  album_id = 0
  and content like '\_\_mathclass\_ops\_\_::%' escape '\'
  and content like '%"kind":"moderation"%'
  and content like ('%"targetUserId":"' || auth.uid()::text || '"%')
);

-- SELECT: admins can read every ops-queue row (needed by ModerationCenter).
create policy "comments_select_admin_ops"
on public.comments
for select
to authenticated
using (
  album_id = 0
  and public.is_admin()
);

-- INSERT: a user can only insert rows where user_id = auth.uid(), AND
-- moderation envelopes are admin-only.  This is the key hardening: a
-- regular user can no longer forge `__mathclass_ops__::{"kind":"moderation",...}`
-- rows that satisfy `comments_select_receipts_for_me`.
create policy "comments_insert_self"
on public.comments
for insert
to authenticated
with check (
  auth.uid() = user_id
  and (
    -- Regular comment (any album_id <> 0): unrestricted content.
    album_id is distinct from 0
    or
    -- Ops-queue, non-moderation envelope: anyone may submit gallery /
    -- resource drafts so long as the moderation marker is absent.
    (
      album_id = 0
      and content not like '%"kind":"moderation"%'
    )
    or
    -- Ops-queue, moderation envelope: admins only.
    (
      album_id = 0
      and content like '%"kind":"moderation"%'
      and public.is_admin()
    )
  )
);

-- UPDATE: only the row owner, and they cannot change ownership or
-- escalate a row into a moderation envelope.
create policy "comments_update_own"
on public.comments
for update
to authenticated
using ( auth.uid() = user_id )
with check (
  auth.uid() = user_id
  and (
    album_id is distinct from 0
    or content not like '%"kind":"moderation"%'
    or public.is_admin()
  )
);

-- DELETE: row owner or admin.
create policy "comments_delete_own_or_admin"
on public.comments
for delete
to authenticated
using (
  auth.uid() = user_id
  or public.is_admin()
);

-- =========================================================================
-- 4. albums / album_photos / resources
--    Public SELECT stays open (these are the published surface);
--    write operations are admin-only and route through is_admin().
-- =========================================================================
alter table public.albums       enable row level security;
alter table public.album_photos enable row level security;
alter table public.resources    enable row level security;

drop policy if exists "Public albums are viewable by everyone"        on public.albums;
drop policy if exists "Admins can manage albums"                       on public.albums;
drop policy if exists "albums_select_public"                           on public.albums;
drop policy if exists "albums_admin_write"                             on public.albums;

create policy "albums_select_public"
on public.albums
for select
to public
using ( true );

create policy "albums_admin_write"
on public.albums
for all
to authenticated
using       ( public.is_admin() )
with check  ( public.is_admin() );

drop policy if exists "Public album photos are viewable by everyone"  on public.album_photos;
drop policy if exists "Admins can manage album photos"                 on public.album_photos;
drop policy if exists "album_photos_select_public"                     on public.album_photos;
drop policy if exists "album_photos_admin_write"                       on public.album_photos;

create policy "album_photos_select_public"
on public.album_photos
for select
to public
using ( true );

create policy "album_photos_admin_write"
on public.album_photos
for all
to authenticated
using       ( public.is_admin() )
with check  ( public.is_admin() );

drop policy if exists "Public resources are viewable by everyone"     on public.resources;
drop policy if exists "Admins can manage resources"                    on public.resources;
drop policy if exists "resources_select_public"                        on public.resources;
drop policy if exists "resources_admin_write"                          on public.resources;

create policy "resources_select_public"
on public.resources
for select
to public
using ( true );

create policy "resources_admin_write"
on public.resources
for all
to authenticated
using       ( public.is_admin() )
with check  ( public.is_admin() );

-- =========================================================================
-- 5. anon role grants (defense in depth).
--    Supabase's PostgREST exposes whatever the anon role has table
--    privileges on, gated by RLS.  We want anon to be able to SELECT
--    the published surfaces only, never write anywhere.
-- =========================================================================
revoke all on public.profiles      from anon;
revoke all on public.comments      from anon;
revoke all on public.albums        from anon;
revoke all on public.album_photos  from anon;
revoke all on public.resources     from anon;

-- comments: column-level grant — anon must NOT read user_email (PII: the
-- student-id mailboxes of the whole class).  RLS already hides ops rows
-- (album_id = 0) from anon, but public comment rows would otherwise expose
-- every commenter's email via a direct PostgREST `select=user_email` call.
-- NOTE: with column-level privileges a bare `select=*` fails for anon, so
-- the frontend requests these columns explicitly (see Comments.jsx).
grant select (id, album_id, content, user_id, user_nickname, created_at)
  on public.comments to anon;
grant select on public.albums       to anon;
grant select on public.album_photos to anon;
grant select on public.resources    to anon;

-- Authenticated retains full DML; RLS policies above are what actually
-- constrain behaviour.
grant select, insert, update, delete on public.comments      to authenticated;
grant select, insert, update, delete on public.albums        to authenticated;
grant select, insert, update, delete on public.album_photos  to authenticated;
grant select, insert, update, delete on public.resources     to authenticated;
grant select, update                 on public.profiles      to authenticated;
