import { describe, expect, it, vi } from 'vitest'
import { deploy, deploymentConfig, projectRoot } from './deploy.mjs'
import { siteOrigin } from './site-config.mjs'

const config = { RACCORD_DEPLOY_HOST: 'example.org', RACCORD_DEPLOY_USER: 'deployer', RACCORD_DEPLOY_SSH_KEY: '/tmp/a key', RACCORD_DEPLOY_DIR: '/var/www/raccord/dist', RACCORD_SITE_URL: 'https://work.example.org' }
const read = () => JSON.stringify({ app: 'raccord', buildTime: 'test-build' })

describe('static publishing boundary', () => {
  it.each([{}, { MATHCLASS_DEPLOY_HOST: 'example.org', MATHCLASS_DEPLOY_DIR: '/var/www/raccord/dist' }])('never uses absent or inherited project config', env => {
    const execute = vi.fn()
    expect(() => deploy(env, execute, read, () => true)).toThrow()
    expect(execute).not.toHaveBeenCalled()
  })
  it.each(['/', '/var/www', '/var/www/MathClassWebsite/dist', '/var/www/raccord/../dist', '/var/www/raccord/dist\n'])('rejects target %s before building or connecting', directory => {
    const execute = vi.fn()
    expect(() => deploy({ ...config, RACCORD_DEPLOY_DIR: directory }, execute, read, () => true)).toThrow()
    expect(execute).not.toHaveBeenCalled()
  })
  it.each(['-oProxyCommand=bad', 'host\nother', 'user@host'])('rejects unsafe host %s', host => {
    expect(() => deploymentConfig({ ...config, RACCORD_DEPLOY_HOST: host }, () => true)).toThrow()
  })
  it('requires an existing key and explicit HTTPS site origin', () => {
    expect(() => deploymentConfig(config, () => false)).toThrow()
    for (const value of ['', 'http://example.org', 'https://user:pass@example.org', 'https://example.org/path', 'https://a&b.example']) {
      expect(() => deploymentConfig({ ...config, RACCORD_SITE_URL: value }, () => true)).toThrow()
    }
    expect(siteOrigin()).toBeNull()
  })
  it('stops before any network operation when checks or build fail', () => {
    for (const failure of [1, 2]) {
      const calls = []
      const execute = (command, args) => { calls.push([command, args]); if (calls.length === failure) throw new Error('failed') }
      expect(() => deploy(config, execute, read, () => true)).toThrow()
      expect(calls.every(([cmd]) => cmd === 'npm')).toBe(true)
    }
  })
  it('rejects another app artifact before SSH', () => {
    const execute = vi.fn()
    expect(() => deploy(config, execute, () => '{"app":"other"}', () => true)).toThrow()
    expect(execute.mock.calls.map(([cmd]) => cmd)).toEqual(['npm', 'npm'])
  })
  it('uses only this checkout and stops when SSH fails', () => {
    const execute = vi.fn(command => { if (command === 'ssh') throw new Error('connection failed') })
    expect(() => deploy(config, execute, read, () => true)).toThrow()
    expect(execute.mock.calls.map(([cmd]) => cmd)).toEqual(['npm', 'npm', 'ssh'])
  })
  it.each(['/tmp/a key', "/tmp/a'quote key"])('passes key path %s and the isolated directory to rsync', key => {
    const execute = vi.fn()
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    try {
      deploy({ ...config, RACCORD_DEPLOY_SSH_KEY: key }, execute, read, () => true)
      expect(execute.mock.calls.map(([cmd]) => cmd)).toEqual(['npm', 'npm', 'ssh', 'rsync'])
      const args = execute.mock.calls.at(-1)[1]
      expect(args.at(-2)).toBe(`${projectRoot}dist/`)
      expect(args.at(-1)).toBe('deployer@example.org:/var/www/raccord/dist/')
      expect(args[3]).toContain("'" + key.replaceAll("'", "''") + "'")
    } finally { log.mockRestore() }
  })
})
