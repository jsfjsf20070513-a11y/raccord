import { describe, expect, it } from 'vitest'
import {
  POINCARE_DEFAULT_SEED,
  POINCARE_DIVERGENCE_THRESHOLD,
  createPoincareSignature,
  createPoincareSky,
  normalizePoincareSeed,
  pathBounds,
  separationAtProgress,
} from './poincareSkyMath'

describe('poincare sky flow', () => {
  it('normalizes the movable initial condition inside the instrument field', () => {
    expect(normalizePoincareSeed({ x: -2, y: 4 })).toEqual({ x: 0.16, y: 0.8 })
    expect(normalizePoincareSeed({})).toEqual(POINCARE_DEFAULT_SEED)
  })

  it('is deterministic and begins with two genuinely nearby states', () => {
    const first = createPoincareSky(POINCARE_DEFAULT_SEED, { steps: 120, warmup: 40 })
    const second = createPoincareSky(POINCARE_DEFAULT_SEED, { steps: 120, warmup: 40 })
    expect(first.pathA).toEqual(second.pathA)
    expect(first.pathB).toEqual(second.pathB)
    expect(first.initialDistance).toBeGreaterThan(0)
    expect(first.initialDistance).toBeLessThan(0.01)
  })

  it('lets a minute perturbation become macroscopically visible over time', () => {
    const sky = createPoincareSky(POINCARE_DEFAULT_SEED)
    expect(sky.pathA.length).toBe(sky.pathB.length)
    expect(sky.maxDivergence).toBeGreaterThan(POINCARE_DIVERGENCE_THRESHOLD)
    expect(sky.thresholdProgress).toBeGreaterThanOrEqual(0.38)
    expect(sky.thresholdProgress).toBeLessThanOrEqual(0.86)
    expect(separationAtProgress(sky, 1)).toBeGreaterThan(separationAtProgress(sky, 0))
  })

  it('returns finite projection bounds', () => {
    const sky = createPoincareSky({ x: 0.62, y: 0.34 }, { steps: 160, warmup: 20 })
    const bounds = pathBounds(sky.pathA, sky.pathB)
    expect(Object.values(bounds).every(Number.isFinite)).toBe(true)
    expect(bounds.maxX).toBeGreaterThan(bounds.minX)
    expect(bounds.maxY).toBeGreaterThan(bounds.minY)
  })

  it('gives every world the same normalized trajectory signature', () => {
    const sky = createPoincareSky({ x: 0.41, y: 0.57 })
    const first = createPoincareSignature(sky, 9)
    const second = createPoincareSignature(sky, 9)
    expect(first).toEqual(second)
    expect(first).toHaveLength(9)
    expect(first[0].progress).toBe(0)
    expect(first.at(-1).progress).toBe(1)
    expect(first.at(-1).divergence).toBeGreaterThan(first[0].divergence)
    expect(first.every((point) => Object.values(point).every(Number.isFinite))).toBe(true)
  })
})
