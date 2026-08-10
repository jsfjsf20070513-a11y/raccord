import { useCallback, useEffect, useRef, useState } from 'react'
import { EVIDENCE_INTERVAL_MS, HORIZON_DEFAULT_DIRECTION_DEG } from './horizonMath'
import {
  horizonElapsedMs,
  isHorizonReleased,
  readHorizonState,
  releaseHorizon,
  writeHorizonState,
} from './horizonState'

function browserStorage() {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export default function useHorizonChapter({
  clock = Date.now,
  storage = browserStorage(),
} = {}) {
  const [state, setState] = useState(() => readHorizonState(storage))
  const stateRef = useRef(state)
  const [draftDirectionDeg, setDraftDirectionDeg] = useState(
    state.releaseDirectionDeg ?? HORIZON_DEFAULT_DIRECTION_DEG,
  )
  const [now, setNow] = useState(() => clock())
  const released = isHorizonReleased(state)

  const release = useCallback((directionDeg = draftDirectionDeg) => {
    const current = stateRef.current
    const next = releaseHorizon(current, {
      directionDeg,
      at: clock(),
    })

    if (next === current) return
    stateRef.current = next
    writeHorizonState(storage, next)
    setState(next)
    setNow(next.releasedAt)
  }, [clock, draftDirectionDeg, storage])

  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    if (!released || typeof document === 'undefined') return undefined

    let timer = 0

    const schedule = () => {
      window.clearTimeout(timer)
      if (document.visibilityState === 'hidden') return

      const currentNow = clock()
      setNow(currentNow)
      const elapsed = horizonElapsedMs(state, currentNow)
      const remaining = EVIDENCE_INTERVAL_MS - (elapsed % EVIDENCE_INTERVAL_MS)
      timer = window.setTimeout(schedule, Math.max(240, remaining + 16))
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        window.clearTimeout(timer)
      } else {
        schedule()
      }
    }

    schedule()
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [clock, released, state])

  return {
    state,
    released,
    now,
    elapsedMs: horizonElapsedMs(state, now),
    draftDirectionDeg,
    setDraftDirectionDeg,
    release,
  }
}
