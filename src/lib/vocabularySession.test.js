import { describe, expect, it } from 'vitest'
import { estimateSessionMinutes, selectNewWordPreview, selectSessionQueue } from './vocabularySession'

const queue = [
  { word: { id: 'new-1' }, isNew: true },
  { word: { id: 'due-1' }, isNew: false },
  { word: { id: 'new-2' }, isNew: true },
  { word: { id: 'due-2' }, isNew: false },
]

describe('vocabulary session shaping', () => {
  it('previews only genuinely new words', () => {
    expect(selectNewWordPreview(queue).map((item) => item.word.id)).toEqual(['new-1', 'new-2'])
  })

  it('builds weakness sessions from due review cards only', () => {
    expect(selectSessionQueue(queue, 'weak').map((item) => item.word.id)).toEqual(['due-1', 'due-2'])
  })

  it('keeps a useful minimum duration readout for short sessions', () => {
    expect(estimateSessionMinutes([])).toBe(2)
    expect(estimateSessionMinutes(new Array(10))).toBe(5)
  })
})
