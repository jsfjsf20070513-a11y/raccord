import { afterEach, describe, expect, it, vi } from 'vitest'
import { readWorldState, storeWorldState } from './worldState'

afterEach(() => vi.unstubAllGlobals())

describe('世界选择的保存', () => {
  it('禁止浏览器存储时仍可进入作品', () => {
    vi.stubGlobal('window', Object.defineProperty({}, 'localStorage', { get() { throw new Error('blocked') } }))
    expect(readWorldState()).toEqual({ world: 'carnet', hasEntered: false })
    expect(() => storeWorldState({ world: 'plan', hasEntered: true })).not.toThrow()
  })
  it('读取旧键，之后只向 Raccord 的键写入', () => {
    const values = new Map([['carnet_world', 'plan'], ['carnet_visited', '1']])
    const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }
    const state = readWorldState(storage)
    expect(state).toEqual({ world: 'plan', hasEntered: true })
    storeWorldState({ ...state, world: 'limite' }, storage)
    expect(readWorldState(storage).world).toBe('limite')
    expect(values.get('carnet_world')).toBe('plan')
  })
})
