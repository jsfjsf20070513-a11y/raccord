import { describe, it, expect } from 'vitest'
import {
  serializeProgress,
  parseProgressImport,
  PROGRESS_EXPORT_VERSION,
} from './vocabularyProgress'

describe('serializeProgress', () => {
  it('emits a versioned envelope and strips user_id', () => {
    const json = serializeProgress(
      [{ user_id: 'secret', word_id: 'fr-chat', proficiency_level: 2, next_review_at: '2026-06-20T00:00:00Z', streak_count: 3, last_result: 'correct' }],
      { exportedAt: '2026-06-17T00:00:00Z' },
    )
    const obj = JSON.parse(json)
    expect(obj.version).toBe(PROGRESS_EXPORT_VERSION)
    expect(obj.exportedAt).toBe('2026-06-17T00:00:00Z')
    expect(obj.states[0]).not.toHaveProperty('user_id')
    expect(obj.states[0]).toMatchObject({ word_id: 'fr-chat', proficiency_level: 2 })
  })
})

describe('parseProgressImport', () => {
  it('round-trips serialized progress', () => {
    const json = serializeProgress([
      { word_id: 'fr-chat', proficiency_level: 2, next_review_at: '2026-06-20T00:00:00Z', streak_count: 3, last_result: 'correct' },
    ])
    const { rows, report } = parseProgressImport(json)
    expect(report.accepted).toBe(1)
    expect(rows[0]).toMatchObject({ word_id: 'fr-chat', proficiency_level: 2, last_result: 'correct' })
  })

  it('accepts a bare array as well as the envelope', () => {
    const { report } = parseProgressImport(JSON.stringify([{ word_id: 'fr-x', proficiency_level: 0 }]))
    expect(report.accepted).toBe(1)
  })

  it('rejects rows without word_id and with bad fields', () => {
    const { rows, report } = parseProgressImport(JSON.stringify([
      { word_id: 'fr-ok', proficiency_level: 1 },
      { proficiency_level: 1 }, // no word_id
      { word_id: 'fr-bad', next_review_at: 'not-a-date' },
      { word_id: 'fr-bad2', last_result: 'maybe' },
    ]))
    expect(rows.map((r) => r.word_id)).toEqual(['fr-ok'])
    expect(report.rejected).toHaveLength(3)
  })

  it('clamps proficiency_level and dedupes by word_id (last wins)', () => {
    const { rows } = parseProgressImport(JSON.stringify([
      { word_id: 'fr-dup', proficiency_level: 99 },
      { word_id: 'fr-dup', proficiency_level: 3 },
    ]))
    expect(rows).toHaveLength(1)
    expect(rows[0].proficiency_level).toBe(3)
  })

  it('throws on invalid JSON', () => {
    expect(() => parseProgressImport('{not json')).toThrow()
  })
})
