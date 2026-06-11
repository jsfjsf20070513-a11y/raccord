import { supabase, isSupabaseConfigured, SUPABASE_MISSING_MESSAGE } from './supabase'
import { publishOfficialContent, removeOfficialContent } from './contentBackend'
import { sanitizeExternalUrl } from './urlSafety'

export const OPS_QUEUE_ALBUM_ID = 0

const OPS_QUEUE_PREFIX = '__mathclass_ops__::'

export const OPS_QUEUE_KINDS = {
  gallery: 'gallery',
  resource: 'resource',
  moderation: 'moderation',
}

function buildKindLikePattern(kind) {
  return `${OPS_QUEUE_PREFIX}%"kind":"${kind}"%`
}

function buildTargetUserLikePattern(userId) {
  return `%"targetUserId":"${userId}"%`
}

function trimValue(value = '') {
  return `${value}`.trim()
}

function parsePhotoInput(value = '') {
  return trimValue(value)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function normalizePhotoList(value = []) {
  if (Array.isArray(value)) {
    return value.map((item) => trimValue(item)).filter(Boolean)
  }

  return parsePhotoInput(value)
}

function buildOpsEnvelope(kind, payload) {
  return `${OPS_QUEUE_PREFIX}${JSON.stringify({
    version: 1,
    kind,
    payload,
  })}`
}

function buildModerationSnapshot(targetSubmission) {
  const payload = targetSubmission?.payload || {}

  if (targetSubmission?.kind === OPS_QUEUE_KINDS.gallery) {
    return {
      title: payload.title || '未命名相册',
      excerpt: payload.description || '暂无简介',
    }
  }

  if (targetSubmission?.kind === OPS_QUEUE_KINDS.resource) {
    return {
      title: payload.title || '未命名资源',
      excerpt: payload.description || '暂无说明',
    }
  }

  return {
    title: '未命名条目',
    excerpt: '暂无内容',
  }
}

function buildModerationPayload(targetSubmission, state) {
  const snapshot = buildModerationSnapshot(targetSubmission)

  return {
    targetId: targetSubmission.id,
    targetKind: targetSubmission.kind,
    targetUserId: targetSubmission.userId || null,
    targetAuthorName: targetSubmission.authorName || '未署名',
    state,
    title: snapshot.title,
    excerpt: snapshot.excerpt,
  }
}

function isAdminRole(role) {
  return role === 'admin' || role === 'super_admin'
}

async function loadUserRole(user) {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    const details = `${error.message || ''} ${error.details || ''} ${error.hint || ''}`.toLowerCase()
    if (error.code === 'PGRST205' || details.includes('schema cache')) {
      throw new Error('管理员权限表还没有建立，请先在 Supabase 执行管理员初始化脚本。')
    }

    throw new Error(error.message || '无法验证当前账号的审核权限。')
  }

  return data?.role || 'user'
}

async function ensureModerationActor(user) {
  if (!user) {
    throw new Error('请先登录后再执行审核操作。')
  }

  if (!isSupabaseConfigured || !supabase) {
    throw new Error(SUPABASE_MISSING_MESSAGE)
  }

  const role = await loadUserRole(user)
  if (!isAdminRole(role)) {
    throw new Error('当前账号没有审核发布权限。')
  }

  return role
}

function ensureOfficialPublishReady(result, targetLabel) {
  if (result?.mode === 'official') {
    return
  }

  throw new Error(`正式${targetLabel}表还没有建立，暂时不能发布。请先在 Supabase 执行建表脚本。`)
}

export function getSubmitterName(user) {
  return user?.user_metadata?.nickname || user?.email || '同学'
}

export function normalizeGalleryPayload(form) {
  const photos = normalizePhotoList(form.photos)

  return {
    title: trimValue(form.title),
    date: trimValue(form.date),
    location: trimValue(form.location),
    cover: trimValue(form.cover) || photos[0] || '',
    description: trimValue(form.description),
    photos,
  }
}

export function normalizeResourcePayload(form) {
  return {
    category: trimValue(form.category),
    title: trimValue(form.title),
    url: sanitizeExternalUrl(form.url),
    tag: trimValue(form.tag),
    description: trimValue(form.description),
  }
}

