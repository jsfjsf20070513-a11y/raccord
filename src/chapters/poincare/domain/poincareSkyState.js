import { POINCARE_DEFAULT_SEED, createPoincareSky, normalizePoincareSeed, observePoincareSky } from './poincareSkyMath.js'

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
    observedProgress: Math.min(1, Math.max(0, finite(value?.observedProgress))),
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
  if (!value || typeof value !== 'object') value = {}
  const memory = Array.isArray(value.memory)
    ? value.memory.slice(-POINCARE_MEMORY_LIMIT).map(normalizeMemory)
    : []
  return {
    version: POINCARE_SKY_VERSION,
    id: 'le-ciel-de-poincare-01',
    seed: normalizePoincareSeed(value.seed || POINCARE_DEFAULT_SEED),
    memory,
    thresholdCrossings: Math.max(0, Math.round(finite(value.thresholdCrossings))),
    scar: normalizeScar(value.scar),
    discoveries: {
      placed: value.discoveries?.placed === true || hasDifferentPlacements(memory),
      recalled: value.discoveries?.recalled === true,
      observed: value.discoveries?.observed === true,
    },
  }
}

function hasDifferentPlacements(memory) {
  return memory.some((a) => memory.some((b) => Math.hypot(a.seed.x - b.seed.x, a.seed.y - b.seed.y) >= 0.06))
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
      id: event.id || `placement-${Math.max(0, finite(event.at))}-${seed.x}-${seed.y}`,
      at: event.at,
      seed,
    }, current.memory.length)].slice(-POINCARE_MEMORY_LIMIT)
    return { ...current, seed, memory, discoveries: { ...current.discoveries, placed: current.discoveries.placed || hasDifferentPlacements(memory) } }
  }

  if (event.type === 'memory.recalled') {
    const entry = current.memory.find(({ id }) => id === event.id)
    if (!entry || sameSeed(entry.seed, current.seed)) return current
    return { ...current, seed: entry.seed, discoveries: { ...current.discoveries, recalled: true } }
  }

  if (event.type === 'observation.recorded') {
    const seed = normalizePoincareSeed(event.seed || current.seed)
    const progress = Math.min(1, Math.max(0, finite(event.progress)))
    if (progress === 0) return current
    const index = current.memory.findLastIndex((entry) => sameSeed(entry.seed, seed))
    if (index >= 0 && current.memory[index].observedProgress >= progress) return current
    const memory = [...current.memory]
    if (index >= 0) memory[index] = { ...memory[index], observedProgress: progress }
    else memory.push(normalizeMemory({ id: `observation-${Math.max(0, finite(event.at))}-${seed.x}-${seed.y}`, at: event.at, seed, observedProgress: progress }, memory.length))
    const observation = observePoincareSky(createPoincareSky(seed), progress)
    return {
      ...current,
      memory: memory.slice(-POINCARE_MEMORY_LIMIT),
      discoveries: { ...current.discoveries, observed: current.discoveries.observed || observation.crossing !== null || observation.complete },
    }
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
      discoveries: { ...current.discoveries, observed: true },
    }
  }

  return current
}
