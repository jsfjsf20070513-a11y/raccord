-- setup_ai_history.sql
-- Creates `public.ai_messages` for the 班级 AI 助手 的账号级云端对话历史。
-- Idempotent: 可重复执行(CREATE 全部 IF NOT EXISTS,每条 CREATE POLICY 都配
-- DROP POLICY IF EXISTS)。不 DROP 任何已有对象。
--
-- ⚠ 共享 Supabase 红线:本仓与原班级站共用一个 Supabase 实例。ai_messages 是
-- per-user、自我隔离的——用户只能读/写/删 自己的行(auth.uid() = user_id)。
-- 与 harden_rls.sql 的口径保持一致,不要放松自我隔离守卫。本表与现有表无关联,
-- 仅新增,不改动 review_states / comments / albums 等任何现有表。

-- 1) Table -------------------------------------------------------------------
create table if not exists public.ai_messages (
  id         bigint generated always as identity primary key,
  user_id    uuid        not null references auth.users (id) on delete cascade,
  role       text        not null,
  content    text        not null,
  created_at timestamptz not null default now(),
  constraint ai_messages_role_check check (role in ('user', 'model')),
  constraint ai_messages_content_len check (char_length(content) <= 20000)
);

-- 按用户 + 时间取历史:where user_id = ? order by created_at
create index if not exists ai_messages_user_idx
  on public.ai_messages (user_id, created_at);

-- 2) Row-level security ------------------------------------------------------
alter table public.ai_messages enable row level security;

-- SELECT: 只读自己的行。
drop policy if exists "ai_messages_select_own" on public.ai_messages;
create policy "ai_messages_select_own"
on public.ai_messages
for select
using ( auth.uid() = user_id );

-- INSERT: 只能创建归属自己的行。
drop policy if exists "ai_messages_insert_own" on public.ai_messages;
create policy "ai_messages_insert_own"
on public.ai_messages
for insert
with check ( auth.uid() = user_id );

-- DELETE: 只能删自己的行(用于「清空历史」)。
drop policy if exists "ai_messages_delete_own" on public.ai_messages;
create policy "ai_messages_delete_own"
on public.ai_messages
for delete
using ( auth.uid() = user_id );

-- 不开放 UPDATE:对话历史只追加/清空,不原地改写。
