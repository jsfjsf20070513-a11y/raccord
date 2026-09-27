import { describe, expect, it, vi } from 'vitest'
import { resolveBackendConfig } from './backendConfig'

describe('independent backend configuration', () => {
  it.each([
    [undefined, undefined], ['', 'key'], ['https://example.supabase.co', ''],
    ['https://xfwkjhajrqxsakzovcwx.supabase.co', 'public-key'],
    ['https://XFWKJHAJRQXSAKZOVCWX.supabase.co/', 'public-key'],
    ['https://xfwkjhajrqxsakzovcwx.supabase.co./', 'public-key'],
    ['http://example.supabase.co', 'public-key'],
    ['https://example.supabase.co/path', 'public-key'],
    ['https://user:password@example.supabase.co', 'public-key'],
  ])('refuses missing, shared or invalid targets', (url, key) => {
    expect(resolveBackendConfig(url, key).configured).toBe(false)
  })

  it('accepts the independent project and local development service', () => {
    expect(resolveBackendConfig(' https://raccord-example.supabase.co/ ', ' public-key '))
      .toEqual({ configured: true, url: 'https://raccord-example.supabase.co', key: 'public-key' })
    expect(resolveBackendConfig('http://127.0.0.1:54321', 'local-key').configured).toBe(true)
  })

  it('does not create a client from inherited class-site environment names', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://xfwkjhajrqxsakzovcwx.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'class-public-key')
    vi.stubEnv('VITE_RACCORD_SUPABASE_URL', '')
    vi.stubEnv('VITE_RACCORD_SUPABASE_ANON_KEY', '')
    vi.resetModules()
    try {
      const { isSupabaseConfigured, supabase } = await import('./supabase')
      expect(isSupabaseConfigured).toBe(false)
      expect(supabase).toBeNull()
    } finally { vi.unstubAllEnvs(); vi.resetModules() }
  })
})
