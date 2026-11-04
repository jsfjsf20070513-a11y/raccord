import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { ESLint } from 'eslint'
import { allowsImport, checkArchitecture } from './check-architecture.mjs'

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

describe('代码依赖检查', () => {
  it('允许应用组合章节，章节使用通用代码', () => {
    const root = fixture({ 'src/main.jsx': "import './app/App.js'", 'src/app/App.js': "import '../chapters/one/view.js'", 'src/chapters/one/view.js': "import '../../shared/browser/value.js'", 'src/shared/browser/value.js': 'export const value = 1' })
    expect(checkArchitecture(root).errors).toEqual([])
  })
  it.each([
    ['shared/browser/value.js', 'chapters/one/domain/value.js'],
    ['shared/browser/value.js', 'shared/world/value.js'],
    ['chapters/one/view.js', 'chapters/two/view.js'],
    ['chapters/one/desktop/View.jsx', 'chapters/one/mobile/View.jsx'],
    ['entrance/mobile/View.jsx', 'entrance/desktop/View.jsx'],
    ['app/DesktopLayout.jsx', 'app/MobileLayout.jsx'],
    ['chapters/one/domain/math.js', 'chapters/one/domain/style.css'],
    ['chapters/one/fields/Field.jsx', 'chapters/one/desktop/View.jsx'],
    ['app/App.jsx', 'chapters/one/fields/Field.jsx'],
    ['app/App.jsx', 'misc/value.js'],
  ])('拒绝 %s 引用 %s', (from, to) => {
    expect(allowsImport(from, to)).toBe(false)
  })
  it.each(['.js', '.mjs'])('检查 %s 中的转出引用', extension => {
    const root = fixture({ 'src/main.jsx': "import './app/App.js'", 'src/app/App.js': `import '../shared/browser/probe${extension}'`, [`src/shared/browser/probe${extension}`]: "export { value } from '../../chapters/one/value.js'", 'src/chapters/one/value.js': 'export const value = 1' })
    expect(checkArchitecture(root).errors.join('\n')).toContain('越层引用')
  })
  it('检查动态导入中的循环', () => {
    const root = fixture({ 'src/main.jsx': "import './app/App.js'", 'src/app/App.js': "import '../shared/browser/a.js'", 'src/shared/browser/a.js': "import('./b.js')", 'src/shared/browser/b.js': "import './a.js'" })
    expect(checkArchitecture(root).errors.join('\n')).toContain('循环引用')
  })
  it('禁止运行代码引用测试', () => {
    const root = fixture({ 'src/main.jsx': "import './app/App.js'", 'src/app/App.js': "import '../shared/browser/probe.test.js'", 'src/shared/browser/probe.test.js': 'export const value = 1' })
    expect(checkArchitecture(root).errors.join('\n')).toContain('不得导入测试文件')
  })
  it.each(['@import url(https://example.org/theme.css);', '@import "https://example.org/theme.css";'])('检查外部样式和无人使用的文件：%s', css => {
    const root = fixture({ 'src/main.jsx': "import './shared/styles/style.css'", 'src/shared/styles/style.css': css, 'src/shared/browser/orphan.js': 'export const value = 1' })
    const errors = checkArchitecture(root).errors.join('\n')
    expect(errors).toContain('不允许直接依赖')
    expect(errors).toContain('没有入口引用')
  })
  it.each(["import.meta.glob('./*.js')", "require('./value.js')", 'import(name)'])('拒绝无法确定路径的导入：%s', code => {
    const root = fixture({ 'src/main.jsx': "import './app/App.js'", 'src/app/App.js': code })
    expect(checkArchitecture(root).errors.join('\n')).toMatch(/明确的 import 路径|动态导入必须可静态检查/)
  })
  it('拒绝源码目录外的软链接', () => {
    const root = fixture({ 'src/main.jsx': '' })
    symlinkSync(resolve(root, 'index.html'), resolve(root, 'src/outside.js'))
    expect(() => checkArchitecture(root)).toThrow('源码不得指向源码目录外')
  })
  it.each([
    ['src/chapters/poincare/domain/probe.js', 'export const value = globalThis.localStorage'],
    ['src/chapters/poincare/domain/helpers/probe.js', 'export const value = window.localStorage'],
    ['src/chapters/poincare/domain/probe.mjs', 'export const value = window.localStorage'],
    ['src/shared/browser/probe.js', "export const value = window['fetch']('/other')"],
  ])('检查浏览器或网络访问：%s', async (filePath, code) => {
    const [result] = await new ESLint().lintText(code, { filePath })
    expect(result.errorCount).toBeGreaterThan(0)
  })
})
