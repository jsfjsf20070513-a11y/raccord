-- 仅用于 Raccord 的新独立 Supabase 项目。先核对控制台项目，不在班级站执行。
-- 只建当前路由使用的表，不复制账号、个人记录、书目或旧相册数据。
-- 已有任一目标表就停止；不是补丁集合，也不能当作重复迁移脚本。
begin;

do $$
begin
  if exists (
    select 1 from pg_tables where schemaname = 'public'
      and tablename in ('profiles', 'review_states', 'ai_messages', 'resources', 'comments', 'testimonials')
  ) then
    raise exception '目标库已有应用表；停止初始化，请核对是否选中了 Raccord 新项目。';
  end if;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin', 'super_admin')),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy profiles_select_own on public.profiles for select to authenticated using (auth.uid() = id);

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id, role) values (new.id, 'user');
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- 角色由数据库维护，注册元数据不能指定管理员。
create function public.is_raccord_admin() returns boolean
language sql stable security invoker set search_path = '' as $$
  select exists(select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'super_admin'));
$$;
revoke all on function public.is_raccord_admin() from public, anon;
grant execute on function public.is_raccord_admin() to authenticated;

create table public.review_states (
  user_id uuid not null references auth.users(id) on delete cascade,
  word_id text not null,
  proficiency_level integer not null default 0 check (proficiency_level >= 0),
  streak_count integer not null default 0,
  last_result text check (last_result is null or last_result in ('correct', 'wrong')),
  next_review_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(user_id, word_id)
);
create index review_states_due_idx on public.review_states(user_id, next_review_at);
alter table public.review_states enable row level security;
create policy review_states_own on public.review_states for all to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.ai_messages (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'model')),
  content text not null check (char_length(content) <= 20000),
  created_at timestamptz not null default now()
);
create index ai_messages_user_idx on public.ai_messages(user_id, created_at);
alter table public.ai_messages enable row level security;
create policy ai_messages_select_own on public.ai_messages for select to authenticated using (auth.uid() = user_id);
create policy ai_messages_insert_own on public.ai_messages for insert to authenticated with check (auth.uid() = user_id);
create policy ai_messages_delete_own on public.ai_messages for delete to authenticated using (auth.uid() = user_id);

-- comments 只承担当前资源增补表单的私有队列，不恢复旧相册留言墙。
create function public.raccord_submission_kind(value text) returns text
language plpgsql immutable strict set search_path = '' as $$
declare envelope jsonb;
begin
  if left(value, char_length('__mathclass_ops__::')) <> '__mathclass_ops__::' then return null; end if;
  envelope := substring(value from char_length('__mathclass_ops__::') + 1)::jsonb;
  if jsonb_typeof(envelope) <> 'object' or jsonb_typeof(envelope->'payload') is distinct from 'object' then return null; end if;
  return envelope->>'kind';
exception when invalid_text_representation then return null;
end;
$$;
revoke all on function public.raccord_submission_kind(text) from public, anon;
grant execute on function public.raccord_submission_kind(text) to authenticated;

create table public.comments (
  id bigint generated always as identity primary key,
  album_id bigint not null default 0 check (album_id = 0),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text,
  user_nickname text,
  content text not null check (coalesce(public.raccord_submission_kind(content) in ('resource', 'moderation'), false)),
  created_at timestamptz not null default now()
);
create index comments_user_idx on public.comments(user_id, created_at);
alter table public.comments enable row level security;
create policy comments_select_scope on public.comments for select to authenticated
using (auth.uid() = user_id or public.is_raccord_admin());
create policy comments_insert_scope on public.comments for insert to authenticated
with check (auth.uid() = user_id and (public.raccord_submission_kind(content) = 'resource' or public.is_raccord_admin()));
create policy comments_delete_scope on public.comments for delete to authenticated
using ((auth.uid() = user_id and public.raccord_submission_kind(content) = 'resource') or public.is_raccord_admin());

create table public.resources (
  id bigint generated always as identity primary key,
  title text not null,
  category text,
  url text,
  tag text,
  description text,
  curator text,
  created_at timestamptz not null default now(),
  source_submission_id bigint unique,
  published_by uuid references auth.users(id) on delete set null
);
alter table public.resources enable row level security;
create policy resources_public on public.resources for select to anon, authenticated using (true);
create policy resources_admin on public.resources for all to authenticated
using (public.is_raccord_admin()) with check (public.is_raccord_admin());

-- 当前 Testimonials 路由只读取来源附录，没有新增、编辑入口。
create table public.testimonials (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 120),
  signature text not null default 'anonyme' check (char_length(signature) between 1 and 24),
  created_at timestamptz not null default now()
);
alter table public.testimonials enable row level security;
create policy testimonials_public on public.testimonials for select to anon, authenticated using (true);

revoke all on public.profiles, public.review_states, public.ai_messages,
  public.comments, public.resources, public.testimonials from public, anon, authenticated;
grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.review_states to authenticated;
grant select, insert, delete on public.ai_messages, public.comments to authenticated;
grant select on public.resources, public.testimonials to anon, authenticated;
grant insert, update, delete on public.resources to authenticated;

-- 只订阅现役公开书架；不发布个人表或私有队列。
do $$
begin
  if exists(select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.resources;
  end if;
end;
$$;
commit;
