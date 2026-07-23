import { useCallback, useMemo, useState } from 'react'
import {
  applyPoincareEvent,
  readPoincareArtifact,
  storePoincareArtifact,
} from './poincareSkyState'

export default function usePoincareSky() {
  const [artifact, setArtifact] = useState(readPoincareArtifact)

  const commit = useCallback((event) => {
    setArtifact((current) => {
      const timedEvent = event?.at == null ? { ...event, at: Date.now() } : event
      const next = applyPoincareEvent(current, timedEvent)
      if (next !== current) storePoincareArtifact(next)
      return next
    })
  }, [])

  const changeSeed = useCallback((seed) => commit({ type: 'seed.changed', seed }), [commit])
  const rememberSeed = useCallback((seed) => commit({ type: 'seed.committed', seed }), [commit])
  const recordThreshold = useCallback((event) => commit({ type: 'threshold.crossed', ...event }), [commit])

  return useMemo(() => ({
    artifact,
    changeSeed,
    rememberSeed,
    recordThreshold,
  }), [artifact, changeSeed, rememberSeed, recordThreshold])
}
