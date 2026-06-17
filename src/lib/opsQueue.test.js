import { describe, it, expect } from 'vitest'
import {
  parseOpsSubmission,
  normalizeResourcePayload,
  normalizeGalleryPayload,
  getSubmitterName,
  OPS_QUEUE_ALBUM_ID,
  OPS_QUEUE_KINDS,
} from './opsQueue'

// Red line: the ops queue smuggles moderation/gallery/resource records through
// the `comments` table as a `__mathclass_ops__::{json}` envelope on album_id 0
// ("text-as-protocol"). parseOpsSubmission is the decoder; it must reject
// anything that is not a well-formed envelope WITHOUT throwing, so a malformed
// or spoofed row can never masquerade as a real submission in the UI.

const PREFIX = '__mathclass_ops__::'

function opsRow(overrides = {}) {
  return {
    id: 'row-1',
    album_id: OPS_QUEUE_ALBUM_ID,
    content: `${PREFIX}${JSON.stringify({ version: 1, kind: 'gallery', payload: { title: 'T' } })}`,
    created_at: '2026-01-01T00:00:00Z',
    user_id: 'u1',
    user_email: 'u1@example.com',
    user_nickname: 'Nick',
    ...overrides,
  }
}

describe('parseOpsSubmission — rejection paths', () => {
  it('rejects null / undefined rows', () => {
    expect(parseOpsSubmission(null)).toBeNull()
    expect(parseOpsSubmission(undefined)).toBeNull()
  })

  it('rejects rows on a non-zero album_id (not the ops queue)', () => {
    expect(parseOpsSubmission(opsRow({ album_id: 1 }))).toBeNull()
  })

  it('rejects non-string content', () => {
    expect(parseOpsSubmission(opsRow({ content: 12345 }))).toBeNull()
    expect(parseOpsSubmission(opsRow({ content: null }))).toBeNull()
  })

  it('rejects plain comments that lack the ops prefix', () => {
    expect(parseOpsSubmission(opsRow({ content: 'just a normal comment' }))).toBeNull()
  })

  it('returns null (does not throw) on malformed JSON after the prefix', () => {
    const row = opsRow({ content: `${PREFIX}{not valid json` })
    expect(() => parseOpsSubmission(row)).not.toThrow()
    expect(parseOpsSubmission(row)).toBeNull()
  })

  it('rejects an envelope missing kind or payload', () => {
    expect(parseOpsSubmission(opsRow({ content: `${PREFIX}${JSON.stringify({ payload: {} })}` }))).toBeNull()
    expect(parseOpsSubmission(opsRow({ content: `${PREFIX}${JSON.stringify({ kind: 'gallery' })}` }))).toBeNull()
  })
})

describe('parseOpsSubmission — happy path', () => {
  it('decodes a well-formed envelope and maps row metadata', () => {
    const parsed = parseOpsSubmission(opsRow())
    expect(parsed).toMatchObject({
      id: 'row-1',
      kind: 'gallery',
      payload: { title: 'T' },
      userId: 'u1',
      userEmail: 'u1@example.com',
      authorName: 'Nick',
    })
    expect(parsed.raw).toBeDefined()
  })

  it('falls back author name: nickname → email → 未署名', () => {
    expect(parseOpsSubmission(opsRow({ user_nickname: '' })).authorName).toBe('u1@example.com')
    expect(parseOpsSubmission(opsRow({ user_nickname: '', user_email: '' })).authorName).toBe('未署名')
  })

  it('round-trips a moderation envelope', () => {
    const payload = { targetId: 't1', targetUserId: 'victim', state: 'published' }
    const row = opsRow({
      content: `${PREFIX}${JSON.stringify({ version: 1, kind: OPS_QUEUE_KINDS.moderation, payload })}`,
    })
    const parsed = parseOpsSubmission(row)
    expect(parsed.kind).toBe('moderation')
    expect(parsed.payload).toEqual(payload)
  })
})

describe('normalizeResourcePayload — write-path URL sanitizing', () => {
  it('drops a dangerous URL to empty string', () => {
    expect(normalizeResourcePayload({ url: 'javascript:alert(1)' }).url).toBe('')
    expect(normalizeResourcePayload({ url: 'data:text/html,x' }).url).toBe('')
  })

  it('keeps a valid absolute URL', () => {
    expect(normalizeResourcePayload({ url: 'https://example.com' }).url).toBe('https://example.com')
  })

  it('trims text fields', () => {
    const out = normalizeResourcePayload({ category: '  c ', title: ' t ', tag: ' x ', description: ' d ' })
    expect(out).toMatchObject({ category: 'c', title: 't', tag: 'x', description: 'd' })
  })
})

describe('normalizeGalleryPayload', () => {
  it('parses a newline photo list and drops blank lines', () => {
    const out = normalizeGalleryPayload({ title: 'A', photos: 'a.jpg\n\n  b.jpg \n' })
    expect(out.photos).toEqual(['a.jpg', 'b.jpg'])
  })

  it('defaults cover to the first photo when none given', () => {
    expect(normalizeGalleryPayload({ photos: ['x.jpg', 'y.jpg'] }).cover).toBe('x.jpg')
  })

  it('keeps an explicit cover', () => {
    expect(normalizeGalleryPayload({ cover: 'c.jpg', photos: ['x.jpg'] }).cover).toBe('c.jpg')
  })
})

describe('getSubmitterName', () => {
  it('prefers nickname, then email, then 同学', () => {
    expect(getSubmitterName({ user_metadata: { nickname: 'Nia' }, email: 'e@x.com' })).toBe('Nia')
    expect(getSubmitterName({ email: 'e@x.com' })).toBe('e@x.com')
    expect(getSubmitterName({})).toBe('同学')
  })
})
