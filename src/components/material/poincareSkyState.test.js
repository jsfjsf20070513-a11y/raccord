import { describe, expect, it } from 'vitest'
import {
  POINCARE_MEMORY_LIMIT,
  POINCARE_SKY_STORAGE_KEY,
  applyPoincareEvent,
  createPoincareArtifact,
  readPoincareArtifact,
  storePoincareArtifact,
} from './poincareSkyState'

function memoryStorage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
}

describe('poincare chapter artifact', () => {
  it('persists the selected initial condition', () => {
    const storage = memoryStorage()
    const changed = applyPoincareEvent(createPoincareArtifact(), {
      type: 'seed.changed',
      seed: { x: 0.62, y: 0.31 },
    })
    storePoincareArtifact(changed, storage)
    expect(storage.getItem(POINCARE_SKY_STORAGE_KEY)).toContain('0.62')
    expect(readPoincareArtifact(storage).seed).toEqual({ x: 0.62, y: 0.31 })
  })

  it('keeps a bounded manuscript memory and ignores duplicate placements', () => {
    let artifact = createPoincareArtifact()
    for (let index = 0; index < POINCARE_MEMORY_LIMIT + 3; index += 1) {
      artifact = applyPoincareEvent(artifact, {
        type: 'seed.committed',
        at: index + 1,
        seed: { x: 0.2 + index * 0.03, y: 0.5 },
      })
    }
    expect(artifact.memory).toHaveLength(POINCARE_MEMORY_LIMIT)
    const duplicate = applyPoincareEvent(artifact, {
      type: 'seed.committed',
      at: 99,
      seed: artifact.memory.at(-1).seed,
    })
    expect(duplicate.memory).toEqual(artifact.memory)
  })

  it('records one irreversible scar while counting later crossings', () => {
    let artifact = applyPoincareEvent(createPoincareArtifact(), {
      type: 'threshold.crossed',
      at: 10,
      progress: 0.64,
      divergence: 21,
    })
    const firstScar = artifact.scar
    artifact = applyPoincareEvent(artifact, {
      type: 'threshold.crossed',
      at: 20,
      progress: 0.72,
      divergence: 42,
    })
    expect(artifact.thresholdCrossings).toBe(2)
    expect(artifact.scar).toEqual(firstScar)
  })
})
