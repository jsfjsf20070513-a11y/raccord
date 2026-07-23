import { describe, expect, it } from 'vitest'
import { createProximityField, smoothstep } from './materialMath'

describe('material proximity field', () => {
  it('is strongest at the pointer and zero outside the ellipse', () => {
    const field = createProximityField({
      width: 200,
      height: 100,
      field: { u: 0.5, v: 0.5, active: 1 },
      radiusX: 60,
      radiusY: 30,
    })

    expect(field.sample(100, 50)).toBeCloseTo(1)
    expect(field.sample(161, 50)).toBe(0)
    expect(field.sample(100, 81)).toBe(0)
  })

  it('preserves the configured active amount', () => {
    const field = createProximityField({
      width: 200,
      height: 100,
      field: { u: 0.5, v: 0.5, active: 0.42 },
      radiusX: 60,
      radiusY: 30,
    })

    expect(field.sample(100, 50)).toBeCloseTo(0.42)
  })

  it('rotates an anisotropic field without creating a hard edge', () => {
    const field = createProximityField({
      width: 200,
      height: 100,
      field: { u: 0.5, v: 0.5, active: 1 },
      radiusX: 80,
      radiusY: 20,
      rotation: Math.PI / 2,
    })

    expect(field.sample(100, 100)).toBeGreaterThan(0)
    expect(field.sample(150, 50)).toBe(0)
  })

  it('returns a dormant field when active is zero', () => {
    const field = createProximityField({
      width: 200,
      height: 100,
      field: { u: 0.5, v: 0.5, active: 0 },
      radiusX: 100,
      radiusY: 100,
    })

    expect(field.sample(100, 50)).toBe(0)
  })
})

describe('smoothstep', () => {
  it('is clamped and continuous through the transition', () => {
    expect(smoothstep(0, 1, -1)).toBe(0)
    expect(smoothstep(0, 1, 0.5)).toBeCloseTo(0.5)
    expect(smoothstep(0, 1, 2)).toBe(1)
  })
})
