import { afterEach, describe, expect, it, vi } from 'vitest'
import { readPoincareArtifact, storePoincareArtifact } from './persistence'
import { applyPoincareEvent, createPoincareArtifact, POINCARE_SKY_STORAGE_KEY } from './domain/poincareSkyState'

afterEach(() => vi.unstubAllGlobals())

describe('章节记录的保存', () => {
  it('保存选中的初始位置', () => {
    const values = new Map()
    const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }
    const changed = applyPoincareEvent(createPoincareArtifact(), { type: 'seed.changed', seed: { x: 0.62, y: 0.31 } })
    storePoincareArtifact(changed, storage)
    expect(storage.getItem(POINCARE_SKY_STORAGE_KEY)).toContain('0.62')
    expect(readPoincareArtifact(storage).seed).toEqual({ x: 0.62, y: 0.31 })
  })
  it('访问存储被禁止时仍返回可用的章节记录', () => {
    vi.stubGlobal('window', Object.defineProperty({}, 'localStorage', { get() { throw new Error('blocked') } }))
    expect(readPoincareArtifact()).toEqual(createPoincareArtifact())
    expect(storePoincareArtifact({ seed: { x: .3, y: .4 } }).seed).toEqual({ x: .3, y: .4 })
  })
  it('空间已满时保留当前数据', () => {
    const storage = { getItem() { throw new Error('blocked') }, setItem() { throw new Error('quota') } }
    expect(readPoincareArtifact(storage)).toEqual(createPoincareArtifact())
    expect(storePoincareArtifact({ seed: { x: .3, y: .4 } }, storage).seed).toEqual({ x: .3, y: .4 })
  })
  it.each(['null', 'false', '[]', '{bad json'])('恢复损坏记录：%s', stored => {
    expect(readPoincareArtifact({ getItem: () => stored })).toEqual(createPoincareArtifact())
  })
})
