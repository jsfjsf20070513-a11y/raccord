-- Enable RLS for the comments table
alter table "public"."comments" enable row level security;

drop policy if exists "Enable read access for all users" on "public"."comments";
drop policy if exists "Public published comments are viewable by everyone" on "public"."comments";
drop policy if exists "Authenticated users can read own ops submissions" on "public"."comments";
drop policy if exists "Authenticated users can read moderation receipts for own ops submissions" on "public"."comments";
drop policy if exists "Enable insert for authenticated users only" on "public"."comments";
drop policy if exists "Enable update for users based on user_id" on "public"."comments";
drop policy if exists "Enable delete for users based on user_id" on "public"."comments";

-- Public comments stay readable, but the ops queue on album_id = 0 does not.
create policy "Public published comments are viewable by everyone"
on "public"."comments"
as permissive
for select
to public
using (
  album_id is distinct from 0
);

-- Contributors can still read their own ops submissions.
create policy "Authenticated users can read own ops submissions"
on "public"."comments"
as permissive
for select
to authenticated
using (
  album_id = 0
  and auth.uid() = user_id
);

-- Contributors can also read moderation receipts that explicitly target their submission.
create policy "Authenticated users can read moderation receipts for own ops submissions"
on "public"."comments"
as permissive
for select
to authenticated
using (
  album_id = 0
  and content like '%"kind":"moderation"%'
  and content like ('%"targetUserId":"' || auth.uid()::text || '"%')
);

-- Policy 2: Allow authenticated users to insert their own comments (INSERT)
-- This ensures that only logged-in users can post, and the user_id must match their own ID.
create policy "Enable insert for authenticated users only"
on "public"."comments"
as permissive
for insert
to authenticated
with check (
  auth.uid() = user_id
);

-- Policy 3: Allow users to update their own comments (UPDATE)
-- Users can only edit rows where the user_id matches their own ID.
create policy "Enable update for users based on user_id"
on "public"."comments"
as permissive
for update
to authenticated
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);

-- Policy 4: Allow users to delete their own comments (DELETE)
-- Users can only delete rows where the user_id matches their own ID.
create policy "Enable delete for users based on user_id"
on "public"."comments"
as permissive
for delete
to authenticated
using (
  auth.uid() = user_id
);
