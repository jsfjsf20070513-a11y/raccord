import { readdirSync, readFileSync, realpathSync, statSync } from 'node:fs'
import { dirname, extname, relative, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parse } from 'espree'

export function allowsImport(from, to) {
  const device = path => path.match(/(?:^|\/)(desktop|mobile)(?:\/|[A-Z])/i)?.[1]?.toLowerCase()
  if (device(from) && device(to) && device(from) !== device(to)) return false
  if (from.startsWith('shared/')) {
    const area = from.split('/')[1]
    return to.startsWith(`shared/${area}/`) || (['world', 'material'].includes(area) && to.startsWith('shared/browser/'))
  }
  if (from.startsWith('entrance/')) return to.startsWith('entrance/') || to.startsWith('shared/')
  if (from.startsWith('chapters/')) {
    const chapter = from.split('/')[1]
    if (from.startsWith(`chapters/${chapter}/domain/`)) return to.startsWith(`chapters/${chapter}/domain/`) && /\.(?:js|mjs)$/.test(to)
    if (from.startsWith(`chapters/${chapter}/fields/`)) return to.startsWith(`chapters/${chapter}/fields/`) || to.startsWith(`chapters/${chapter}/domain/`) || to.startsWith('shared/')
    return to.startsWith(`chapters/${chapter}/`) || to.startsWith('shared/')
  }
  if (from === 'main.jsx') return to.startsWith('app/') || to.startsWith('shared/styles/')
  if (from.startsWith('app/')) return to.startsWith('app/') || to.startsWith('shared/') || to === 'entrance/Entrance.jsx' || /^chapters\/[^/]+\/[^/]+\.(?:js|jsx|mjs)$/.test(to)
  return false
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
    if (name !== 'main.jsx' && !/^(?:app|entrance|shared\/(?:browser|material|styles|world)|chapters\/[^/]+)\//.test(name)) errors.push(`${name} 不在已定义的代码目录中`)
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
        if (node.type === 'CallExpression' && (node.callee.name === 'require' || (node.callee.object?.type === 'MetaProperty' && node.callee.property?.name?.startsWith('glob')))) errors.push(`${name} 必须使用明确的 import 路径`)
      })
    } else if (extname(file) === '.css') {
      for (const match of text.matchAll(/@import\s+(?:url\(\s*)?(?:"([^"]+)"|'([^']+)'|([^\s);]+))/g)) imports.push(match[1] || match[2] || match[3])
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
      const target = [base, `${base}.js`, `${base}.jsx`, `${base}.mjs`, `${base}.css`].find(p => {
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
  const finished = new Set()
  const active = []
  function findCycles(file) {
    if (active.includes(file)) {
      errors.push(`循环引用：${[...active.slice(active.indexOf(file)), file].map(path => relative(source, path)).join(' → ')}`)
      return
    }
    if (finished.has(file)) return
    active.push(file)
    for (const child of edges.get(file) || []) findCycles(child)
    active.pop()
    finished.add(file)
  }
  for (const file of edges.keys()) findCycles(file)
  for (const file of ['vite.config.js', 'index.html', 'deploy.sh']) {
    if (retired.test(readFileSync(resolve(root, file), 'utf8'))) errors.push(`${file} 含旧项目执行配置`)
  }
  return { errors, fileCount: runtime.length }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { errors, fileCount } = checkArchitecture(fileURLToPath(new URL('..', import.meta.url)))
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1 }
  else console.log(`架构检查通过：${fileCount} 个运行文件；依赖方向、双端分离、循环引用和入口引用均已检查。`)
}
