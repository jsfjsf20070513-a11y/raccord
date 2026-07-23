import { POINCARE_DEFAULT_SEED, normalizePoincareSeed } from './poincareSkyMath'

export const POINCARE_SKY_STORAGE_KEY = 'poincare_sky_v1'
export const POINCARE_SKY_VERSION = 1
export const POINCARE_MEMORY_LIMIT = 7

function finite(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function normalizeMemory(value, index) {
  return {
    id: String(value?.id || `placement-${index + 1}`),
    at: Math.max(0, finite(value?.at)),
    seed: normalizePoincareSeed(value?.seed),
  }
}

function normalizeScar(value) {
  if (!value || typeof value !== 'object') return null
  return {
    at: Math.max(0, finite(value.at)),
    progress: Math.min(1, Math.max(0, finite(value.progress))),
    divergence: Math.max(1, finite(value.divergence, 1)),
    seed: normalizePoincareSeed(value.seed),
  }
}

export function createPoincareArtifact(value = {}) {
  return {
    version: POINCARE_SKY_VERSION,
    id: 'le-ciel-de-poincare-01',
    seed: normalizePoincareSeed(value.seed || POINCARE_DEFAULT_SEED),
    memory: Array.isArray(value.memory)
      ? value.memory.slice(-POINCARE_MEMORY_LIMIT).map(normalizeMemory)
      : [],
    thresholdCrossings: Math.max(0, Math.round(finite(value.thresholdCrossings))),
    scar: normalizeScar(value.scar),
  }
}

function sameSeed(a, b) {
  return a.x === b.x && a.y === b.y
}

export function applyPoincareEvent(currentValue, event) {
  const current = createPoincareArtifact(currentValue)
  if (!event || typeof event !== 'object') return current

  if (event.type === 'seed.changed') {
    const seed = normalizePoincareSeed(event.seed)
    return sameSeed(seed, current.seed) ? current : { ...current, seed }
  }

  if (event.type === 'seed.committed') {
    const seed = normalizePoincareSeed(event.seed || current.seed)
    const previous = current.memory.at(-1)
    if (previous && sameSeed(previous.seed, seed)) return current
    const memory = [...current.memory, normalizeMemory({
      id: event.id || `placement-${Math.max(0, finite(event.at))}`,
      at: event.at,
      seed,
    }, current.memory.length)].slice(-POINCARE_MEMORY_LIMIT)
    return { ...current, seed, memory }
  }

  if (event.type === 'threshold.crossed') {
    const nextScar = normalizeScar({
      at: event.at,
      progress: event.progress,
      divergence: event.divergence,
      seed: event.seed || current.seed,
    })
    return {
      ...current,
      thresholdCrossings: current.thresholdCrossings + 1,
      scar: current.scar || nextScar,
    }
  }

  return current
}

function browserStorage() {
  return typeof window === 'undefined' ? null : window.localStorage
}

export function readPoincareArtifact(storage = browserStorage()) {
  if (!storage) return createPoincareArtifact()
  try {
    const stored = storage.getItem(POINCARE_SKY_STORAGE_KEY)
    return createPoincareArtifact(stored ? JSON.parse(stored) : undefined)
  } catch {
    return createPoincareArtifact()
  }
}

export function storePoincareArtifact(value, storage = browserStorage()) {
  const artifact = createPoincareArtifact(value)
  if (!storage) return artifact
  try {
    storage.setItem(POINCARE_SKY_STORAGE_KEY, JSON.stringify(artifact))
  } catch {
    // In-memory state remains authoritative for this visit when storage is blocked.
  }
  return artifact
}
