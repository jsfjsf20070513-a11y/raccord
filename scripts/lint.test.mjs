import { describe, expect, it } from 'vitest'
import { ESLint } from 'eslint'

const eslint = new ESLint()
const lint = async (code, filePath = 'src/app/Probe.jsx') => (await eslint.lintText(code, { filePath }))[0]

describe('升级后的代码检查', () => {
  it.each([
    ['src/app/Probe.jsx', "export function Probe() { return <p title='hello'>&quot;Bonjour&quot; {\"it's here\"}</p> }"],
    ['src/chapters/poincare/domain/probe.js', 'export const distance = (x, y) => Math.hypot(x, y)'],
    ['src/chapters/poincare/domain/helpers/probe.mjs', 'export const twice = value => value * 2'],
    ['src/shared/browser/probe.js', 'export const width = () => window.innerWidth'],
    ['scripts/probe.mjs', 'export const directory = () => process.cwd()'],
  ])('仍检查并接受合法文件 %s', async (filePath, code) => {
    const result = await lint(code, filePath)
    expect(result.messages).toEqual([])
    expect(result.suppressedMessages).toEqual([])
  })
  it.each([
    ['未定义组件', 'export function Probe() { return <Missing /> }', 'no-undef'],
    ['重复属性', "export function Probe() { return <div id='one' id='two' /> }", 'jsx-syntax/valid-jsx'],
    ['未转义文字', "export function Probe() { return <p>it's here</p> }", 'jsx-syntax/valid-jsx'],
    ['错误的 DOM 属性', "export function Probe() { return <div class='wrong' /> }", 'react-dom/no-unknown-property'],
    ['不安全的新窗口链接', "export function Probe() { return <a href='https://example.org' target='_blank'>go</a> }", 'react-dom/no-unsafe-target-blank'],
    ['缺少列表键', 'export function Probe() { return [1, 2].map(value => <div>{value}</div>) }', 'react-x/no-missing-key'],
    ['条件调用 Hook', "import { useState } from 'react'; export function Probe({ enabled }) { if (enabled) useState(0); return null }", 'react-hooks/rules-of-hooks'],
    ['遗漏 Effect 依赖', "import { useEffect } from 'react'; export function Probe({ value }) { useEffect(() => { console.log(value) }, []); return null }", 'react-hooks/exhaustive-deps'],
  ])('仍拒绝%s', async (_name, code, ruleId) => {
    const result = await lint(code)
    expect(result.messages.map(message => message.ruleId)).toContain(ruleId)
  })
  it.each(['dist/probe.js', 'output/probe.js', '.playwright-cli/probe.js'])('只忽略生成文件 %s', async filePath => {
    expect(await eslint.isPathIgnored(filePath)).toBe(true)
  })
  it.each([
    ['src/app/probe.js', 'export const load = () => fetch("/api")', 'no-restricted-globals'],
    ['src/app/probe.mjs', 'export const load = () => window.fetch("/api")', 'no-restricted-syntax'],
    ['src/shared/browser/probe.js', 'export const send = () => navigator.sendBeacon("/api")', 'no-restricted-syntax'],
    ['src/chapters/poincare/domain/probe.js', 'export const width = () => window.innerWidth', 'no-restricted-globals'],
    ['src/chapters/poincare/domain/helpers/probe.mjs', 'export const frame = () => requestAnimationFrame(() => {})', 'no-undef'],
  ])('仍限制 %s 的浏览器或网络引用', async (filePath, code, ruleId) => {
    const result = await lint(code, filePath)
    expect(result.messages.map(message => message.ruleId)).toContain(ruleId)
  })
  it.each(['src/app/App.jsx', 'src/chapters/poincare/domain/poincareSkyMath.js', 'src/chapters/poincare/domain/helpers/probe.mjs', 'scripts/check-architecture.mjs'])('不漏掉源码和检查脚本 %s', async filePath => {
    expect(await eslint.isPathIgnored(filePath)).toBe(false)
  })
})
