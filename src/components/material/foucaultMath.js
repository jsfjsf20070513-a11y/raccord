// Le ciel du chapitre 2 : pure Foucault precession math.
// Real physics only. Artistic time compression lives in state (chapterTimeScale),
// never here. The rendered object is an ideal maintained Foucault pendulum —
// damping is intentionally not modelled; see docs/design/foucault/source-notes.md.

export const EARTH_OMEGA_DEG_PER_HOUR = (360 / 86164.0905) * 3600 // sidereal day
export const PARIS_LATITUDE_DEG = 48.8566

function assertFiniteNumber(value, name) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new RangeError(`foucaultMath: ${name} must be a finite number`)
  }
}

export function normalizeAngleDeg(angleDeg) {
  assertFiniteNumber(angleDeg, 'angleDeg')
  const wrapped = angleDeg % 360
  return wrapped < 0 ? wrapped + 360 : wrapped
}

export function normalizeLatitudeDeg(latitudeDeg) {
  assertFiniteNumber(latitudeDeg, 'latitudeDeg')
  if (latitudeDeg < -90 || latitudeDeg > 90) {
    throw new RangeError('foucaultMath: latitudeDeg must be within [-90, 90]')
  }
  return latitudeDeg
}

// Ground-frame apparent rotation rate of the swing plane: ωp = Ω⊕ · sin(φ).
// Positive in the northern hemisphere (clockwise seen from above), negative south.
export function precessionRateDegPerHour(latitudeDeg = PARIS_LATITUDE_DEG) {
  const lat = normalizeLatitudeDeg(latitudeDeg)
  return EARTH_OMEGA_DEG_PER_HOUR * Math.sin((lat * Math.PI) / 180)
}

// Signed drift accumulated after elapsedMs of wall-clock time, scaled by the
// chapter's artistic timeScale (1 = real time). elapsedMs must be >= 0.
export function precessionDriftDeg(elapsedMs, { latitudeDeg = PARIS_LATITUDE_DEG, timeScale = 1 } = {}) {
  assertFiniteNumber(elapsedMs, 'elapsedMs')
  assertFiniteNumber(timeScale, 'timeScale')
  if (elapsedMs < 0) {
    throw new RangeError('foucaultMath: elapsedMs must be >= 0')
  }
  if (timeScale <= 0) {
    throw new RangeError('foucaultMath: timeScale must be > 0')
  }
  return precessionRateDegPerHour(latitudeDeg) * (elapsedMs / 3_600_000) * timeScale
}

// Screen convention: azimuth 0° swings parallel to the picture plane and grows
// counter-clockwise on the floor ellipse. In the visitor's (ground) frame the
// swing plane appears to turn clockwise in the northern hemisphere, so the
// apparent azimuth decreases as drift accumulates.
export function apparentPlaneAngleDeg(releaseDirectionDeg, elapsedMs, options = {}) {
  const release = normalizeAngleDeg(releaseDirectionDeg)
  return normalizeAngleDeg(release - precessionDriftDeg(elapsedMs, options))
}
