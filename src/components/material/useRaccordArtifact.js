import {
  applyRaccordEvent,
  readRaccordArtifact,
  storeRaccordArtifact,
} from './raccordArtifactState'
import { useCallback, useMemo, useState } from 'react'

export default function useRaccordArtifact() {
  const [artifact, setArtifact] = useState(readRaccordArtifact)

  const commit = useCallback((event) => {
    setArtifact((current) => {
      const timedEvent = event?.at == null ? { ...event, at: Date.now() } : event
      const next = applyRaccordEvent(current, timedEvent)
      if (next !== current) storeRaccordArtifact(next)
      return next
    })
  }, [])

  const changeHandle = useCallback((handle) => {
    commit({ type: 'handle.changed', handle })
  }, [commit])

  const completeConstruction = useCallback((completion) => {
    commit({ type: 'construction.completed', ...completion })
  }, [commit])

  const recordFlightTest = useCallback((test) => {
    commit({ type: 'flight.tested', ...test })
  }, [commit])

  return useMemo(() => ({
    artifact,
    changeHandle,
    completeConstruction,
    recordFlightTest,
  }), [artifact, changeHandle, completeConstruction, recordFlightTest])
}
