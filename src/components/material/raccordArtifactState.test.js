import { describe, expect, it } from 'vitest'
import {
  RACCORD_ARTIFACT_STORAGE_KEY,
  RACCORD_SCAR_LIMIT,
  applyRaccordEvent,
  createRaccordArtifact,
  readRaccordArtifact,
  storeRaccordArtifact,
} from './raccordArtifactState'
import { RACCORD_LEGACY_STORAGE_KEY } from './raccordWorldMath'

function memoryStorage(entries = {}) {
  const values = new Map(Object.entries(entries))
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    value: (key) => values.get(key),
  }
}

describe('raccord artifact history', () => {
  it('migrates the legacy handle into a versioned artifact', () => {
    const storage = memoryStorage({
      [RACCORD_LEGACY_STORAGE_KEY]: JSON.stringify({ x: 0.66, y: 0.56 }),
    })
    const artifact = readRaccordArtifact(storage)
    expect(artifact.version).toBe(2)
    expect(artifact.handle).toEqual({ x: 0.66, y: 0.56 })
    expect(artifact.history.construction).toBeNull()
  })

  it('records the first honest C² completion and ignores repeats', () => {
    const initial = createRaccordArtifact({ handle: { x: 0.66, y: 0.56 } })
    const completed = applyRaccordEvent(initial, {
      type: 'construction.completed',
      grade: 'C²',
      curvatureJump: 0.002,
      at: 101,
    })
    const repeated = applyRaccordEvent(completed, {
      type: 'construction.completed',
      grade: 'C²',
      curvatureJump: 0,
      at: 202,
    })
    expect(completed.history.construction).toEqual({
      achievedAt: 101,
      handle: { x: 0.66, y: 0.56 },
      curvatureJump: 0.002,
    })
    expect(repeated.history.construction).toEqual(completed.history.construction)
  })

  it('rejects a tolerant C2 label when the handle is not exactly calibrated', () => {
    const initial = createRaccordArtifact({ handle: { x: 0.664, y: 0.56 } })
    const attempted = applyRaccordEvent(initial, {
      type: 'construction.completed',
      grade: 'C²',
      curvatureJump: 0.001,
      at: 10,
    })
    expect(attempted).toBe(initial)
    expect(attempted.history.construction).toBeNull()
  })

  it('keeps the maximum load and one scar per crossed test', () => {
    let artifact = createRaccordArtifact()
    artifact = applyRaccordEvent(artifact, {
      type: 'flight.tested',
      maxLoad: 0.72,
      crossedThreshold: false,
      at: 1,
    })
    artifact = applyRaccordEvent(artifact, {
      type: 'flight.tested',
      testId: 'test-01',
      maxLoad: 0.97,
      crossedThreshold: true,
      at: 2,
    })
    artifact = applyRaccordEvent(artifact, {
      type: 'flight.tested',
      testId: 'test-01',
      maxLoad: 1,
      crossedThreshold: true,
      at: 3,
    })
    expect(artifact.history.flight.maxLoad).toBe(1)
    expect(artifact.history.flight.thresholdCrossings).toBe(1)
    expect(artifact.history.flight.scars).toHaveLength(1)
    expect(artifact.history.flight.scars[0]).toMatchObject({
      id: 'test-01',
      at: 2,
      load: 1,
      handle: { x: 0.63, y: 0.69 },
    })
  })

  it('keeps the handle snapshot from the moment a threshold was crossed', () => {
    let artifact = createRaccordArtifact({ handle: { x: 0.62, y: 0.58 } })
    artifact = applyRaccordEvent(artifact, {
      type: 'flight.tested',
      testId: 'test-02',
      maxLoad: 0.95,
      crossedThreshold: true,
      at: 10,
    })
    artifact = applyRaccordEvent(artifact, { type: 'handle.changed', handle: { x: 0.7, y: 0.7 } })
    artifact = applyRaccordEvent(artifact, {
      type: 'flight.tested',
      testId: 'test-02',
      maxLoad: 0.99,
      crossedThreshold: true,
      at: 11,
    })
    expect(artifact.history.flight.scars[0].handle).toEqual({ x: 0.62, y: 0.58 })
  })

  it('caps visible scars while preserving the total crossing count', () => {
    let artifact = createRaccordArtifact()
    for (let index = 0; index < RACCORD_SCAR_LIMIT + 3; index += 1) {
      artifact = applyRaccordEvent(artifact, {
        type: 'flight.tested',
        testId: `test-${index}`,
        maxLoad: 1,
        crossedThreshold: true,
        at: index + 1,
      })
    }
    expect(artifact.history.flight.thresholdCrossings).toBe(RACCORD_SCAR_LIMIT + 3)
    expect(artifact.history.flight.scars).toHaveLength(RACCORD_SCAR_LIMIT)
  })

  it('persists only the normalized artifact shape', () => {
    const storage = memoryStorage()
    const stored = storeRaccordArtifact({ handle: { x: 99, y: -99 } }, storage)
    expect(stored.handle).toEqual({ x: 0.77, y: 0.28 })
    expect(JSON.parse(storage.value(RACCORD_ARTIFACT_STORAGE_KEY))).toEqual(stored)
  })

  it('fails safely when storage is malformed or unavailable', () => {
    const malformed = memoryStorage({ [RACCORD_ARTIFACT_STORAGE_KEY]: '{not-json' })
    expect(readRaccordArtifact(malformed)).toEqual(createRaccordArtifact())

    const blocked = {
      getItem: () => { throw new Error('blocked') },
      setItem: () => { throw new Error('blocked') },
    }
    expect(readRaccordArtifact(blocked)).toEqual(createRaccordArtifact())
    expect(storeRaccordArtifact({ handle: { x: 0.66, y: 0.56 } }, blocked).handle)
      .toEqual({ x: 0.66, y: 0.56 })
  })
})
