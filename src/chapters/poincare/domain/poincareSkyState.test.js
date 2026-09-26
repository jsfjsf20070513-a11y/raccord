import { readPoincareArtifact, storePoincareArtifact } from '../persistence'
import { describe, expect, it } from 'vitest'
import {
  POINCARE_MEMORY_LIMIT,
  POINCARE_SKY_STORAGE_KEY,
  applyPoincareEvent,
  createPoincareArtifact,
} from './poincareSkyState.js'

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

  it('discovers distinct placements and an actual return to a different memory', () => {
    let artifact = applyPoincareEvent(createPoincareArtifact(), { type: 'seed.committed', id: 'a', seed: { x: 0.3, y: 0.5 } })
    expect(artifact.discoveries.placed).toBe(false)
    artifact = applyPoincareEvent(artifact, { type: 'seed.committed', id: 'b', seed: { x: 0.31, y: 0.5 } })
    expect(artifact.discoveries.placed).toBe(false)
    artifact = applyPoincareEvent(artifact, { type: 'seed.committed', id: 'c', seed: { x: 0.6, y: 0.5 } })
    expect(artifact.discoveries.placed).toBe(true)
    expect(applyPoincareEvent(artifact, { type: 'memory.recalled', id: 'missing' }).discoveries.recalled).toBe(false)
    expect(applyPoincareEvent(artifact, { type: 'memory.recalled', id: 'c' }).discoveries.recalled).toBe(false)
    artifact = applyPoincareEvent(artifact, { type: 'memory.recalled', id: 'a' })
    expect(artifact.seed).toEqual({ x: 0.3, y: 0.5 })
    expect(artifact.discoveries.recalled).toBe(true)
    expect(artifact.memory).toHaveLength(3)
  })

  it('records the furthest observation per starting point without inventing a scar', () => {
    const seed = { x: 0.325, y: 0.55 }
    let artifact = applyPoincareEvent(createPoincareArtifact({ seed }), { type: 'observation.recorded', progress: 0.5 })
    expect(artifact.discoveries.observed).toBe(false)
    artifact = applyPoincareEvent(artifact, { type: 'observation.recorded', progress: 0.2 })
    expect(artifact.memory[0].observedProgress).toBe(0.5)
    artifact = applyPoincareEvent(artifact, { type: 'observation.recorded', progress: 1 })
    expect(artifact.discoveries.observed).toBe(true)
    expect(artifact.memory).toHaveLength(1)
    expect(artifact.scar).toBeNull()
    expect(readPoincareArtifact({ getItem: () => JSON.stringify(artifact) })).toEqual(artifact)
  })

  it('keeps an interrupted run attached to its original seed, not a newly selected one', () => {
    let artifact = createPoincareArtifact({ seed: { x: 0.7, y: 0.5 } })
    artifact = applyPoincareEvent(artifact, { type: 'observation.recorded', seed: { x: 0.34, y: 0.5 }, progress: 0.5 })
    expect(artifact.seed).toEqual({ x: 0.7, y: 0.5 })
    expect(artifact.memory[0].seed).toEqual({ x: 0.34, y: 0.5 })
    expect(artifact.discoveries.observed).toBe(true)
  })

  it('migrates old records without treating unobserved futures as discoveries', () => {
    const old = createPoincareArtifact({ memory: [{ seed: { x: 0.4, y: 0.6 } }] })
    expect(old.memory[0].observedProgress).toBe(0)
    expect(old.discoveries).toEqual({ placed: false, recalled: false, observed: false })
    const malformed = createPoincareArtifact({ discoveries: { recalled: 'yes' }, memory: [{ observedProgress: NaN }] })
    expect(malformed.discoveries.recalled).toBe(false)
    expect(malformed.memory[0].observedProgress).toBe(0)
    const oldScar = createPoincareArtifact({ scar: { seed: { x: 0.325, y: 0.55 }, progress: 0.72 } })
    expect(oldScar.discoveries.observed).toBe(false)
  })
})
