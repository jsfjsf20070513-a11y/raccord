import { describe, expect, it } from 'vitest'
import {
  deformRaccordPoint,
  flightLoadMetrics,
  joinedCurveSamples,
  normalizeRaccordHandle,
  raccordInterpretationSamples,
} from './raccordWorldMath'

describe('raccord world artifact', () => {
  it('keeps one ordered finite curve across the join', () => {
    const points = joinedCurveSamples({ steps: 24 })
    expect(points.length).toBe(49)
    expect(points.every(({ x, y }) => Number.isFinite(x) && Number.isFinite(y))).toBe(true)
    expect(points.every((point, index) => index === 0 || point.x >= points[index - 1].x)).toBe(true)
  })

  it('moves continuously toward the threshold', () => {
    const calm = flightLoadMetrics(0)
    const near = flightLoadMetrics(0.82)
    const threshold = flightLoadMetrics(1)
    expect(calm.regime).toBe('stable')
    expect(near.regime).toBe('proche')
    expect(threshold.regime).toBe('seuil')
    expect(calm.margin).toBeGreaterThan(near.margin)
    expect(near.margin).toBeGreaterThan(threshold.margin)
  })

  it('deforms without moving the curve endpoints sideways', () => {
    const left = { x: 0.05, y: 0.62 }
    const middle = { x: 0.5, y: 0.4 }
    const right = { x: 0.95, y: 0.32 }
    expect(deformRaccordPoint(left, 1)).toEqual(left)
    expect(deformRaccordPoint(right, 1).y).toBeCloseTo(right.y, 10)
    expect(deformRaccordPoint(middle, 0.8).x).toBe(middle.x)
    expect(deformRaccordPoint(middle, 0.8).y).toBeGreaterThan(middle.y)
  })

  it('clamps the reduced load and normalizes a shared handle', () => {
    expect(flightLoadMetrics(-2).load).toBe(0)
    expect(flightLoadMetrics(3).load).toBe(1)
    expect(normalizeRaccordHandle({ x: 9, y: -2 })).toEqual({ x: 0.77, y: 0.28 })
    expect(normalizeRaccordHandle({ x: '0.63', y: '0.47' })).toEqual({ x: 0.63, y: 0.47 })
    expect(normalizeRaccordHandle({ x: 'nope', y: null })).toEqual({ x: 0.63, y: 0.69 })
  })

  it('projects geometry and load into a finite reading trace', () => {
    const calm = raccordInterpretationSamples({ steps: 24, load: 0 })
    const stressed = raccordInterpretationSamples({ steps: 24, load: 1 })
    expect(calm).toHaveLength(49)
    expect(calm.every(({ x, y }) => Number.isFinite(x) && Number.isFinite(y))).toBe(true)
    expect(stressed).not.toEqual(calm)
  })
})
