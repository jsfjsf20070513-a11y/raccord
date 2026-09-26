import { readdirSync, readFileSync, realpathSync, statSync } from 'node:fs'
import { dirname, extname, relative, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parse } from 'espree'

export function allowsImport(from, to) {
  if (from.startsWith('shared/')) return to.startsWith('shared/')
  if (from.startsWith('entrance/')) return to.startsWith('entrance/') || to.startsWith('shared/')
  if (from.startsWith('chapters/')) {
    const chapter = from.split('/')[1]
    if (from.startsWith(`chapters/${chapter}/domain/`)) return to.startsWith(`chapters/${chapter}/domain/`)
    return to.startsWith(`chapters/${chapter}/`) || to.startsWith('shared/')
  }
  if (from === 'main.jsx') return to.startsWith('app/') || to.startsWith('shared/styles/')
  return from.startsWith('app/')
}

function walkNode(node, visit) {
  if (!node || typeof node !== 'object') return
  if (node.type) visit(node)
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach(child => walkNode(child, visit))
    else if (value && typeof value === 'object') walkNode(value, visit)
  }
}

export function checkArchitecture(root) {
  const source = realpathSync(resolve(root, 'src'))
  const files = []
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const file = resolve(dir, entry.name)
      if (!realpathSync(file).startsWith(source + sep)) throw new Error(`源码不得指向源码目录外：${file}`)
      if (entry.isDirectory()) walk(file)
      else files.push(file)
    }
  }
  walk(source)
  const errors = []
  const edges = new Map()
  const runtime = files.filter(f => !/\.test\.[cm]?jsx?$/.test(f))
  const retired = /supabase|mathclass|rucmathclass|__mathclass_ops__|\/api\/(chat|speak)|privateAlbumOverrides/i
  const allowedPackages = new Set(['react', 'react-dom/client', 'react-router-dom'])

  for (const file of runtime) {
    const name = relative(source, file).split(sep).join('/')
    const text = readFileSync(file, 'utf8')
    if (retired.test(text)) errors.push(`${name} 含已退出作品的服务引用`)
    const imports = []
    if (/\.(?:[cm]?js|jsx)$/.test(file)) {
      const tree = parse(text, { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } })
      walkNode(tree, node => {
        if (['ImportDeclaration', 'ExportNamedDeclaration', 'ExportAllDeclaration'].includes(node.type) && node.source) imports.push(node.source.value)
        if (node.type === 'ImportExpression') {
          if (typeof node.source.value !== 'string') errors.push(`${name} 的动态导入必须可静态检查`)
          else imports.push(node.source.value)
        }
      })
    } else if (extname(file) === '.css') {
      for (const match of text.matchAll(/@import\s+(?:url\(\s*)?["']([^"']+)["']/g)) imports.push(match[1])
      if (/url\(\s*["']?(?:https?:)?\/\//i.test(text)) errors.push(`${name} 不得加载站外样式资源`)
    }
    if (!['.js', '.jsx', '.mjs', '.css'].includes(extname(file))) errors.push(`${name} 使用未检查的运行文件类型`)
    const dependencies = []
    for (const specifier of imports) {
      if (!specifier.startsWith('.')) {
        if (!allowedPackages.has(specifier) && !specifier.startsWith('@fontsource/')) errors.push(`${name} 不允许直接依赖 ${specifier}`)
        if (name.includes('/domain/')) errors.push(`${name} 的纯逻辑不得依赖第三方运行环境`)
        continue
      }
      const base = resolve(dirname(file), specifier)
      const target = [base, `${base}.js`, `${base}.jsx`, `${base}.css`].find(p => {
        try { return statSync(p).isFile() } catch { return false }
      })
      if (!target) { errors.push(`${name} 的导入不存在：${specifier}`); continue }
      if (/\.test\.[cm]?jsx?$/.test(target)) errors.push(`${name} 不得导入测试文件`)
      const real = realpathSync(target)
      const targetName = relative(source, real).split(sep).join('/')
      if (!real.startsWith(source + sep) || !allowsImport(name, targetName)) errors.push(`${name} 越层引用 ${targetName}`)
      dependencies.push(real)
    }
    for (const match of text.matchAll(/url\(["']?(\/[^)'"\s]+)/g)) {
      try { statSync(resolve(root, 'public', `.${match[1]}`)) } catch { errors.push(`${name} 引用的资源不存在：${match[1]}`) }
    }
    edges.set(realpathSync(file), dependencies)
  }
  const reachable = new Set()
  function visit(file) {
    if (reachable.has(file)) return
    reachable.add(file)
    for (const child of edges.get(file) || []) visit(child)
  }
  visit(resolve(source, 'main.jsx'))
  for (const file of runtime) if (!reachable.has(file)) errors.push(`没有入口引用：${relative(source, file)}`)
  for (const file of ['vite.config.js', 'index.html', 'deploy.sh']) {
    if (retired.test(readFileSync(resolve(root, file), 'utf8'))) errors.push(`${file} 含旧项目执行配置`)
  }
  return { errors, fileCount: runtime.length }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { errors, fileCount } = checkArchitecture(fileURLToPath(new URL('..', import.meta.url)))
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1 }
  else console.log(`架构检查通过：${fileCount} 个运行文件；依赖方向和入口引用正常。`)
}
