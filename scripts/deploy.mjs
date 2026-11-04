import { spawnSync } from 'node:child_process'
import { readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { siteOrigin } from './site-config.mjs'

export const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const remoteDirectory = '/var/www/raccord/dist'
const origins = new Set([
  'https://github.com/jsfjsf20070513-a11y/raccord',
  'https://github.com/jsfjsf20070513-a11y/raccord.git',
  'git@github.com:jsfjsf20070513-a11y/raccord.git',
  'ssh://git@github.com/jsfjsf20070513-a11y/raccord.git',
])

function isRegularFile(path) {
  try { return statSync(path).isFile() } catch { return false }
}

export function deploymentConfig(env, isFile = isRegularFile) {
  const host = env.RACCORD_DEPLOY_HOST || ''
  const user = env.RACCORD_DEPLOY_USER || ''
  const key = env.RACCORD_DEPLOY_SSH_KEY || ''
  if (!/^[a-zA-Z0-9][a-zA-Z0-9.-]*$/.test(host)) throw new Error('请填写有效的 RACCORD_DEPLOY_HOST。')
  if (!/^[a-z_][a-z0-9_-]*$/i.test(user)) throw new Error('请填写有效的 RACCORD_DEPLOY_USER。')
  if (!key.startsWith('/') || /[\r\n\0]/.test(key) || !isFile(key)) throw new Error('RACCORD_DEPLOY_SSH_KEY 必须是存在的密钥文件绝对路径。')
  if (env.RACCORD_DEPLOY_DIR && env.RACCORD_DEPLOY_DIR !== remoteDirectory) throw new Error(`发布目录固定为 ${remoteDirectory}。`)
  const origin = siteOrigin(env.RACCORD_SITE_URL)
  if (!origin) throw new Error('发布前请填写 RACCORD_SITE_URL。')
  return { host, user, key, directory: remoteDirectory, origin }
}

function run(command, args, { capture = false } = {}) {
  const result = spawnSync(command, args, { cwd: projectRoot, encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`${command} 执行失败，已停止。`)
  return result.stdout || ''
}

export function deploy({ mode = '--check', env = process.env, execute = run, read = readFileSync, isFile = isRegularFile, log = console.log } = {}) {
  if (!['--check', '--publish'].includes(mode)) throw new Error('只接受 --check（离线检查）或 --publish（发布）。')
  const config = deploymentConfig(env, isFile)
  const git = (...args) => execute('git', args, { capture: true }).trim()
  if (git('rev-parse', '--show-toplevel') !== resolve(projectRoot)) throw new Error('脚本目录不是当前 Git 仓库根目录。')
  if (!origins.has(git('remote', 'get-url', 'origin'))) throw new Error('origin 不是 Raccord 仓库。')
  const requireCleanMain = () => {
    if (git('branch', '--show-current') !== 'main') throw new Error('发布检查只允许在 main 分支运行。')
    if (git('status', '--porcelain', '--untracked-files=all')) throw new Error('工作区有未保存的改动或文件；请先处理，脚本不会自动丢弃。')
  }
  requireCleanMain()
  const revision = git('rev-parse', 'HEAD')
  execute('npm', ['run', 'check'])
  execute('npm', ['run', 'build'])
  requireCleanMain()
  if (git('rev-parse', 'HEAD') !== revision) throw new Error('检查期间提交发生变化，请重新检查。')
  const health = JSON.parse(read(resolve(projectRoot, 'dist/health.json'), 'utf8'))
  if (health.app !== 'Raccord' || health.mode !== 'static-spa' || health.revision !== revision || health.siteOrigin !== config.origin || !Number.isFinite(Date.parse(health.buildTime)) || !isFile(resolve(projectRoot, 'dist/index.html'))) {
    throw new Error('构建标记、提交、域名或入口不正确，已停止发布。')
  }
  log(`待发布提交：${revision}\n目标：${config.user}@${config.host}:${config.directory}\n构建时间：${health.buildTime}`)
  if (mode === '--check') {
    log('离线检查完成，未连接服务器、未发布。')
    return
  }
  const ssh = ['-i', config.key, '-o', 'IdentitiesOnly=yes', '-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=yes']
  const destination = `${config.user}@${config.host}`
  execute('ssh', [...ssh, destination, `mkdir -p ${config.directory}`])
  // rsync 自行解析这段参数；它用连续两个单引号表示引号本身。
  const quote = value => `'${value.replaceAll("'", "''")}'`
  execute('rsync', ['-av', '--delete', '-e', ['ssh', ...ssh].map(quote).join(' '), `${resolve(projectRoot, 'dist')}/`, `${destination}:${config.directory}/`])
  log(`已同步构建。请按部署说明核对 ${config.origin}/health.json 和页面。`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    if (process.argv.length > 3) throw new Error('请只指定 --check 或 --publish。')
    deploy({ mode: process.argv[2] || '--check' })
  } catch (error) { console.error(error.message); process.exitCode = 1 }
}