export function parseOpsSubmission(row) {
  if (!row || Number(row.album_id) !== OPS_QUEUE_ALBUM_ID || typeof row.content !== 'string') {
    return null
  }

  if (!row.content.startsWith(OPS_QUEUE_PREFIX)) {
    return null
  }

  try {
    const envelope = JSON.parse(row.content.slice(OPS_QUEUE_PREFIX.length))

    if (!envelope?.kind || !envelope?.payload) {
      return null
    }

    return {
      id: row.id,
      kind: envelope.kind,
      payload: envelope.payload,
      createdAt: row.created_at,
      userId: row.user_id,
      userEmail: row.user_email,
      authorName: row.user_nickname || row.user_email || '未署名',
      raw: row,
    }
  } catch (error) {
    console.warn('Failed to parse ops submission:', error)
    return null
  }
}

export async function fetchOpsSubmissions({ userId = '', kind = '', targetUserId = '' } = {}) {
  if (!isSupabaseConfigured || !supabase) {
    return []
  }

  let query = supabase
    .from('comments')
    .select('*')
    .eq('album_id', OPS_QUEUE_ALBUM_ID)
    .order('created_at', { ascending: false })

  if (userId) {
    query = query.eq('user_id', userId)
  }

  if (kind) {
    query = query.like('content', buildKindLikePattern(kind))
  }

  if (targetUserId) {
    query = query.like('content', buildTargetUserLikePattern(targetUserId))
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return (data || [])
    .map(parseOpsSubmission)
    .filter(Boolean)
}

export async function submitOpsSubmission(kind, payload, user) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(SUPABASE_MISSING_MESSAGE)
  }

  if (!user) {
    throw new Error('请先登录后再提交到云端协作区。')
  }

  const { data, error } = await supabase
    .from('comments')
    .insert([{
      album_id: OPS_QUEUE_ALBUM_ID,
      content: buildOpsEnvelope(kind, payload),
      user_id: user.id,
      user_email: user.email,
      user_nickname: getSubmitterName(user),
      created_at: new Date().toISOString(),
    }])
    .select()
    .single()

  if (error) {
    throw error
  }

  return parseOpsSubmission(data)
}

export async function removeOpsSubmission(id, user, options = {}) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(SUPABASE_MISSING_MESSAGE)
  }

  const { asAdmin = false } = options

  let query = supabase
    .from('comments')
    .delete()
    .eq('id', id)
    .eq('album_id', OPS_QUEUE_ALBUM_ID)

  if (!asAdmin) {
    if (!user?.id) {
      throw new Error('请先登录后再删除协作稿。')
    }

    query = query.eq('user_id', user.id)
  }

  const { data, error } = await query.select('id')

  if (error) {
    throw error
  }

  if (!data?.length) {
    throw new Error(asAdmin ? '协作稿不存在，或已被其他审核员处理。' : '只能删除自己的协作稿。')
  }
}

export async function publishOpsSubmission(targetSubmission, user) {
  if (!targetSubmission?.id || !targetSubmission?.kind) {
    throw new Error('缺少要发布的协作稿信息。')
  }

  await ensureModerationActor(user)

  const officialResult = await publishOfficialContent(targetSubmission.kind, targetSubmission, user)
  ensureOfficialPublishReady(
    officialResult,
    targetSubmission.kind === OPS_QUEUE_KINDS.gallery ? '相册' : '资源',
  )
  const moderationEntry = await submitOpsSubmission(
    OPS_QUEUE_KINDS.moderation,
    buildModerationPayload(targetSubmission, 'published'),
    user,
  )

  return {
    moderationEntry,
    officialResult,
  }
}

export async function unpublishOpsSubmission(targetSubmission, user) {
  if (!targetSubmission?.id || !targetSubmission?.kind) {
    throw new Error('缺少要撤下的协作稿信息。')
  }

  await ensureModerationActor(user)

  const officialResult = await removeOfficialContent(targetSubmission.kind, targetSubmission)
  const moderationEntry = await submitOpsSubmission(
    OPS_QUEUE_KINDS.moderation,
    buildModerationPayload(targetSubmission, 'unpublished'),
    user,
  )

  return {
    officialResult,
    moderationEntry,
  }
}

export async function deleteOpsSubmission(targetSubmission, user) {
  if (!targetSubmission?.id || !targetSubmission?.kind) {
    throw new Error('缺少要删除的协作稿信息。')
  }

  await ensureModerationActor(user)

  const officialResult = await removeOfficialContent(targetSubmission.kind, targetSubmission)
  const moderationEntry = await submitOpsSubmission(
    OPS_QUEUE_KINDS.moderation,
    buildModerationPayload(targetSubmission, 'deleted'),
    user,
  )

  await removeOpsSubmission(targetSubmission.id, user, { asAdmin: true })

  return {
    officialResult,
    moderationEntry,
  }
}
