export const POINCARE_DEFAULT_SEED = Object.freeze({ x: 0.34, y: 0.5 })
export const POINCARE_PERTURBATION = 0.00072
export const POINCARE_DIVERGENCE_THRESHOLD = 18

const ROSSLER = Object.freeze({ a: 0.2, b: 0.2, c: 5.7 })

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

function finite(value, fallback) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

export function normalizePoincareSeed(value = POINCARE_DEFAULT_SEED) {
  return {
    x: clamp(finite(value?.x, POINCARE_DEFAULT_SEED.x), 0.16, 0.82),
    y: clamp(finite(value?.y, POINCARE_DEFAULT_SEED.y), 0.2, 0.8),
  }
}

function derivative([x, y, z]) {
  return [
    -y - z,
    x + ROSSLER.a * y,
    ROSSLER.b + z * (x - ROSSLER.c),
  ]
}

function addScaled(state, delta, scale) {
  return state.map((value, index) => value + delta[index] * scale)
}

function rk4(state, dt) {
  const k1 = derivative(state)
  const k2 = derivative(addScaled(state, k1, dt * 0.5))
  const k3 = derivative(addScaled(state, k2, dt * 0.5))
  const k4 = derivative(addScaled(state, k3, dt))
  return state.map((value, index) => value + (dt / 6) * (
    k1[index] + 2 * k2[index] + 2 * k3[index] + k4[index]
  ))
}

function distance(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
}

function initialState(seed) {
  const safe = normalizePoincareSeed(seed)
  return [
    -4.7 + (safe.x - POINCARE_DEFAULT_SEED.x) * 2.8,
    0.12 + (POINCARE_DEFAULT_SEED.y - safe.y) * 2.2,
    0.035 + (safe.x + safe.y) * 0.018,
  ]
}

/**
 * A deterministic Rössler flow is used as a compact, honest model of sensitive
 * dependence. The chapter treats the projection as a phase-space sky, not as
 * a literal reconstruction of Poincaré's three-body calculations.
 */
export function createPoincareSky(seed, {
  steps = 2600,
  warmup = 420,
  stride = 2,
  dt = 0.025,
} = {}) {
  const safeSeed = normalizePoincareSeed(seed)
  let first = initialState(safeSeed)
  let second = [
    first[0] + POINCARE_PERTURBATION,
    first[1] - POINCARE_PERTURBATION * 0.58,
    first[2] + POINCARE_PERTURBATION * 0.21,
  ]

  for (let index = 0; index < warmup; index += 1) {
    first = rk4(first, dt)
    second = rk4(second, dt)
  }

  const pathA = []
  const pathB = []
  const separation = []
  const initialDistance = Math.max(distance(first, second), Number.EPSILON)
  let thresholdIndex = -1

  for (let index = 0; index <= steps; index += 1) {
    if (index % stride === 0) {
      const ratio = distance(first, second) / initialDistance
      pathA.push({ x: first[0], y: first[1], z: first[2] })
      pathB.push({ x: second[0], y: second[1], z: second[2] })
      separation.push(ratio)
      if (thresholdIndex < 0 && ratio >= POINCARE_DIVERGENCE_THRESHOLD) {
        thresholdIndex = separation.length - 1
      }
    }
    first = rk4(first, dt)
    second = rk4(second, dt)
  }

  const thresholdProgress = thresholdIndex < 0
    ? 0.72
    : thresholdIndex / Math.max(1, separation.length - 1)

  return {
    seed: safeSeed,
    pathA,
    pathB,
    separation,
    initialDistance,
    thresholdIndex,
    thresholdProgress: clamp(thresholdProgress, 0.38, 0.86),
    maxDivergence: Math.max(...separation),
  }
}

export function pathBounds(...paths) {
  const points = paths.flat().filter((point) => Number.isFinite(point?.x) && Number.isFinite(point?.y))
  if (!points.length) return { minX: -1, maxX: 1, minY: -1, maxY: 1 }
  const xs = points.map((point) => point.x)
  const ys = points.map((point) => point.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  return {
    minX,
    maxX: maxX === minX ? minX + 1 : maxX,
    minY,
    maxY: maxY === minY ? minY + 1 : maxY,
  }
}

export function projectSkyPoint(point, bounds, width, height, padding = 0) {
  const usableWidth = Math.max(1, width - padding * 2)
  const usableHeight = Math.max(1, height - padding * 2)
  return {
    x: padding + ((point.x - bounds.minX) / (bounds.maxX - bounds.minX)) * usableWidth,
    y: padding + (1 - (point.y - bounds.minY) / (bounds.maxY - bounds.minY)) * usableHeight,
  }
}

export function separationAtProgress(sky, progress) {
  if (!sky?.separation?.length) return 1
  const safeProgress = clamp(finite(progress, 0))
  const index = Math.min(sky.separation.length - 1, Math.round(safeProgress * (sky.separation.length - 1)))
  return sky.separation[index]
}

/**
 * A shared, normalized handwriting of the sky. Every world translates these
 * same samples into its own material instead of redrawing a merely similar
 * curve from a different projection.
 */
export function createPoincareSignature(sky, anchorCount = 7) {
  const pathA = Array.isArray(sky?.pathA) ? sky.pathA : []
  const pathB = Array.isArray(sky?.pathB) ? sky.pathB : []
  const separation = Array.isArray(sky?.separation) ? sky.separation : []
  if (!pathA.length || !pathB.length) return []

  const count = Math.max(2, Math.round(finite(anchorCount, 7)))
  const yValues = [...pathA, ...pathB]
    .map((point) => Number(point?.y))
    .filter(Number.isFinite)
  const min = yValues.length ? Math.min(...yValues) : -1
  const max = yValues.length ? Math.max(...yValues) : 1
  const span = Math.max(0.001, max - min)
  const maxLog = Math.max(1, Math.log10(Math.max(10, finite(sky?.maxDivergence, 10))))

  return Array.from({ length: count }, (_, anchorIndex) => {
    const progress = anchorIndex / (count - 1)
    const pathIndex = Math.min(pathA.length - 1, Math.round(progress * (pathA.length - 1)))
    const first = finite(pathA[pathIndex]?.y, min)
    const second = finite(pathB[pathIndex]?.y, first)
    const ratio = Math.max(1, finite(separation[pathIndex], 1))
    return {
      progress,
      primary: (first - min) / span - 0.5,
      secondary: (second - min) / span - 0.5,
      divergence: clamp(Math.log10(ratio) / maxLog),
    }
  })
}
