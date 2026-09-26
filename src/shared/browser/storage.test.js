import { afterEach, describe, expect, it, vi } from 'vitest'
import { browserStorage, readStored, writeStored } from './storage'
import { readWorldState, storeWorldState } from '../world/worldState'
import { createPoincareArtifact } from '../../chapters/poincare/domain/poincareSkyState'
import { readPoincareArtifact, storePoincareArtifact } from '../../chapters/poincare/persistence'

afterEach(() => vi.unstubAllGlobals())

describe('local state without browser storage', () => {
  it('survives a blocked localStorage getter', () => {
    vi.stubGlobal('window', Object.defineProperty({}, 'localStorage', { get() { throw new Error('blocked') } }))
    expect(browserStorage()).toBeNull()
    expect(readWorldState()).toEqual({ world: 'carnet', hasEntered: false })
    expect(readPoincareArtifact()).toEqual(createPoincareArtifact())
    expect(() => storeWorldState({ world: 'plan', hasEntered: true })).not.toThrow()
    expect(storePoincareArtifact({ seed: { x: .3, y: .4 } }).seed).toEqual({ x: .3, y: .4 })
  })
  it('survives a readable storage object that denies operations', () => {
    const storage = { getItem() { throw new Error('blocked') }, setItem() { throw new Error('quota') } }
    expect(readStored('key', storage)).toBeNull()
    expect(() => writeStored('key', 'value', storage)).not.toThrow()
    expect(readPoincareArtifact(storage)).toEqual(createPoincareArtifact())
  })
  it('reads earlier work state, then writes only the Raccord keys', () => {
    const values = new Map([['carnet_world', 'plan'], ['carnet_visited', '1']])
    const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }
    const state = readWorldState(storage)
    expect(state).toEqual({ world: 'plan', hasEntered: true })
    storeWorldState({ ...state, world: 'limite' }, storage)
    expect(readWorldState(storage).world).toBe('limite')
    expect(values.get('carnet_world')).toBe('plan')
  })
  it.each(['null', 'false', '[]', '{bad json'])('recovers from malformed artifact %s', stored => {
    expect(readPoincareArtifact({ getItem: () => stored })).toEqual(createPoincareArtifact())
  })
})
