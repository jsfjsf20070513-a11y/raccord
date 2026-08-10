export const EARTH_OMEGA_DEG_PER_HOUR = 360 / 23.9344696
export const PARIS_LATITUDE_DEG = 48.8566
export const PANTHEON_PENDULUM_PERIOD_MS = 16_420
export const EVIDENCE_INTERVAL_MS = PANTHEON_PENDULUM_PERIOD_MS / 2

// The state keeps physical time only. This factor belongs exclusively to the
// drawing: it is a spatial microscope for a change too small to see on screen.
export const EVIDENCE_SPATIAL_MAGNIFICATION = 45
export const MAX_VISUAL_DRIFT_DEG = 8.6
export const HORIZON_DEFAULT_DIRECTION_DEG = 172.5

export function normalizeAngleDeg(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return 0
  return ((numeric % 360) + 360) % 360
}

export function normalizeLatitudeDeg(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return 0
  return Math.max(-90, Math.min(90, numeric))
}

export function precessionRateDegPerHour(latitudeDeg = PARIS_LATITUDE_DEG) {
  const latitudeRad = normalizeLatitudeDeg(latitudeDeg) * (Math.PI / 180)
  return EARTH_OMEGA_DEG_PER_HOUR * Math.sin(latitudeRad)
}

export function precessionDriftDeg(
  elapsedMs,
  latitudeDeg = PARIS_LATITUDE_DEG,
) {
  const safeElapsedMs = Math.max(0, Number(elapsedMs) || 0)
  return precessionRateDegPerHour(latitudeDeg) * (safeElapsedMs / 3_600_000)
}

export function apparentPlaneAngleDeg(
  releaseDirectionDeg,
  elapsedMs,
  latitudeDeg = PARIS_LATITUDE_DEG,
) {
  return normalizeAngleDeg(
    releaseDirectionDeg + precessionDriftDeg(elapsedMs, latitudeDeg),
  )
}

export function visualDriftDeg(
  elapsedMs,
  {
    latitudeDeg = PARIS_LATITUDE_DEG,
    magnification = EVIDENCE_SPATIAL_MAGNIFICATION,
    maxVisualDriftDeg = MAX_VISUAL_DRIFT_DEG,
  } = {},
) {
  const amplified = Math.abs(
    precessionDriftDeg(elapsedMs, latitudeDeg) * magnification,
  )
  return Math.min(Math.max(0, maxVisualDriftDeg), amplified)
}

export function evidencePassCount(elapsedMs) {
  const safeElapsedMs = Math.max(0, Number(elapsedMs) || 0)
  return Math.floor(safeElapsedMs / EVIDENCE_INTERVAL_MS)
}

export function evidenceSampleTimes(elapsedMs, maxVisible = 7) {
  const safeMaxVisible = Math.max(0, Math.floor(Number(maxVisible) || 0))
  const passCount = evidencePassCount(elapsedMs)

  if (passCount === 0 || safeMaxVisible === 0) return []

  const visibleCount = Math.min(passCount, safeMaxVisible)
  const firstVisiblePass = Math.max(1, passCount - visibleCount + 1)

  return Array.from(
    { length: visibleCount },
    (_, index) => (firstVisiblePass + index) * EVIDENCE_INTERVAL_MS,
  )
}

export function evidenceGrooves(
  releaseDirectionDeg,
  elapsedMs,
  maxVisible = 7,
) {
  const samples = evidenceSampleTimes(elapsedMs, maxVisible)
  const windowStartMs = samples[0] ?? 0

  return samples.map((sampleElapsedMs, index) => {
    const ageRatio = (index + 1) / samples.length
    const realDrift = precessionDriftDeg(sampleElapsedMs)
    const localMicroscope = precessionDriftDeg(
      sampleElapsedMs - windowStartMs,
    ) * (EVIDENCE_SPATIAL_MAGNIFICATION - 1)
    const opacityVariation = [0, -0.016, 0.01, -0.008][index % 4]
    const widthVariation = [0, 0.04, -0.025][index % 3]
    const reachVariation = [0, -0.026, 0.016, -0.014][index % 4]

    return {
      angleDeg: normalizeAngleDeg(
        releaseDirectionDeg + 180 + realDrift + localMicroscope,
      ),
      opacity: Math.max(
        0.13,
        Math.min(0.42, 0.11 + ageRatio * 0.3 + opacityVariation),
      ),
      width: 0.52 + ageRatio * 0.28 + widthVariation,
      reach: Math.max(
        0.72,
        Math.min(0.985, 0.72 + ageRatio * 0.25 + reachVariation),
      ),
    }
  })
}
