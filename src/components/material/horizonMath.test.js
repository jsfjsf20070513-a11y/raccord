import { describe, expect, it } from 'vitest'
import {
  EARTH_OMEGA_DEG_PER_HOUR,
  EVIDENCE_INTERVAL_MS,
  PARIS_LATITUDE_DEG,
  apparentPlaneAngleDeg,
  evidenceGrooves,
  evidencePassCount,
  evidenceSampleTimes,
  normalizeAngleDeg,
  normalizeLatitudeDeg,
  precessionDriftDeg,
  precessionRateDegPerHour,
  visualDriftDeg,
} from './horizonMath'

describe('Foucault horizon physics', () => {
  it('uses the Paris precession rate and sidereal Earth rotation', () => {
    expect(EARTH_OMEGA_DEG_PER_HOUR).toBeCloseTo(15.0411, 3)
    expect(precessionRateDegPerHour(PARIS_LATITUDE_DEG)).toBeCloseTo(11.3269, 3)
    expect(360 / precessionRateDegPerHour(PARIS_LATITUDE_DEG)).toBeCloseTo(31.7827, 3)
  })

  it('keeps real elapsed time in the physical drift', () => {
    expect(precessionDriftDeg(0)).toBe(0)
    expect(precessionDriftDeg(3_600_000)).toBeCloseTo(11.3269, 3)
    expect(apparentPlaneAngleDeg(350, 3_600_000)).toBeCloseTo(1.3269, 3)
  })

  it('normalizes defensive inputs', () => {
    expect(normalizeAngleDeg(-15)).toBe(345)
    expect(normalizeAngleDeg('bad')).toBe(0)
    expect(normalizeLatitudeDeg(120)).toBe(90)
    expect(normalizeLatitudeDeg(-120)).toBe(-90)
  })

  it('treats visible divergence as a bounded drawing microscope', () => {
    expect(visualDriftDeg(0)).toBe(0)
    expect(visualDriftDeg(3_600_000)).toBe(8.6)
    expect(visualDriftDeg(3_600_000, { magnification: 1 })).toBe(8.6)
    expect(visualDriftDeg(60_000)).toBeGreaterThan(0)
  })

  it('adds evidence at each half-period and never exceeds the visual budget', () => {
    expect(evidenceSampleTimes(EVIDENCE_INTERVAL_MS - 1, 7)).toEqual([])
    expect(evidenceSampleTimes(EVIDENCE_INTERVAL_MS * 3, 7)).toHaveLength(3)
    expect(evidenceSampleTimes(EVIDENCE_INTERVAL_MS * 30, 7)).toHaveLength(7)
    expect(evidenceGrooves(172.5, EVIDENCE_INTERVAL_MS * 30, 5)).toHaveLength(5)
  })

  it('keeps a recent material window while the world continues to precess', () => {
    expect(evidencePassCount(EVIDENCE_INTERVAL_MS * 9)).toBe(9)
    expect(evidenceSampleTimes(EVIDENCE_INTERVAL_MS * 7, 7)).toEqual(
      [1, 2, 3, 4, 5, 6, 7].map((pass) => pass * EVIDENCE_INTERVAL_MS),
    )
    expect(evidenceSampleTimes(EVIDENCE_INTERVAL_MS * 9, 7)).toEqual(
      [3, 4, 5, 6, 7, 8, 9].map((pass) => pass * EVIDENCE_INTERVAL_MS),
    )

    const tenMinutes = evidenceGrooves(172.5, 10 * 60_000, 7)
    const oneHour = evidenceGrooves(172.5, 60 * 60_000, 7)
    expect(oneHour.map(({ angleDeg }) => angleDeg)).not.toEqual(
      tenMinutes.map(({ angleDeg }) => angleDeg),
    )
  })
})
