import { describe, expect, it } from 'vitest'
import {
  EARTH_OMEGA_DEG_PER_HOUR,
  PARIS_LATITUDE_DEG,
  apparentPlaneAngleDeg,
  normalizeAngleDeg,
  precessionDriftDeg,
  precessionRateDegPerHour,
} from './foucaultMath'

describe('foucaultMath', () => {
  it('equator has zero precession', () => {
    expect(precessionRateDegPerHour(0)).toBeCloseTo(0, 10)
  })

  it('north pole precesses at the full sidereal rate', () => {
    expect(precessionRateDegPerHour(90)).toBeCloseTo(EARTH_OMEGA_DEG_PER_HOUR, 10)
    expect(EARTH_OMEGA_DEG_PER_HOUR).toBeCloseTo(15.0411, 3)
  })

  it('southern hemisphere flips the sign at equal latitude', () => {
    const north = precessionRateDegPerHour(PARIS_LATITUDE_DEG)
    const south = precessionRateDegPerHour(-PARIS_LATITUDE_DEG)
    expect(south).toBeCloseTo(-north, 10)
  })

  it('Paris precesses at ≈ 11.327°/h and one lap ≈ 31.78 h', () => {
    const paris = precessionRateDegPerHour(PARIS_LATITUDE_DEG)
    expect(paris).toBeCloseTo(11.327, 2)
    expect(360 / paris).toBeCloseTo(31.78, 1)
  })

  it('zero elapsed time keeps the release direction', () => {
    expect(apparentPlaneAngleDeg(37, 0)).toBeCloseTo(37, 10)
  })

  it('angles stay normalized after many laps', () => {
    const weeks = 21 * 24 * 3_600_000
    const angle = apparentPlaneAngleDeg(210, weeks, { timeScale: 7 })
    expect(angle).toBeGreaterThanOrEqual(0)
    expect(angle).toBeLessThan(360)
    expect(Number.isFinite(angle)).toBe(true)
    expect(normalizeAngleDeg(-0.0001)).toBeGreaterThanOrEqual(0)
  })

  it('drift is clockwise on screen in the north: apparent azimuth decreases', () => {
    const oneHour = 3_600_000
    const later = apparentPlaneAngleDeg(90, oneHour)
    expect(later).toBeCloseTo(90 - 11.327, 2)
  })

  it('rejects non-finite, negative-time and out-of-range inputs', () => {
    expect(() => precessionRateDegPerHour(Number.NaN)).toThrow(RangeError)
    expect(() => precessionRateDegPerHour(91)).toThrow(RangeError)
    expect(() => precessionDriftDeg(-1)).toThrow(RangeError)
    expect(() => precessionDriftDeg(Number.POSITIVE_INFINITY)).toThrow(RangeError)
    expect(() => precessionDriftDeg(1000, { timeScale: 0 })).toThrow(RangeError)
    expect(() => apparentPlaneAngleDeg(Number.NaN, 0)).toThrow(RangeError)
  })
})
