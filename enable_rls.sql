-- =====================================================================
-- comments 表 RLS 策略（含审核伪造防御）
--
-- 这张表同时承载三类记录，靠 album_id 与 content 前缀区分：
--   (A) 普通相册留言:  album_id = 真实相册 id, content 是纯文本
--   (B) OPS 协作提交:  album_id = 0, content 以 '__mathclass_ops__::' 开头,
--                       kind 为 'gallery' | 'resource'
--   (C) 审核收据:      album_id = 0, content 以 '__mathclass_ops__::' 开头,
--                       kind 为 'moderation'
--
-- 风险：早期的 INSERT 策略只校验 auth.uid() = user_id，
-- 任何已登录用户都能直接写入 kind="moderation" 的伪造审核记录。
-- 虽然 SELECT 策略限制只能读到 targetUserId = 自己 的审核条目，
-- 攻击者只能"自欺欺人"，但前端审核中心会被脏数据污染，
-- 且面板对此类内容的信任假设是它"必由 admin 写入"。
--
-- 本脚本通过两步加固：
--   1) 提供 public.is_admin() 安全函数（SECURITY DEFINER + STABLE）
--      用于在 RLS 子句中判断当前会话是否管理员；
--   2) 在 INSERT / UPDATE 的 WITH CHECK 子句中区分三类记录，
--      moderation 类型只允许 admin 写入。
-- =====================================================================

alter table "public"."comments" enable row level security;

-- ---------------------------------------------------------------------
-- 1) is_admin() helper
-- ---------------------------------------------------------------------
-- 使用 SECURITY DEFINER 让 RLS 子句无需对 profiles 表设额外读权限即可
-- 查询当前用户角色；STABLE 让 PG 在单条 SQL 内复用结果，避免对每行
-- 评估时重复打 profiles 表。
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('admin', 'super_admin')
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------
-- 2) 清除历史策略，统一重建
-- ---------------------------------------------------------------------
drop policy if exists "Enable read access for all users" on "public"."comments";
drop policy if exists "Public published comments are viewable by everyone" on "public"."comments";
drop policy if exists "Authenticated users can read own ops submissions" on "public"."comments";
drop policy if exists "Authenticated users can read moderation receipts for own ops submissions" on "public"."comments";
drop policy if exists "Admins can read all ops submissions and moderation receipts" on "public"."comments";
drop policy if exists "Enable insert for authenticated users only" on "public"."comments";
drop policy if exists "Authenticated users can insert restricted comments" on "public"."comments";
drop policy if exists "Enable update for users based on user_id" on "public"."comments";
drop policy if exists "Authenticated users can update restricted comments" on "public"."comments";
drop policy if exists "Enable delete for users based on user_id" on "public"."comments";

-- ---------------------------------------------------------------------
-- 3) SELECT 策略
-- ---------------------------------------------------------------------

-- 公开留言：任何访客可读所有"非 OPS"的留言
create policy "Public published comments are viewable by everyone"
on "public"."comments"
as permissive
for select
to public
using (
  album_id is distinct from 0
);

-- 投稿者可以读自己提交的 OPS 草稿
create policy "Authenticated users can read own ops submissions"
on "public"."comments"
as permissive
for select
to authenticated
using (
  album_id = 0
  and auth.uid() = user_id
);

-- 投稿者可以读那些 targetUserId 是自己的审核收据
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

-- 管理员可以读所有 OPS 草稿与审核收据（用于后台审核中心）
create policy "Admins can read all ops submissions and moderation receipts"
on "public"."comments"
as permissive
for select
to authenticated
using (
  album_id = 0
  and public.is_admin()
);

-- ---------------------------------------------------------------------
-- 4) INSERT 策略（核心安全加固）
-- ---------------------------------------------------------------------
-- 三类记录分别用 WITH CHECK 表达式区分。`left(content, 19)` 精确匹配
-- OPS 前缀 '__mathclass_ops__::' (19 字符)，避免 LIKE 通配符歧义。
create policy "Authenticated users can insert restricted comments"
on "public"."comments"
as permissive
for insert
to authenticated
with check (
  auth.uid() = user_id
  and (
    -- (A) 普通留言：必须挂在真实相册下，且不能伪装成 OPS 前缀
    (
      album_id is distinct from 0
      and (content is null or left(content, 19) <> '__mathclass_ops__::')
    )
    -- (B) OPS gallery / resource 草稿：任意已登录用户可写，禁止 moderation 关键字
    or (
      album_id = 0
      and left(content, 19) = '__mathclass_ops__::'
      and content not like '%"kind":"moderation"%'
    )
    -- (C) 审核收据：仅管理员可写
    or (
      album_id = 0
      and left(content, 19) = '__mathclass_ops__::'
      and content like '%"kind":"moderation"%'
      and public.is_admin()
    )
  )
);

-- ---------------------------------------------------------------------
-- 5) UPDATE 策略（防止"正常 INSERT 后 UPDATE 篡改"绕过）
-- ---------------------------------------------------------------------
create policy "Authenticated users can update restricted comments"
on "public"."comments"
as permissive
for update
to authenticated
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
  and (
    (
      album_id is distinct from 0
      and (content is null or left(content, 19) <> '__mathclass_ops__::')
    )
    or (
      album_id = 0
      and left(content, 19) = '__mathclass_ops__::'
      and content not like '%"kind":"moderation"%'
    )
    or (
      album_id = 0
      and left(content, 19) = '__mathclass_ops__::'
      and content like '%"kind":"moderation"%'
      and public.is_admin()
    )
  )
);

-- ---------------------------------------------------------------------
-- 6) DELETE 策略
-- ---------------------------------------------------------------------
-- 普通用户删自己的；管理员可删任何 OPS 区记录（审核驳回流程）
create policy "Enable delete for users based on user_id"
on "public"."comments"
as permissive
for delete
to authenticated
using (
  auth.uid() = user_id
  or (album_id = 0 and public.is_admin())
);
