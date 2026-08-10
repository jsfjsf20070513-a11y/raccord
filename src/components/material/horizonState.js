import { HORIZON_DEFAULT_DIRECTION_DEG, normalizeAngleDeg } from './horizonMath'

export const HORIZON_STORAGE_KEY = 'horizon_immobile_candidate_v1'
export const HORIZON_STATE_VERSION = 1
export const HORIZON_CLOCK_SKEW_TOLERANCE_MS = 5 * 60_000

export function createInitialHorizonState() {
  return {
    version: HORIZON_STATE_VERSION,
    releaseDirectionDeg: null,
    releasedAt: null,
  }
}

export function isHorizonReleased(state) {
  return Number.isFinite(state?.releaseDirectionDeg)
    && Number.isFinite(state?.releasedAt)
}

export function releaseHorizon(
  state,
  {
    directionDeg = HORIZON_DEFAULT_DIRECTION_DEG,
    at = Date.now(),
  } = {},
) {
  if (isHorizonReleased(state)) return state

  const releasedAt = Number(at)
  return {
    version: HORIZON_STATE_VERSION,
    releaseDirectionDeg: normalizeAngleDeg(directionDeg),
    releasedAt: Number.isFinite(releasedAt) ? Math.max(0, releasedAt) : Date.now(),
  }
}

export function parseHorizonState(raw) {
  if (!raw) return createInitialHorizonState()

  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    const now = Date.now()
    if (
      parsed?.version !== HORIZON_STATE_VERSION
      || !Number.isFinite(parsed?.releaseDirectionDeg)
      || !Number.isFinite(parsed?.releasedAt)
      || parsed.releasedAt < 0
      || parsed.releasedAt > now + HORIZON_CLOCK_SKEW_TOLERANCE_MS
    ) {
      return createInitialHorizonState()
    }

    return {
      version: HORIZON_STATE_VERSION,
      releaseDirectionDeg: normalizeAngleDeg(parsed.releaseDirectionDeg),
      releasedAt: Math.min(now, parsed.releasedAt),
    }
  } catch {
    return createInitialHorizonState()
  }
}

export function readHorizonState(storage) {
  try {
    return parseHorizonState(storage?.getItem(HORIZON_STORAGE_KEY))
  } catch {
    return createInitialHorizonState()
  }
}

export function writeHorizonState(storage, state) {
  if (!storage || !isHorizonReleased(state)) return false

  try {
    storage.setItem(HORIZON_STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export function horizonElapsedMs(state, now = Date.now()) {
  if (!isHorizonReleased(state)) return 0
  return Math.max(0, (Number(now) || 0) - state.releasedAt)
}
