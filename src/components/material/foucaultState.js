// Chapter 2 state: pure transitions over a versioned, timestamp-driven artifact.
// The world advances by clock arithmetic, never by a background RAF pretending
// to run. Storage parsing is fail-safe: anything suspicious returns dormant.

import { normalizeAngleDeg, precessionDriftDeg, apparentPlaneAngleDeg } from './foucaultMath'

export const FOUCAULT_STORAGE_KEY = 'foucault_horizon_v1'
export const FOUCAULT_SCHEMA_VERSION = 2

// Artistic compression: 1 real second ≈ 45 chapter seconds. Real physics stays
// in foucaultMath; this constant is the only place the chapter accelerates.
// The earlier unaccepted prototype used 120× and made the room behave like a toy.
export const CHAPTER_TIME_SCALE = 45

// Drift from release (deg) after which the room's betrayal counts as visible.
export const REVEAL_THRESHOLD_DEG = 6

// A stored release may not sit in the future beyond this tolerance.
const FUTURE_TOLERANCE_MS = 60_000

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

export function createDormantState() {
  return {
    version: FOUCAULT_SCHEMA_VERSION,
    chapterTimeScale: CHAPTER_TIME_SCALE,
    releaseDirectionDeg: null,
    releasedAt: null,
    lastObservedAt: null,
  }
}

export function isReleased(state) {
  return Boolean(state) && isFiniteNumber(state.releasedAt)
}

// The single release. A second call is a no-op: the chapter's verb happens once.
export function releaseState(state, directionDeg, nowMs) {
  if (isReleased(state)) return state
  if (!isFiniteNumber(directionDeg) || !isFiniteNumber(nowMs) || nowMs <= 0) {
    return state
  }
  return {
    ...createDormantState(),
    chapterTimeScale: state?.chapterTimeScale ?? CHAPTER_TIME_SCALE,
    releaseDirectionDeg: normalizeAngleDeg(directionDeg),
    releasedAt: nowMs,
    lastObservedAt: nowMs,
  }
}

export function observeState(state, nowMs) {
  if (!isReleased(state) || !isFiniteNumber(nowMs) || nowMs < state.releasedAt) {
    return state
  }
  if (state.lastObservedAt === nowMs) return state
  return { ...state, lastObservedAt: nowMs }
}

export function driftDegAt(state, nowMs) {
  if (!isReleased(state) || !isFiniteNumber(nowMs)) return 0
  const elapsed = Math.max(0, nowMs - state.releasedAt)
  return precessionDriftDeg(elapsed, { timeScale: state.chapterTimeScale })
}

export function apparentAngleDegAt(state, nowMs) {
  if (!isReleased(state)) return null
  const elapsed = Math.max(0, nowMs - state.releasedAt)
  return apparentPlaneAngleDeg(state.releaseDirectionDeg, elapsed, {
    timeScale: state.chapterTimeScale,
  })
}

export function phaseAt(state, nowMs) {
  if (!isReleased(state)) return 'dormant'
  return Math.abs(driftDegAt(state, nowMs)) >= REVEAL_THRESHOLD_DEG ? 'revealed' : 'released'
}

export function serializeState(state) {
  return JSON.stringify(state)
}

// Fail-safe parser: corrupt JSON, unknown schema, non-finite fields, impossible
// timestamps or half-states all collapse to dormant. Never patch together a
// half-broken artifact.
export function parseStoredState(raw, nowMs) {
  if (typeof raw !== 'string' || raw === '') return createDormantState()
  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    return createDormantState()
  }
  if (!parsed || typeof parsed !== 'object') return createDormantState()
  if (parsed.version !== FOUCAULT_SCHEMA_VERSION) return createDormantState()

  const timeScale = parsed.chapterTimeScale
  if (!isFiniteNumber(timeScale) || timeScale <= 0) return createDormantState()

  if (parsed.releasedAt == null) {
    if (parsed.releaseDirectionDeg != null) return createDormantState()
    return { ...createDormantState(), chapterTimeScale: timeScale }
  }

  if (!isFiniteNumber(parsed.releasedAt) || parsed.releasedAt <= 0) return createDormantState()
  if (!isFiniteNumber(parsed.releaseDirectionDeg)) return createDormantState()
  if (isFiniteNumber(nowMs) && parsed.releasedAt > nowMs + FUTURE_TOLERANCE_MS) {
    return createDormantState()
  }

  const lastObservedAt = isFiniteNumber(parsed.lastObservedAt) && parsed.lastObservedAt >= parsed.releasedAt
    ? parsed.lastObservedAt
    : parsed.releasedAt

  return {
    version: FOUCAULT_SCHEMA_VERSION,
    chapterTimeScale: timeScale,
    releaseDirectionDeg: normalizeAngleDeg(parsed.releaseDirectionDeg),
    releasedAt: parsed.releasedAt,
    lastObservedAt,
  }
}
