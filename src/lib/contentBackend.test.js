import { beforeEach, expect, it, vi } from 'vitest'

const fixture = vi.hoisted(() => ({ result: { data: [], error: null }, tables: [] }))
vi.mock('./supabase', () => ({
  isSupabaseConfigured: true,
  supabase: { from: (table) => {
    fixture.tables.push(table)
    if (table !== 'resources') throw new Error('Retired album table is unavailable')
    return { select: () => ({ order: async () => fixture.result }) }
  } },
}))
import { fetchOfficialContent } from './contentBackend'

beforeEach(() => { fixture.tables = []; fixture.result = { data: [], error: null } })

it('loads the current bookshelf without any album tables', async () => {
  fixture.result.data = [{ id: 12, title: 'Fixture book', url: 'https://example.com/book' }]
  const result = await fetchOfficialContent()
  expect(result.mode).toBe('official')
  expect(result.resources[0].title).toBe('Fixture book')
  expect(fixture.tables).toEqual(['resources'])
})

it('keeps missing-table fallback distinct from other backend errors', async () => {
  fixture.result.error = { code: 'PGRST205' }
  expect((await fetchOfficialContent()).mode).toBe('compat')
  fixture.result.error = new Error('connection failed')
  await expect(fetchOfficialContent()).rejects.toThrow('connection failed')
})
