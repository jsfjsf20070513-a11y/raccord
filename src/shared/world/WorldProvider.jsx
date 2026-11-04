import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { WorldContext } from './world-context'
import { normalizeWorld, readWorldState, storeWorldState } from './worldState'

export default function WorldProvider({ children }) {
  const [state, setState] = useState(readWorldState)
  const setWorld = useCallback((world) => {
    setState((current) => ({ ...current, world: normalizeWorld(world) }))
  }, [])
  const enterWorld = useCallback((world) => {
    setState({ world: normalizeWorld(world), hasEntered: true })
  }, [])

  useEffect(() => { storeWorldState(state) }, [state])
  useLayoutEffect(() => {
    document.documentElement.dataset.world = state.world
    document.documentElement.style.colorScheme = state.world === 'limite' ? 'dark' : 'light'
  }, [state.world])

  const value = useMemo(() => ({ ...state, setWorld, enterWorld }), [state, setWorld, enterWorld])
  return <WorldContext.Provider value={value}>{children}</WorldContext.Provider>
}
