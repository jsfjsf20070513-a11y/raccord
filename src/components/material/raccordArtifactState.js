import {
  RACCORD_ARTIFACT,
  RACCORD_LEGACY_STORAGE_KEY,
  RACCORD_LOAD_THRESHOLD,
  flightLoadMetrics,
  normalizeRaccordHandle,
} from './raccordWorldMath'
import { isExactRaccordCalibration } from './planPrototypeMath'

export const RACCORD_ARTIFACT_STORAGE_KEY = 'raccord_artifact_v2'
export const RACCORD_ARTIFACT_VERSION = 2
export const RACCORD_SCAR_LIMIT = 5

function finite(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function normalizeConstruction(value) {
  if (!value || typeof value !== 'object') return null
  return {
    achievedAt: Math.max(0, finite(value.achievedAt)),
    handle: normalizeRaccordHandle(value.handle),
    curvatureJump: Math.max(0, finite(value.curvatureJump)),
  }
}

function normalizeScar(value, index) {
  const load = flightLoadMetrics(value?.load).load
  return {
    id: String(value?.id || `scar-${index + 1}`),
    at: Math.max(0, finite(value?.at)),
    load,
    handle: normalizeRaccordHandle(value?.handle),
  }
}

function normalizeFlight(value) {
  const scars = Array.isArray(value?.scars)
    ? value.scars.slice(-RACCORD_SCAR_LIMIT).map(normalizeScar)
    : []
  return {
    maxLoad: flightLoadMetrics(value?.maxLoad).load,
    thresholdCrossings: Math.max(scars.length, Math.round(Math.max(0, finite(value?.thresholdCrossings)))),
    scars,
  }
}

export function createRaccordArtifact(value = {}) {
  return {
    version: RACCORD_ARTIFACT_VERSION,
    id: RACCORD_ARTIFACT.id,
    handle: normalizeRaccordHandle(value.handle),
    history: {
      construction: normalizeConstruction(value.history?.construction),
      flight: normalizeFlight(value.history?.flight),
    },
  }
}

function sameHandle(a, b) {
  return a.x === b.x && a.y === b.y
}

export function applyRaccordEvent(currentValue, event) {
  const current = currentValue?.version === RACCORD_ARTIFACT_VERSION
    && currentValue?.id === RACCORD_ARTIFACT.id
    && currentValue?.handle
    && currentValue?.history
    ? currentValue
    : createRaccordArtifact(currentValue)
  if (!event || typeof event !== 'object') return current

  if (event.type === 'handle.changed') {
    const handle = normalizeRaccordHandle(event.handle)
    return sameHandle(handle, current.handle) ? current : { ...current, handle }
  }

  if (event.type === 'construction.completed') {
    const handle = normalizeRaccordHandle(event.handle || current.handle)
    if (current.history.construction || event.grade !== 'C²' || !isExactRaccordCalibration(handle)) return current
    const construction = normalizeConstruction({
      achievedAt: event.at,
      handle,
      curvatureJump: event.curvatureJump,
    })
    return {
      ...current,
      history: { ...current.history, construction },
    }
  }

  if (event.type === 'flight.tested') {
    const load = flightLoadMetrics(event.maxLoad).load
    const flight = current.history.flight
    const crossedThreshold = Boolean(event.crossedThreshold) && load >= RACCORD_LOAD_THRESHOLD
    const nextMaxLoad = Math.max(flight.maxLoad, load)
    if (!crossedThreshold) {
      if (nextMaxLoad === flight.maxLoad) return current
      return {
        ...current,
        history: {
          ...current.history,
          flight: { ...flight, maxLoad: nextMaxLoad },
        },
      }
    }

    const testId = String(event.testId || `flight-${Math.max(0, finite(event.at))}`)
    const existingIndex = flight.scars.findIndex((scar) => scar.id === testId)
    const isNewCrossing = existingIndex < 0
    const nextScar = normalizeScar({
      id: testId,
      at: isNewCrossing ? event.at : flight.scars[existingIndex].at,
      load: isNewCrossing ? load : Math.max(load, flight.scars[existingIndex].load),
      handle: isNewCrossing
        ? event.handle || current.handle
        : flight.scars[existingIndex].handle,
    }, Math.max(0, existingIndex))
    const scars = isNewCrossing
      ? [...flight.scars, nextScar].slice(-RACCORD_SCAR_LIMIT)
      : flight.scars.map((scar, index) => index === existingIndex ? nextScar : scar)
    const thresholdCrossings = flight.thresholdCrossings + (isNewCrossing ? 1 : 0)
    const scarChanged = isNewCrossing
      || nextScar.load !== flight.scars[existingIndex].load
    if (!scarChanged && nextMaxLoad === flight.maxLoad) return current
    return {
      ...current,
      history: {
        ...current.history,
        flight: {
          maxLoad: nextMaxLoad,
          thresholdCrossings,
          scars,
        },
      },
    }
  }

  return current
}

function browserStorage() {
  return typeof window === 'undefined' ? null : window.localStorage
}

export function readRaccordArtifact(storage = browserStorage()) {
  if (!storage) return createRaccordArtifact()
  try {
    const stored = storage.getItem(RACCORD_ARTIFACT_STORAGE_KEY)
    if (stored) return createRaccordArtifact(JSON.parse(stored))
    const legacyHandle = storage.getItem(RACCORD_LEGACY_STORAGE_KEY)
    return createRaccordArtifact({ handle: legacyHandle ? JSON.parse(legacyHandle) : undefined })
  } catch {
    return createRaccordArtifact()
  }
}

export function storeRaccordArtifact(value, storage = browserStorage()) {
  const artifact = createRaccordArtifact(value)
  if (!storage) return artifact
  try {
    storage.setItem(RACCORD_ARTIFACT_STORAGE_KEY, JSON.stringify(artifact))
  } catch {
    // The in-memory artifact remains authoritative for this visit when storage is blocked.
  }
  return artifact
}
