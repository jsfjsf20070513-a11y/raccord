import { describe, expect, it } from 'vitest'
import {
  CURVE_MODEL,
  TRANSFORM_TARGET_STEPS,
  composeTransforms,
  curveJoinMetrics,
  isExactRaccordCalibration,
  matrixMetrics,
  multiply2x2,
  rigidityMetrics,
  snapRaccordHandle,
} from './planPrototypeMath'

describe('PLAN curvature joint', () => {
  it('distinguishes the unfinished handle from the exact C2 construction', () => {
    expect(curveJoinMetrics(CURVE_MODEL.initialHandle).grade).not.toBe('C²')
    const target = curveJoinMetrics(CURVE_MODEL.targetHandle)
    expect(target.grade).toBe('C²')
    expect(target.firstResidual).toBeCloseTo(0)
    expect(target.secondResidual).toBeCloseTo(0)
  })

  it('only archives an exact snapped calibration, not a merely tolerant C2 grade', () => {
    const tolerant = { x: CURVE_MODEL.targetHandle.x + 0.004, y: CURVE_MODEL.targetHandle.y }
    expect(curveJoinMetrics(tolerant).grade).toBe('C²')
    expect(isExactRaccordCalibration(tolerant)).toBe(false)
    expect(snapRaccordHandle(tolerant)).toEqual(CURVE_MODEL.targetHandle)
    expect(isExactRaccordCalibration(snapRaccordHandle(tolerant))).toBe(true)
    expect(snapRaccordHandle({ x: 0.74, y: 0.7 })).toEqual({ x: 0.74, y: 0.7 })
  })
})

describe('PLAN rigidity frame', () => {
  it('turns one square mechanism into a rigid frame with one diagonal', () => {
    expect(rigidityMetrics(0)).toMatchObject({ rank: 4, mechanisms: 1, selfStress: 0 })
    expect(rigidityMetrics(1)).toMatchObject({ rank: 5, mechanisms: 0, selfStress: 0 })
    expect(rigidityMetrics(3)).toMatchObject({ rank: 5, mechanisms: 0, selfStress: 1 })
  })
})

describe('PLAN 2x2 composition', () => {
  it('preserves construction order and recognizes the target stack', () => {
    const rotationThenShear = composeTransforms(['R', 'H'])
    const shearThenRotation = composeTransforms(['H', 'R'])
    expect(rotationThenShear).not.toEqual(shearThenRotation)

    const target = composeTransforms(TRANSFORM_TARGET_STEPS)
    expect(matrixMetrics(target).matched).toBe(true)
    expect(matrixMetrics(target).residual).toBeCloseTo(0)
  })

  it('multiplies row-major matrices', () => {
    expect(multiply2x2([2, 0, 0, 3], [1, 1, 0, 1])).toEqual([2, 2, 0, 3])
  })
})
