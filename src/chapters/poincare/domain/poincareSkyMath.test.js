import { describe, expect, it } from 'vitest'
import {
  POINCARE_DEFAULT_SEED,
  POINCARE_DIVERGENCE_THRESHOLD,
  createPoincareSignature,
  createPoincareSky,
  normalizePoincareSeed,
  observePoincareSky,
  pathBounds,
  separationAtProgress,
} from './poincareSkyMath.js'

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
    expect(sky.thresholdProgress).toBe(sky.thresholdIndex / (sky.separation.length - 1))
    expect(separationAtProgress(sky, 1)).toBeGreaterThan(separationAtProgress(sky, 0))
  })

  it('reports early and late crossings at their real samples, and never invents a crossing', () => {
    const early = createPoincareSky({ x: 0.34, y: 0.5 })
    const late = createPoincareSky({ x: 0.325, y: 0.6 })
    const quiet = createPoincareSky({ x: 0.325, y: 0.55 })
    expect(early.thresholdProgress).toBeLessThan(0.38)
    expect(late.thresholdProgress).toBeGreaterThan(0.86)
    for (const sky of [early, late]) {
      expect(sky.separation[sky.thresholdIndex - 1]).toBeLessThan(18)
      expect(separationAtProgress(sky, sky.thresholdProgress)).toBeGreaterThanOrEqual(18)
    }
    expect(quiet.thresholdIndex).toBe(-1)
    expect(quiet.thresholdProgress).toBeNull()
    expect(observePoincareSky(quiet, 1)).toMatchObject({ complete: true, crossing: null })
    const fractional = createPoincareSky({ x: 0.16, y: 0.275 })
    expect(observePoincareSky(fractional, fractional.thresholdProgress).crossing).toBe(fractional.thresholdProgress)
  })

  it('only reveals reached samples, including contractions below the initial distance', () => {
    const sky = { separation: [1, 0.25, 20, 2], thresholdIndex: 2, thresholdProgress: 2 / 3 }
    expect(observePoincareSky(sky, 1 / 3)).toMatchObject({ ratio: 0.25, maxRatio: 1, crossing: null, complete: false })
    expect(observePoincareSky(sky, 2 / 3)).toMatchObject({ ratio: 20, maxRatio: 20, crossing: 2 / 3 })
    expect(observePoincareSky(sky, 5)).toMatchObject({ ratio: 2, maxRatio: 20, complete: true })
    expect(observePoincareSky(sky, NaN)).toMatchObject({ progress: 0, ratio: 1 })
    expect(observePoincareSky(sky, -1)).toMatchObject({ progress: 0, ratio: 1 })
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
