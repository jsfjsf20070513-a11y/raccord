import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { deploy, deploymentConfig, projectRoot } from './deploy.mjs'
import { siteOrigin } from './site-config.mjs'

const config = { RACCORD_DEPLOY_HOST: 'example.org', RACCORD_DEPLOY_USER: 'deployer', RACCORD_DEPLOY_SSH_KEY: '/tmp/a key', RACCORD_SITE_URL: 'https://work.example.org' }
const revision = 'a'.repeat(40)
const health = { app: 'Raccord', mode: 'static-spa', revision, siteOrigin: config.RACCORD_SITE_URL, buildTime: '2026-11-04T14:00:00Z' }
function fixture(overrides = {}) {
  const replies = {
    'rev-parse --show-toplevel': resolve(projectRoot),
    'remote get-url origin': 'https://github.com/jsfjsf20070513-a11y/raccord.git',
    'branch --show-current': 'main',
    'status --porcelain --untracked-files=all': '',
    'rev-parse HEAD': revision,
    ...overrides,
  }
  const execute = vi.fn((command, args) => command === 'git' ? replies[args.join(' ')] : '')
  return { env: config, execute, read: () => JSON.stringify(health), isFile: () => true, log: vi.fn() }
}
const networkCalls = options => options.execute.mock.calls.filter(([command]) => ['ssh', 'rsync'].includes(command))

describe('静态发布', () => {
  it.each([undefined, '--check'])('默认与显式检查都不连接服务器：%s', mode => {
    const options = fixture()
    deploy({ ...options, mode })
    expect(options.execute.mock.calls.filter(([command]) => command === 'npm').map(([, args]) => args)).toEqual([['run', 'check'], ['run', 'build']])
    expect(networkCalls(options)).toEqual([])
  })
  it('拒绝未知模式，不把拼错的参数当成发布', () => {
    const options = fixture()
    expect(() => deploy({ ...options, mode: '--publsh' })).toThrow('只接受')
    expect(options.execute).not.toHaveBeenCalled()
  })
  it.each([{}, { MATHCLASS_DEPLOY_HOST: 'example.org' }])('不借用其他项目的配置', env => {
    const options = fixture()
    expect(() => deploy({ ...options, env })).toThrow()
    expect(options.execute).not.toHaveBeenCalled()
  })
  it.each(['/', '/var/www', '/var/www/other/dist', '/var/www/raccord/../dist', '/var/www/raccord/dist\n'])('拒绝目录 %s', directory => {
    const options = fixture()
    expect(() => deploy({ ...options, env: { ...config, RACCORD_DEPLOY_DIR: directory } })).toThrow()
    expect(options.execute).not.toHaveBeenCalled()
  })
  it.each(['-oProxyCommand=bad', 'host\nother', 'user@host'])('拒绝主机参数 %s', host => {
    expect(() => deploymentConfig({ ...config, RACCORD_DEPLOY_HOST: host }, () => true)).toThrow()
  })
  it('要求密钥文件和明确的 HTTPS 域名', () => {
    expect(() => deploymentConfig(config, () => false)).toThrow()
    for (const value of ['', 'http://example.org', 'https://user:pass@example.org', 'https://example.org/path', 'https://a&b.example']) {
      expect(() => deploymentConfig({ ...config, RACCORD_SITE_URL: value }, () => true)).toThrow()
    }
    expect(siteOrigin()).toBeNull()
  })
  it.each([
    ['rev-parse --show-toplevel', '/another/checkout'],
    ['remote get-url origin', 'https://github.com/example/another.git'],
    ['branch --show-current', 'feature/unfinished'],
    ['branch --show-current', ''],
    ['status --porcelain --untracked-files=all', '?? forgotten.txt'],
    ['status --porcelain --untracked-files=all', ' M src/main.jsx'],
  ])('在构建前拒绝仓库或分支状态：%s', (query, value) => {
    const options = fixture({ [query]: value })
    expect(() => deploy({ ...options, mode: '--publish' })).toThrow()
    expect(options.execute.mock.calls.every(([command]) => command === 'git')).toBe(true)
  })
  it.each(['check', 'build'])('%s 失败后不联网', script => {
    const options = fixture()
    const execute = options.execute.getMockImplementation()
    options.execute.mockImplementation((command, args) => {
      if (command === 'npm' && args[1] === script) throw new Error('failed')
      return execute(command, args)
    })
    expect(() => deploy({ ...options, mode: '--publish' })).toThrow('failed')
    expect(networkCalls(options)).toEqual([])
  })
  it.each([
    ['branch --show-current', 'feature/changed'],
    ['status --porcelain --untracked-files=all', '?? late-file.txt'],
    ['rev-parse HEAD', 'b'.repeat(40)],
  ])('检查期间发生变化就停止：%s', (query, value) => {
    const options = fixture()
    const execute = options.execute.getMockImplementation()
    let built = false
    options.execute.mockImplementation((command, args) => {
      if (command === 'npm' && args[1] === 'build') built = true
      if (built && command === 'git' && args.join(' ') === query) return value
      return execute(command, args)
    })
    expect(() => deploy({ ...options, mode: '--publish' })).toThrow()
    expect(networkCalls(options)).toEqual([])
  })
  it.each([
    { app: 'other' }, { mode: 'other' }, { revision: 'old' },
    { siteOrigin: 'https://another.example.org' }, { buildTime: 'invalid' },
  ])('不发布身份、来源或时间不符的产物：%j', mismatch => {
    const options = fixture()
    expect(() => deploy({ ...options, mode: '--publish', read: () => JSON.stringify({ ...health, ...mismatch }) })).toThrow('构建标记')
    expect(networkCalls(options)).toEqual([])
  })
  it('入口文件缺失时不联网', () => {
    const options = fixture()
    expect(() => deploy({ ...options, mode: '--publish', isFile: path => !path.endsWith('/dist/index.html') })).toThrow('入口')
    expect(networkCalls(options)).toEqual([])
  })
  it('SSH 失败后不继续同步', () => {
    const options = fixture()
    const execute = options.execute.getMockImplementation()
    options.execute.mockImplementation((command, args) => {
      if (command === 'ssh') throw new Error('connection failed')
      return execute(command, args)
    })
    expect(() => deploy({ ...options, mode: '--publish' })).toThrow('connection failed')
    expect(networkCalls(options).map(([command]) => command)).toEqual(['ssh'])
  })
  it.each(['/tmp/a key', "/tmp/a'quote key"])('只有明确发布才使用密钥 %s 同步固定目录', key => {
    const options = fixture()
    deploy({ ...options, mode: '--publish', env: { ...config, RACCORD_DEPLOY_SSH_KEY: key } })
    const calls = networkCalls(options)
    expect(calls.map(([command]) => command)).toEqual(['ssh', 'rsync'])
    expect(calls[0][1]).toEqual(expect.arrayContaining([key, 'BatchMode=yes', 'StrictHostKeyChecking=yes']))
    expect(calls[1][1].at(-2)).toBe(`${resolve(projectRoot, 'dist')}/`)
    expect(calls[1][1].at(-1)).toBe('deployer@example.org:/var/www/raccord/dist/')
  })
})
