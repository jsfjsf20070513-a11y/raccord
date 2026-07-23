import { createContext } from 'react'

export const WORLD_STORAGE_KEY = 'carnet_world'
export const VISITED_STORAGE_KEY = 'carnet_visited'
export const WORLD_IDS = ['carnet', 'plan', 'limite']

export const WorldContext = createContext({
  world: 'carnet',
  setWorld: () => {},
  enterWorld: () => {},
})

export function readStoredWorld() {
  if (typeof window === 'undefined') return 'carnet'

  try {
    const stored = window.localStorage.getItem(WORLD_STORAGE_KEY)
    return WORLD_IDS.includes(stored) ? stored : 'carnet'
  } catch {
    return 'carnet'
  }
}

export function hasEnteredCarnet() {
  if (typeof window === 'undefined') return false

  try {
    return window.localStorage.getItem(VISITED_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}
