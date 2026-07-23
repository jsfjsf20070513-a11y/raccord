export const PLAN_PROTOTYPE_VARIANTS = ['A', 'B', 'C']

export const PLAN_PROTOTYPE_META = {
  A: {
    name: 'Raccord',
    title: 'Atelier de raccord',
    plate: 'Planche 01 · continuité',
    action: 'Ajuster une poignée',
  },
  B: {
    name: 'Charpente',
    title: 'Charpente plane',
    plate: 'Planche 02 · rigidité',
    action: 'Ajouter une traverse',
  },
  C: {
    name: 'Composition',
    title: 'Composition 2×2',
    plate: 'Planche 03 · ordre',
    action: 'Insérer une plaque',
  },
}

export const CURVE_MODEL = {
  left: [
    { x: 0.08, y: 0.69 },
    { x: 0.18, y: 0.25 },
    { x: 0.34, y: 0.48 },
    { x: 0.5, y: 0.52 },
  ],
  rightTail: [
    { x: 0.82, y: 0.41 },
    { x: 0.94, y: 0.32 },
  ],
  initialHandle: { x: 0.63, y: 0.69 },
  targetHandle: { x: 0.66, y: 0.56 },
}

export const FRAME_NODES = [
  { x: 0.18, y: 0.76 },
  { x: 0.24, y: 0.22 },
  { x: 0.78, y: 0.28 },
  { x: 0.84, y: 0.74 },
]

export const FRAME_PERIMETER = [[0, 1], [1, 2], [2, 3], [3, 0]]
export const FRAME_BRACES = [[0, 2], [1, 3]]

export const TRANSFORM_LIBRARY = {
  H: { label: 'H .55', matrix: [1, 0.55, 0, 1] },
  R: {
    label: 'R 30°',
    matrix: [Math.cos(Math.PI / 6), -Math.sin(Math.PI / 6), Math.sin(Math.PI / 6), Math.cos(Math.PI / 6)],
  },
  S: { label: 'S 1.3', matrix: [1.3, 0, 0, 0.72] },
  M: { label: 'M x', matrix: [-1, 0, 0, 1] },
}

export const TRANSFORM_TARGET_STEPS = ['H', 'R', 'S']

export function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

export function snapRaccordHandle(handle, tolerance = 0.025) {
  const normalized = {
    x: clamp(Number(handle?.x) || CURVE_MODEL.initialHandle.x, 0.53, 0.77),
    y: clamp(Number(handle?.y) || CURVE_MODEL.initialHandle.y, 0.28, 0.76),
  }
  return Math.hypot(
    normalized.x - CURVE_MODEL.targetHandle.x,
    normalized.y - CURVE_MODEL.targetHandle.y,
  ) <= tolerance
    ? { ...CURVE_MODEL.targetHandle }
    : normalized
}

export function isExactRaccordCalibration(handle, tolerance = 1e-9) {
  return Math.hypot(
    Number(handle?.x) - CURVE_MODEL.targetHandle.x,
    Number(handle?.y) - CURVE_MODEL.targetHandle.y,
  ) <= tolerance
}

export function normalizePlanPrototypeVariant(value) {
  const normalized = String(value || '').toUpperCase()
  return PLAN_PROTOTYPE_VARIANTS.includes(normalized) ? normalized : null
}

export function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y }
}

export function subtract(a, b) {
  return { x: a.x - b.x, y: a.y - b.y }
}

export function scale(point, amount) {
  return { x: point.x * amount, y: point.y * amount }
}

export function magnitude(point) {
  return Math.hypot(point.x, point.y)
}

export function cubicPoint(points, t) {
  const inverse = 1 - t
  const a = inverse ** 3
  const b = 3 * inverse ** 2 * t
  const c = 3 * inverse * t ** 2
  const d = t ** 3
  return {
    x: points[0].x * a + points[1].x * b + points[2].x * c + points[3].x * d,
    y: points[0].y * a + points[1].y * b + points[2].y * c + points[3].y * d,
  }
}

export function cubicDerivative(points, t) {
  const inverse = 1 - t
  return {
    x: 3 * inverse ** 2 * (points[1].x - points[0].x)
      + 6 * inverse * t * (points[2].x - points[1].x)
      + 3 * t ** 2 * (points[3].x - points[2].x),
    y: 3 * inverse ** 2 * (points[1].y - points[0].y)
      + 6 * inverse * t * (points[2].y - points[1].y)
      + 3 * t ** 2 * (points[3].y - points[2].y),
  }
}

export function cubicSecondDerivative(points, t) {
  return {
    x: 6 * (1 - t) * (points[2].x - 2 * points[1].x + points[0].x)
      + 6 * t * (points[3].x - 2 * points[2].x + points[1].x),
    y: 6 * (1 - t) * (points[2].y - 2 * points[1].y + points[0].y)
      + 6 * t * (points[3].y - 2 * points[2].y + points[1].y),
  }
}

export function signedCurvature(points, t) {
  const first = cubicDerivative(points, t)
  const second = cubicSecondDerivative(points, t)
  const speed = magnitude(first)
  if (speed < 1e-9) return 0
  return (first.x * second.y - first.y * second.x) / speed ** 3
}

