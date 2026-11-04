import { afterEach, describe, expect, it, vi } from 'vitest'
import { browserStorage, readStored, writeStored } from './storage'

afterEach(() => vi.unstubAllGlobals())

describe('浏览器存储不可用', () => {
  it('访问 localStorage 本身被禁止时仍能读写内存状态', () => {
    vi.stubGlobal('window', Object.defineProperty({}, 'localStorage', { get() { throw new Error('blocked') } }))
    expect(browserStorage()).toBeNull()
    expect(readStored('key')).toBeNull()
    expect(() => writeStored('key', 'value')).not.toThrow()
  })
  it('读取被禁止或空间已满时不抛出异常', () => {
    const storage = { getItem() { throw new Error('blocked') }, setItem() { throw new Error('quota') } }
    expect(readStored('key', storage)).toBeNull()
    expect(() => writeStored('key', 'value', storage)).not.toThrow()
  })
})
