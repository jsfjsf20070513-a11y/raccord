import { clamp } from './planPrototypeMath'

export const FLIGHT_ARM_DELAY_MS = 140
export const FLIGHT_LOAD_DURATION_MS = 2200
export const FLIGHT_UNLOAD_DURATION_MS = 720
export const FLIGHT_SCROLL_SLOP_PX = 8
export const FLIGHT_THRESHOLD_RESET = 0.88

export function createFlightLoadCycle(load = 0) {
  const normalized = clamp(Number(load) || 0)
  return {
    phase: normalized > 0 ? 'unloading' : 'idle',
    load: normalized,
    peakLoad: normalized,
    armedFor: 0,
  }
}

export function beginFlightLoadCycle(current) {
  return {
    ...current,
    phase: 'arming',
    peakLoad: current.load,
    armedFor: 0,
  }
}

export function releaseFlightLoadCycle(current) {
  return current.load > 0
    ? { ...current, phase: 'unloading', armedFor: 0 }
    : createFlightLoadCycle()
}

export function advanceFlightLoadCycle(current, elapsedMs) {
  const elapsed = Math.max(0, Math.min(64, Number(elapsedMs) || 0))
  if (current.phase === 'arming') {
    const armedFor = current.armedFor + elapsed
    return armedFor >= FLIGHT_ARM_DELAY_MS
      ? { ...current, phase: 'loading', armedFor }
      : { ...current, armedFor }
  }
  if (current.phase === 'loading') {
    const load = clamp(current.load + elapsed / FLIGHT_LOAD_DURATION_MS)
    return {
      ...current,
      phase: load >= 1 ? 'loaded' : 'loading',
      load,
      peakLoad: Math.max(current.peakLoad, load),
    }
  }
  if (current.phase === 'unloading') {
    const load = clamp(current.load - elapsed / FLIGHT_UNLOAD_DURATION_MS)
    return load <= 0
      ? createFlightLoadCycle()
      : { ...current, load }
  }
  return current
}
