// Supabase persistence for the SRS vocabulary trainer's review_states table.
//
// Mirrors the graceful-degradation contract used across this repo's backends:
//   - mode 'disabled' : Supabase not configured (anon env missing)
//   - mode 'compat'   : table not created yet (run setup_vocabulary.sql)
//   - mode 'official' : table present, data flows
// review_states is per-user and RLS-guarded (a user may only see/write their own
// rows). The shared-Supabase red line applies: the RLS policy lives in
// setup_vocabulary.sql and must stay aligned with harden_rls.sql.

import { isSupabaseConfigured, supabase } from './supabase'

export const REVIEW_STATES_TABLE = 'review_states'

export function isMissingTableError(error) {
  return error?.code === 'PGRST205' || `${error?.message || ''}`.toLowerCase().includes('schema cache')
}

/**
 * Fetch the user's review states as a map keyed by word_id.
 * Returns { mode, states } where states is {} unless mode === 'official'.
 */
export async function fetchReviewStateMap(userId) {
  if (!isSupabaseConfigured || !supabase) {
    return { mode: 'disabled', states: {} }
  }
  if (!userId) {
    return { mode: 'official', states: {} }
  }

  const { data, error } = await supabase
    .from(REVIEW_STATES_TABLE)
    .select('user_id, word_id, proficiency_level, next_review_at, streak_count, last_result')
    .eq('user_id', userId)

  if (error) {
    if (isMissingTableError(error)) {
      return { mode: 'compat', states: {} }
    }
    throw error
  }

  const states = {}
  for (const row of data || []) {
    states[row.word_id] = row
  }
  return { mode: 'official', states }
}

/**
 * Upsert a single review state (conflict target: user_id + word_id).
 * Returns { mode, state }.
 */
export async function saveReviewState(state) {
  if (!isSupabaseConfigured || !supabase) {
    return { mode: 'disabled', state }
  }
  if (!state?.user_id || !state?.word_id) {
    throw new Error('saveReviewState: user_id and word_id are required.')
  }

  const row = {
    user_id: state.user_id,
    word_id: state.word_id,
    proficiency_level: state.proficiency_level ?? 0,
    next_review_at: state.next_review_at,
    streak_count: state.streak_count ?? 0,
    last_result: state.last_result ?? null,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from(REVIEW_STATES_TABLE)
    .upsert(row, { onConflict: 'user_id,word_id' })
    .select()
    .single()

  if (error) {
    if (isMissingTableError(error)) {
      return { mode: 'compat', state }
    }
    throw error
  }

  return { mode: 'official', state: data }
}
