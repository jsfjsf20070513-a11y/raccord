import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import {
  VISITED_STORAGE_KEY,
  WORLD_IDS,
  WORLD_STORAGE_KEY,
  WorldContext,
  readStoredWorld,
} from './world-context'

export default function WorldProvider({ children }) {
  const [world, setWorldState] = useState(readStoredWorld)

  const setWorld = useCallback((nextWorld) => {
    const safeWorld = WORLD_IDS.includes(nextWorld) ? nextWorld : 'carnet'
    setWorldState(safeWorld)

    try {
      window.localStorage.setItem(WORLD_STORAGE_KEY, safeWorld)
    } catch {
      // The visual choice still works for this visit when storage is blocked.
    }
  }, [])

  const enterWorld = useCallback((nextWorld) => {
    setWorld(nextWorld)
    try {
      window.localStorage.setItem(VISITED_STORAGE_KEY, '1')
    } catch {
      // A storage failure must not trap the visitor on the entrance screen.
    }
  }, [setWorld])

  useLayoutEffect(() => {
    document.documentElement.dataset.world = world
    document.documentElement.style.colorScheme = world === 'limite' ? 'dark' : 'light'
  }, [world])

  const value = useMemo(() => ({ world, setWorld, enterWorld }), [enterWorld, setWorld, world])

  return <WorldContext.Provider value={value}>{children}</WorldContext.Provider>
}
