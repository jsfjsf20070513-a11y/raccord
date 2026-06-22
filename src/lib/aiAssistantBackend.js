// Supabase persistence for the 班级 AI 助手 conversation history (ai_messages).
//
// Mirrors the graceful-degradation contract used across this repo's backends:
//   - mode 'disabled' : Supabase not configured (anon env missing)
//   - mode 'compat'   : table not created yet (run setup_ai_history.sql)
//   - mode 'official' : table present, data flows
// ai_messages is per-user and RLS-guarded (a user may only read/insert/delete
// their own rows). Shared-Supabase red line: the RLS policy lives in
// setup_ai_history.sql and must keep the self-scope guards.

import { isSupabaseConfigured, supabase } from './supabase'

export const AI_MESSAGES_TABLE = 'ai_messages'

function isMissingTableError(error) {
  return error?.code === 'PGRST205' || `${error?.message || ''}`.toLowerCase().includes('schema cache')
}

/**
 * Load the user's saved conversation (chronological). Returns { mode, messages }
 * where messages is [] unless mode === 'official'. Each message is { role, content }.
 */
export async function fetchMessages(userId, limit = 200) {
  if (!isSupabaseConfigured || !supabase) return { mode: 'disabled', messages: [] }
  if (!userId) return { mode: 'official', messages: [] }

  const { data, error } = await supabase
    .from(AI_MESSAGES_TABLE)
    .select('role, content, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) {
    if (isMissingTableError(error)) return { mode: 'compat', messages: [] }
    throw error
  }
  return { mode: 'official', messages: (data || []).map((r) => ({ role: r.role, content: r.content })) }
}

/**
 * Append one message (role 'user' | 'model'). Best-effort: callers fire-and-forget.
 */
export async function saveMessage(userId, role, content) {
  if (!isSupabaseConfigured || !supabase) return { mode: 'disabled' }
  if (!userId || !content) return { mode: 'official' }

  const { error } = await supabase
    .from(AI_MESSAGES_TABLE)
    .insert({ user_id: userId, role: role === 'model' ? 'model' : 'user', content: `${content}`.slice(0, 20000) })

  if (error) {
    if (isMissingTableError(error)) return { mode: 'compat' }
    throw error
  }
  return { mode: 'official' }
}

/**
 * Delete all of the user's saved messages (the « 清空历史 » action).
 */
export async function clearMessages(userId) {
  if (!isSupabaseConfigured || !supabase) return { mode: 'disabled' }
  if (!userId) return { mode: 'official' }

  const { error } = await supabase.from(AI_MESSAGES_TABLE).delete().eq('user_id', userId)
  if (error) {
    if (isMissingTableError(error)) return { mode: 'compat' }
    throw error
  }
  return { mode: 'official' }
}
