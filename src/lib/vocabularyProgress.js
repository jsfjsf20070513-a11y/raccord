// Export / import of a user's personal SRS progress (review_states rows).
//
// Pure (no fs / no Supabase / no Date.now) so it is unit tested directly. The
// page handles the actual download / file read and hands the text here; the
// backend handles the upsert. user_id is intentionally NOT trusted from an
// imported file — the caller re-stamps it to the current signed-in user.

import { clampStage } from './srsScheduler'

export const PROGRESS_EXPORT_VERSION = 1

/**
 * Serialize review states to a portable JSON string. `exportedAt` is passed in
 * (keep this function pure) — the page supplies new Date().toISOString().
 */
export function serializeProgress(states = [], { exportedAt = null } = {}) {
  const rows = states.map((s) => ({
    word_id: s.word_id,
    proficiency_level: s.proficiency_level ?? 0,
    next_review_at: s.next_review_at,
    streak_count: s.streak_count ?? 0,
    last_result: s.last_result ?? null,
  }))
  return JSON.stringify({ version: PROGRESS_EXPORT_VERSION, exportedAt, states: rows }, null, 2)
}

function validRow(raw) {
  const errors = []
  const word_id = `${raw?.word_id ?? ''}`.trim()
  if (!word_id) errors.push('缺少 word_id')

  if (raw?.next_review_at && Number.isNaN(new Date(raw.next_review_at).getTime())) {
    errors.push('next_review_at 不是合法日期')
  }
  if (raw?.last_result != null && raw.last_result !== 'correct' && raw.last_result !== 'wrong') {
    errors.push('last_result 只能是 correct/wrong/null')
  }
  return { word_id, errors }
}

/**
 * Parse + validate an exported progress file. Accepts either the {version,states}
 * envelope or a bare array of rows. Returns { rows, report } where rows are the
 * accepted, normalized states (deduped by word_id, last one wins) and report is
 * { total, accepted, rejected:[{index,word_id,errors}] }. Throws only on invalid
 * JSON (caller surfaces that to the user).
 */
export function parseProgressImport(text) {
  const parsed = JSON.parse(text)
  const rawRows = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.states) ? parsed.states : []

  const byId = new Map()
  const rejected = []

  rawRows.forEach((raw, index) => {
    const { word_id, errors } = validRow(raw)
    if (errors.length) {
      rejected.push({ index, word_id, errors })
      return
    }
    byId.set(word_id, {
      word_id,
      proficiency_level: clampStage(raw.proficiency_level ?? 0),
      next_review_at: raw.next_review_at || null,
      streak_count: Number.isFinite(raw.streak_count) ? raw.streak_count : 0,
      last_result: raw.last_result ?? null,
    })
  })

  const rows = [...byId.values()]
  return {
    rows,
    report: { total: rawRows.length, accepted: rows.length, rejected },
  }
}
