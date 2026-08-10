import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  FOUCAULT_STORAGE_KEY,
  createDormantState,
  isReleased,
  observeState,
  parseStoredState,
  releaseState,
  serializeState,
} from './foucaultState'

const OBSERVE_INTERVAL_MS = 20_000

function readStorage(storage, clock) {
  try {
    return parseStoredState(storage?.getItem(FOUCAULT_STORAGE_KEY), clock())
  } catch {
    return createDormantState()
  }
}

function writeStorage(storage, state) {
  try {
    storage?.setItem(FOUCAULT_STORAGE_KEY, serializeState(state))
  } catch {
    // Storage unavailable: the chapter still runs, it just forgets on reload.
  }
}

/**
 * Owns the chapter artifact: hydrate once from storage, release exactly once,
 * stamp lastObservedAt while visible. All time comes from the injected clock;
 * per-frame derivations stay pure in foucaultMath/foucaultState.
 */
export default function useFoucaultHorizon({ clock = () => Date.now(), storage } = {}) {
  const storageRef = useRef(storage === undefined && typeof window !== 'undefined'
    ? window.localStorage
    : storage)
  const clockRef = useRef(clock)
  clockRef.current = clock

  const [state, setState] = useState(() => readStorage(storageRef.current, clockRef.current))

  const release = useCallback((directionDeg) => {
    setState((current) => {
      const next = releaseState(current, directionDeg, clockRef.current())
      if (next !== current) writeStorage(storageRef.current, next)
      return next
    })
  }, [])

  const released = isReleased(state)

  useEffect(() => {
    if (!released) return undefined
    const stamp = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
      setState((current) => {
        const next = observeState(current, clockRef.current())
        if (next !== current) writeStorage(storageRef.current, next)
        return next
      })
    }
    const interval = window.setInterval(stamp, OBSERVE_INTERVAL_MS)
    const onVisibility = () => stamp()
    document.addEventListener('visibilitychange', onVisibility)
    stamp()
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [released])

  return useMemo(() => ({ state, release, clock: clockRef }), [state, release])
}
