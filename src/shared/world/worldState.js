import { browserStorage, readStored, writeStored } from '../browser/storage'
import { WORLD_IDS } from './worlds'

export const WORLD_STORAGE_KEY = 'raccord_world_v1'
export const VISITED_STORAGE_KEY = 'raccord_visited_v1'

export function normalizeWorld(world) {
  return WORLD_IDS.includes(world) ? world : 'carnet'
}

export function readWorldState(storage = browserStorage()) {
  return {
    world: normalizeWorld(readStored(WORLD_STORAGE_KEY, storage) ?? readStored('carnet_world', storage)),
    hasEntered: (readStored(VISITED_STORAGE_KEY, storage) ?? readStored('carnet_visited', storage)) === '1',
  }
}

export function storeWorldState(state, storage = browserStorage()) {
  writeStored(WORLD_STORAGE_KEY, normalizeWorld(state.world), storage)
  if (state.hasEntered) writeStored(VISITED_STORAGE_KEY, '1', storage)
}