export function createCurveJoin(handle = CURVE_MODEL.initialHandle) {
  const join = CURVE_MODEL.left[3]
  return {
    left: CURVE_MODEL.left,
    right: [join, handle, ...CURVE_MODEL.rightTail],
    handle,
    targetHandle: CURVE_MODEL.targetHandle,
  }
}

export function curveJoinMetrics(handle = CURVE_MODEL.initialHandle) {
  const { left, right } = createCurveJoin(handle)
  const leftFirst = cubicDerivative(left, 1)
  const rightFirst = cubicDerivative(right, 0)
  const leftSecond = cubicSecondDerivative(left, 1)
  const rightSecond = cubicSecondDerivative(right, 0)
  const firstScale = Math.max(magnitude(leftFirst), magnitude(rightFirst), 1e-9)
  const secondScale = Math.max(magnitude(leftSecond), magnitude(rightSecond), 1e-9)
  const cosine = clamp(
    (leftFirst.x * rightFirst.x + leftFirst.y * rightFirst.y)
      / Math.max(1e-9, magnitude(leftFirst) * magnitude(rightFirst)),
    -1,
    1,
  )
  const angle = Math.acos(cosine) * (180 / Math.PI)
  const firstResidual = magnitude(subtract(rightFirst, leftFirst)) / firstScale
  const secondResidual = magnitude(subtract(rightSecond, leftSecond)) / secondScale
  const curvatureJump = Math.abs(signedCurvature(left, 1) - signedCurvature(right, 0))
  let grade = 'G⁰'
  if (angle < 1.2) grade = 'G¹'
  if (angle < 1.2 && firstResidual < 0.045) grade = 'C¹'
  if (angle < 1.2 && firstResidual < 0.045 && secondResidual < 0.065) grade = 'C²'

  return {
    grade,
    angle,
    firstResidual,
    secondResidual,
    curvatureJump,
  }
}

export function matrixRank(matrix, tolerance = 1e-9) {
  if (!matrix.length || !matrix[0]?.length) return 0
  const work = matrix.map((row) => [...row])
  const rows = work.length
  const columns = work[0].length
  let rank = 0

  for (let column = 0; column < columns && rank < rows; column += 1) {
    let pivot = rank
    for (let row = rank + 1; row < rows; row += 1) {
      if (Math.abs(work[row][column]) > Math.abs(work[pivot][column])) pivot = row
    }
    if (Math.abs(work[pivot][column]) <= tolerance) continue
    ;[work[rank], work[pivot]] = [work[pivot], work[rank]]
    const divisor = work[rank][column]
    for (let next = column; next < columns; next += 1) work[rank][next] /= divisor
    for (let row = 0; row < rows; row += 1) {
      if (row === rank) continue
      const factor = work[row][column]
      for (let next = column; next < columns; next += 1) {
        work[row][next] -= factor * work[rank][next]
      }
    }
    rank += 1
  }

  return rank
}

export function rigidityMetrics(braceMask = 0, nodes = FRAME_NODES) {
  const braces = FRAME_BRACES.filter((_, index) => braceMask & (1 << index))
  const edges = [...FRAME_PERIMETER, ...braces]
  const matrix = edges.map(([from, to]) => {
    const row = Array(nodes.length * 2).fill(0)
    const dx = nodes[from].x - nodes[to].x
    const dy = nodes[from].y - nodes[to].y
    row[from * 2] = dx
    row[from * 2 + 1] = dy
    row[to * 2] = -dx
    row[to * 2 + 1] = -dy
    return row
  })
  const rank = matrixRank(matrix)
  return {
    edges,
    rank,
    mechanisms: Math.max(0, nodes.length * 2 - rank - 3),
    selfStress: Math.max(0, edges.length - rank),
  }
}

export function multiply2x2(left, right) {
  return [
    left[0] * right[0] + left[1] * right[2],
    left[0] * right[1] + left[1] * right[3],
    left[2] * right[0] + left[3] * right[2],
    left[2] * right[1] + left[3] * right[3],
  ]
}

export function composeTransforms(steps = []) {
  return steps.reduce(
    (current, step) => multiply2x2(TRANSFORM_LIBRARY[step]?.matrix || [1, 0, 0, 1], current),
    [1, 0, 0, 1],
  )
}

export function matrixMetrics(matrix, target = composeTransforms(TRANSFORM_TARGET_STEPS)) {
  const [a, b, c, d] = matrix
  const determinant = a * d - b * c
  const p = a * a + c * c
  const q = a * b + c * d
  const r = b * b + d * d
  const midpoint = (p + r) * 0.5
  const spread = Math.sqrt(Math.max(0, ((p - r) * 0.5) ** 2 + q * q))
  const sigmaMax = Math.sqrt(Math.max(0, midpoint + spread))
  const sigmaMin = Math.sqrt(Math.max(0, midpoint - spread))
  const residual = Math.hypot(...matrix.map((value, index) => value - target[index]))
  return {
    determinant,
    condition: sigmaMin < 1e-8 ? Number.POSITIVE_INFINITY : sigmaMax / sigmaMin,
    residual,
    matched: residual < 0.025,
  }
}
