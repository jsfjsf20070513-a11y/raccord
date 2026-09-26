import { useCallback, useEffect, useMemo, useState } from 'react'
import { applyPoincareEvent } from './domain/poincareSkyState'
import { readPoincareArtifact, storePoincareArtifact } from './persistence'

export default function usePoincareSky() {
  const [artifact, setArtifact] = useState(readPoincareArtifact)

  useEffect(() => { storePoincareArtifact(artifact) }, [artifact])

  const commit = useCallback((event) => {
    setArtifact((current) => {
      const timedEvent = event?.at == null ? { ...event, at: Date.now() } : event
      const next = applyPoincareEvent(current, timedEvent)
      return next
    })
  }, [])

  const changeSeed = useCallback((seed) => commit({ type: 'seed.changed', seed }), [commit])
  const rememberSeed = useCallback((seed) => commit({ type: 'seed.committed', seed }), [commit])
  const recordThreshold = useCallback((event) => commit({ type: 'threshold.crossed', ...event }), [commit])
  const recallMemory = useCallback((id) => commit({ type: 'memory.recalled', id }), [commit])
  const recordObservation = useCallback((event) => commit({ type: 'observation.recorded', ...event }), [commit])

  return useMemo(() => ({
    artifact,
    changeSeed,
    rememberSeed,
    recordThreshold,
    recallMemory,
    recordObservation,
  }), [artifact, changeSeed, rememberSeed, recordThreshold, recallMemory, recordObservation])
}
