import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { ESLint } from 'eslint'
import { checkArchitecture } from './check-architecture.mjs'

const roots = []
function fixture(files) {
  const root = mkdtempSync(resolve(tmpdir(), 'raccord-boundary-'))
  roots.push(root)
  for (const [name, value] of Object.entries({ 'vite.config.js': '', 'index.html': '', 'deploy.sh': '', ...files })) {
    const path = resolve(root, name)
    mkdirSync(resolve(path, '..'), { recursive: true })
    writeFileSync(path, value)
  }
  return root
}
afterEach(() => roots.splice(0).forEach(root => rmSync(root, { recursive: true, force: true })))

describe('architecture enforcement', () => {
  it('accepts composition through the app and shared layers', () => {
    const root = fixture({ 'src/main.jsx': "import './app/App.js'", 'src/app/App.js': "import '../chapters/one/view.js'", 'src/chapters/one/view.js': "import '../../shared/value.js'", 'src/shared/value.js': 'export const value = 1' })
    expect(checkArchitecture(root).errors).toEqual([])
  })
  it.each(['.js', '.mjs'])('rejects a reverse dependency through %s', extension => {
    const root = fixture({ 'src/main.jsx': `import './app/App.js'`, 'src/app/App.js': `import '../shared/probe${extension}'`, [`src/shared/probe${extension}`]: "export { value } from '../chapters/one/value.js'", 'src/chapters/one/value.js': 'export const value = 1' })
    expect(checkArchitecture(root).errors.join('\n')).toContain('越层引用')
  })
  it('rejects runtime imports of test-only code', () => {
    const root = fixture({ 'src/main.jsx': "import './shared/probe.test.js'", 'src/shared/probe.test.js': "import '../chapters/one/value.js'", 'src/chapters/one/value.js': 'export const value = 1' })
    expect(checkArchitecture(root).errors.join('\n')).toContain('不得导入测试文件')
  })
  it('rejects files with no application entry and remote CSS', () => {
    const root = fixture({ 'src/main.jsx': "import './shared/style.css'", 'src/shared/style.css': '@import url("https://example.org/theme.css");', 'src/shared/orphan.js': 'export const value = 1' })
    const errors = checkArchitecture(root).errors.join('\n')
    expect(errors).toContain('不允许直接依赖')
    expect(errors).toContain('没有入口引用')
  })
  it('rejects source symlinks outside the project', () => {
    const root = fixture({ 'src/main.jsx': '' })
    symlinkSync(resolve(root, 'index.html'), resolve(root, 'src/outside.js'))
    expect(() => checkArchitecture(root)).toThrow('源码不得指向源码目录外')
  })
  it.each([
    ['src/chapters/poincare/domain/probe.js', 'export const value = globalThis.localStorage'],
    ['src/chapters/poincare/domain/helpers/probe.js', 'export const value = window.localStorage'],
    ['src/chapters/poincare/domain/probe.mjs', 'export const value = window.localStorage'],
    ['src/shared/browser/probe.js', "export const value = window['fetch']('/other')"],
  ])('rejects browser or network access in %s', async (filePath, code) => {
    const [result] = await new ESLint().lintText(code, { filePath })
    expect(result.errorCount).toBeGreaterThan(0)
  })
})
