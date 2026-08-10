import { describe, expect, it } from 'vitest'
import {
  CHAPTER_TIME_SCALE,
  FOUCAULT_SCHEMA_VERSION,
  REVEAL_THRESHOLD_DEG,
  apparentAngleDegAt,
  createDormantState,
  driftDegAt,
  observeState,
  parseStoredState,
  phaseAt,
  releaseState,
  serializeState,
} from './foucaultState'

const T0 = 1_784_900_000_000

describe('foucaultState', () => {
  it('dormant → released happens exactly once', () => {
    const dormant = createDormantState()
    expect(phaseAt(dormant, T0)).toBe('dormant')

    const released = releaseState(dormant, 42, T0)
    expect(released.releaseDirectionDeg).toBeCloseTo(42)
    expect(released.releasedAt).toBe(T0)
    expect(phaseAt(released, T0)).toBe('released')

    const again = releaseState(released, 300, T0 + 5_000)
    expect(again).toBe(released)
  })

  it('pointer updates after release never change the initial direction', () => {
    const released = releaseState(createDormantState(), 130, T0)
    const observed = observeState(released, T0 + 60_000)
    expect(observed.releaseDirectionDeg).toBeCloseTo(130)
    expect(observed.releasedAt).toBe(T0)
    expect(observed.lastObservedAt).toBe(T0 + 60_000)
  })

  it('clock is injected: same timestamps give the same deterministic result', () => {
    const a = releaseState(createDormantState(), 90, T0)
    const later = T0 + 10 * 60_000
    const angleA = apparentAngleDegAt(a, later)
    const roundTrip = parseStoredState(serializeState(a), later)
    const angleB = apparentAngleDegAt(roundTrip, later)
    expect(angleA).toBeCloseTo(angleB, 10)
    expect(driftDegAt(a, later)).toBeCloseTo(driftDegAt(roundTrip, later), 10)
  })

  it('corrupt or future-version storage fail-safes to dormant', () => {
    expect(phaseAt(parseStoredState('not json{', T0), T0)).toBe('dormant')
    expect(phaseAt(parseStoredState(JSON.stringify({ version: 99 }), T0), T0)).toBe('dormant')
    expect(
      phaseAt(
        parseStoredState(
          JSON.stringify({ version: FOUCAULT_SCHEMA_VERSION, chapterTimeScale: Number.NaN }),
          T0,
        ),
        T0,
      ),
    ).toBe('dormant')
    const negative = JSON.stringify({
      version: FOUCAULT_SCHEMA_VERSION,
      chapterTimeScale: CHAPTER_TIME_SCALE,
      releaseDirectionDeg: 10,
      releasedAt: -5,
      lastObservedAt: -5,
    })
    expect(phaseAt(parseStoredState(negative, T0), T0)).toBe('dormant')
    const farFuture = JSON.stringify({
      version: FOUCAULT_SCHEMA_VERSION,
      chapterTimeScale: CHAPTER_TIME_SCALE,
      releaseDirectionDeg: 10,
      releasedAt: T0 + 3_600_000,
      lastObservedAt: T0 + 3_600_000,
    })
    expect(phaseAt(parseStoredState(farFuture, T0), T0)).toBe('dormant')
  })

  it('never fabricates revealed without a release', () => {
    const halfState = JSON.stringify({
      version: FOUCAULT_SCHEMA_VERSION,
      chapterTimeScale: CHAPTER_TIME_SCALE,
      releaseDirectionDeg: 200,
      releasedAt: null,
      lastObservedAt: T0,
    })
    const parsed = parseStoredState(halfState, T0)
    expect(phaseAt(parsed, T0)).toBe('dormant')
    expect(parsed.releaseDirectionDeg).toBeNull()
  })

  it('leaving and returning derives the same state from timestamps', () => {
    const released = releaseState(createDormantState(), 75, T0)
    const stored = serializeState(observeState(released, T0 + 30_000))
    const away = 45 * 60_000
    const back = parseStoredState(stored, T0 + away)
    expect(back.releasedAt).toBe(T0)
    const expectedDrift = 11.327 * (away / 3_600_000) * CHAPTER_TIME_SCALE
    expect(driftDegAt(back, T0 + away)).toBeCloseTo(expectedDrift, 1)
    expect(phaseAt(back, T0 + away)).toBe('revealed')
    expect(driftDegAt(back, T0 + 10_000)).toBeLessThan(REVEAL_THRESHOLD_DEG)
  })

  it('does not touch Poincaré namespaces', () => {
    const source = [
      serializeState(createDormantState()),
      JSON.stringify(releaseState(createDormantState(), 10, T0)),
    ].join(' ')
    expect(source.includes('poincare')).toBe(false)
    expect(source.includes('carnet_world')).toBe(false)
  })
})
