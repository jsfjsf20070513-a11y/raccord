import { describe, expect, it, vi } from 'vitest'
import {
  HORIZON_STORAGE_KEY,
  createInitialHorizonState,
  horizonElapsedMs,
  isHorizonReleased,
  parseHorizonState,
  readHorizonState,
  releaseHorizon,
  writeHorizonState,
} from './horizonState'

describe('Horizon chapter state', () => {
  it('starts dormant and releases only once', () => {
    const dormant = createInitialHorizonState()
    const released = releaseHorizon(dormant, { directionDeg: -15, at: 1000 })
    const ignored = releaseHorizon(released, { directionDeg: 20, at: 2000 })

    expect(isHorizonReleased(dormant)).toBe(false)
    expect(released).toEqual({
      version: 1,
      releaseDirectionDeg: 345,
      releasedAt: 1000,
    })
    expect(ignored).toBe(released)
  })

  it('rejects malformed or foreign storage without throwing', () => {
    expect(parseHorizonState('{')).toEqual(createInitialHorizonState())
    expect(parseHorizonState({ version: 2 })).toEqual(createInitialHorizonState())
    expect(readHorizonState({
      getItem: () => {
        throw new Error('blocked')
      },
    })).toEqual(createInitialHorizonState())
  })

  it('fails safe for impossible release timestamps', () => {
    expect(parseHorizonState({
      version: 1,
      releaseDirectionDeg: 172.5,
      releasedAt: -1,
    })).toEqual(createInitialHorizonState())

    expect(parseHorizonState({
      version: 1,
      releaseDirectionDeg: 172.5,
      releasedAt: Date.now() + 60 * 60_000,
    })).toEqual(createInitialHorizonState())
  })

  it('persists only the real release fact, without an artistic time scale', () => {
    const storage = { setItem: vi.fn() }
    const state = releaseHorizon(createInitialHorizonState(), {
      directionDeg: 172.5,
      at: 1234,
    })

    expect(writeHorizonState(storage, state)).toBe(true)
    expect(storage.setItem).toHaveBeenCalledWith(
      HORIZON_STORAGE_KEY,
      JSON.stringify(state),
    )
    expect(JSON.parse(storage.setItem.mock.calls[0][1])).not.toHaveProperty('timeScale')
  })

  it('derives elapsed evidence from the release timestamp', () => {
    const state = releaseHorizon(createInitialHorizonState(), { at: 1000 })
    expect(horizonElapsedMs(state, 900)).toBe(0)
    expect(horizonElapsedMs(state, 3500)).toBe(2500)
  })
})
