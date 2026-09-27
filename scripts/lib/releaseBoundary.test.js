import { readFile, readdir } from 'node:fs/promises'
import { describe, expect, it, vi } from 'vitest'
import config from '../../vite.config.js'
import worker from '../../worker/src/index.js'

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), 'utf8')

describe('release boundaries', () => {
  it('keeps local AI requests off production and routes only the Raccord subdomain', async () => {
    expect(config.server.proxy['/api'].target).toBe('http://127.0.0.1:8787')
    const toml = await read('worker/wrangler.toml')
    expect(toml.match(/^name\s*=\s*"([^"]+)"/m)?.[1]).toBe('raccord-ai')
    expect([...toml.matchAll(/^pattern\s*=\s*"([^"]+)"/gm)].map((match) => match[1]))
      .toEqual(['raccord.rucmathclass.com/api/chat', 'raccord.rucmathclass.com/api/speak*'])
    expect(toml.match(/^namespace_id\s*=\s*"([^"]+)"/m)?.[1]).not.toBe('1001')
    expect(await readdir(new URL('../../deployment/nginx', import.meta.url)))
      .toEqual(expect.arrayContaining(['raccord.conf', 'raccord-security-headers.conf']))
    expect((await readdir(new URL('../../deployment/nginx', import.meta.url))).some((name) => name.startsWith('mathclass'))).toBe(false)
  })

  it.each(['https://rucmathclass.com', 'https://www.rucmathclass.com'])('does not authorize the class origin %s', async (origin) => {
    const response = await worker.fetch(new Request('https://raccord.rucmathclass.com/api/chat', { method: 'OPTIONS', headers: { Origin: origin } }), {}, {})
    expect(response.headers.get('Access-Control-Allow-Origin')).not.toBe(origin)
  })

  it('uses only its own origin for speech cache keys', async () => {
    const match = vi.fn(async () => new Response('cached audio'))
    vi.stubGlobal('caches', { default: { match } })
    try {
      await worker.fetch(new Request('https://raccord.rucmathclass.com/api/speak?text=bonjour'), { GEMINI_API_KEY: 'fixture-only' }, {})
      expect(new URL(match.mock.calls[0][0].url).origin).toBe('https://raccord.rucmathclass.com')
    } finally { vi.unstubAllGlobals() }
  })
})
