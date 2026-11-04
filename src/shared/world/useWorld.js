import { useContext } from 'react'
import { WorldContext } from './world-context.js'

export function useWorld() {
  return useContext(WorldContext)
}
