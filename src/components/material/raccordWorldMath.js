import {
  CURVE_MODEL,
  clamp,
  createCurveJoin,
  cubicPoint,
} from './planPrototypeMath'

export const RACCORD_ARTIFACT = {
  id: 'raccord-01',
  title: 'Raccord',
  origin: 'Suzhou',
  destination: 'Paris',
}

export const RACCORD_LEGACY_STORAGE_KEY = 'raccord_artifact_v1'
export const RACCORD_LOAD_THRESHOLD = 0.94

export function normalizeRaccordHandle(value) {
  const x = Number(value?.x)
  const y = Number(value?.y)
  if (!Number.isFinite(x) || !Number.isFinite(y)) return { ...CURVE_MODEL.initialHandle }
  return {
    x: clamp(x, 0.53, 0.77),
    y: clamp(y, 0.28, 0.76),
  }
}

export function joinedCurveSamples({
  handle = CURVE_MODEL.initialHandle,
  steps = 72,
} = {}) {
  const safeSteps = Math.max(8, Math.round(steps))
  const { left, right } = createCurveJoin(handle)
  const leftSamples = Array.from({ length: safeSteps + 1 }, (_, index) => (
    cubicPoint(left, index / safeSteps)
  ))
  const rightSamples = Array.from({ length: safeSteps }, (_, index) => (
    cubicPoint(right, (index + 1) / safeSteps)
  ))

  return [...leftSamples, ...rightSamples]
}

export function flightLoadMetrics(value = 0) {
  const load = clamp(value)
  const margin = 1 - load
  const deflection = 0.008 + load ** 2 * 0.13
  const instability = clamp((load - 0.72) / 0.28)
  const regime = load >= RACCORD_LOAD_THRESHOLD ? 'seuil' : load >= 0.72 ? 'proche' : 'stable'

  return { load, margin, deflection, instability, regime }
}

export function deformRaccordPoint(point, loadValue = 0) {
  const metrics = flightLoadMetrics(loadValue)
  const span = clamp((point.x - 0.05) / 0.9)
  const envelope = Math.sin(span * Math.PI)
  const flutter = Math.sin(span * Math.PI * 4) * metrics.instability * 0.007 * envelope

  return {
    x: point.x,
    y: point.y + metrics.deflection * envelope + flutter,
  }
}

export function raccordInterpretationSamples({
  handle = CURVE_MODEL.initialHandle,
  load = 0,
  steps = 72,
} = {}) {
  const source = joinedCurveSamples({ handle, steps })
    .map((point) => deformRaccordPoint(point, load))
  return source.map((point, index) => {
    if (index === 0 || index === source.length - 1) return { x: index / (source.length - 1), y: 0.5 }
    const previous = source[index - 1]
    const next = source[index + 1]
    const incoming = { x: point.x - previous.x, y: point.y - previous.y }
    const outgoing = { x: next.x - point.x, y: next.y - point.y }
    const turn = Math.atan2(
      incoming.x * outgoing.y - incoming.y * outgoing.x,
      incoming.x * outgoing.x + incoming.y * outgoing.y,
    )
    return {
      x: index / (source.length - 1),
      y: 0.5 - clamp(turn * 3.2, -0.34, 0.34),
    }
  })
}
