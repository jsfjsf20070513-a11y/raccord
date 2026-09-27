import { isAbsolute, join } from 'node:path'
import { resolveBackendConfig } from '../../src/lib/backendConfig.js'

const REMOTE_DIR = '/var/www/raccord/dist'
const ORIGINS = new Set([
  'https://github.com/jsfjsf20070513-a11y/raccord',
  'https://github.com/jsfjsf20070513-a11y/raccord.git',
  'git@github.com:jsfjsf20070513-a11y/raccord.git',
  'ssh://git@github.com/jsfjsf20070513-a11y/raccord.git',
])
const shellQuote = (value) => `'${value.replaceAll("'", "'\\''")}'`

// The release sequence is tested with injected commands: no SSH or real key.
export async function deploySite({ root, mode, env, run, isFile, readJson, log }) {
  if (!['--check', '--publish'].includes(mode)) throw new Error('只接受 --check（离线检查）或 --publish（发布）。')
  const git = (...args) => run('git', args, { capture: true })
  if ((await git('rev-parse', '--show-toplevel')).trim() !== root) throw new Error('脚本目录不是当前 Git 仓库根目录。')
  if (!ORIGINS.has((await git('remote', 'get-url', 'origin')).trim())) throw new Error('origin 不是 Raccord 仓库。')
  if ((await git('branch', '--show-current')).trim() !== 'main') throw new Error('发布只允许 main 分支。')
  const requireClean = async () => {
    if ((await git('status', '--porcelain', '--untracked-files=all')).trim()) throw new Error('工作区不干净；请先处理改动，不会自动丢弃文件。')
  }
  await requireClean()
  const backend = resolveBackendConfig(env.VITE_RACCORD_SUPABASE_URL, env.VITE_RACCORD_SUPABASE_ANON_KEY)
  if (!backend.configured) throw new Error('必须配置 Raccord 独立数据库；不接受班级站地址或旧的 VITE_SUPABASE_* 配置。')
  const backendUrl = new URL(backend.url)
  const backendHost = backendUrl.hostname.replace(/\.$/, '')
  if (backendUrl.protocol !== 'https:' || backendHost === 'localhost' || backendHost.endsWith('.localhost') || backendHost.startsWith('127.') || backendHost === '[::1]') {
    throw new Error('发布必须连接可公开访问的 HTTPS 数据库，不能使用本机开发地址。')
  }
  const host = env.RACCORD_DEPLOY_HOST || ''
  const user = env.RACCORD_DEPLOY_USER || ''
  const key = env.RACCORD_DEPLOY_SSH_KEY || ''
  if (!/^[a-zA-Z0-9][a-zA-Z0-9.-]*$/.test(host) || !/^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(user)) {
    throw new Error('请设置有效的 RACCORD_DEPLOY_HOST 和 RACCORD_DEPLOY_USER。')
  }
  if (!isAbsolute(key) || /[\r\n\0]/.test(key) || !await isFile(key)) throw new Error('RACCORD_DEPLOY_SSH_KEY 必须是本地密钥文件的绝对路径。')
  if (env.RACCORD_DEPLOY_DIR && env.RACCORD_DEPLOY_DIR !== REMOTE_DIR) throw new Error(`Raccord 发布目录固定为 ${REMOTE_DIR}，拒绝覆盖其他目录。`)
  const commit = (await git('rev-parse', 'HEAD')).trim()
  log(`待发布提交：${commit}\n目标：${user}@${host}:${REMOTE_DIR}`)
  try {
    for (const args of [['run', 'lint'], ['test'], ['run', 'build']]) await run('npm', args)
  } finally {
    // The clean-tree guard ran first; restore only this generated timestamp.
    await git('restore', '--', 'public/health.json')
  }
  await requireClean()
  if ((await git('rev-parse', 'HEAD')).trim() !== commit || (await git('branch', '--show-current')).trim() !== 'main') {
    throw new Error('检查期间提交或分支发生变化，请重新检查。')
  }
  if (!await isFile(join(root, 'dist/index.html'))) throw new Error('构建缺少 dist/index.html。')
  const health = await readJson(join(root, 'dist/health.json'))
  if (health.app !== 'Raccord' || health.mode !== 'static-spa' || !Number.isFinite(Date.parse(health.buildTime))) {
    throw new Error('构建的 health.json 不是有效的 Raccord 标记。')
  }
  log(`本次构建时间：${health.buildTime}`)
  if (mode === '--check') {
    log('离线检查完成，未连接服务器、未发布。')
    return
  }
  const ssh = ['ssh', '-i', key, '-o', 'IdentitiesOnly=yes', '-o', 'StrictHostKeyChecking=accept-new']
  await run('ssh', [...ssh.slice(1), `${user}@${host}`, `mkdir -p '${REMOTE_DIR}'`])
  await run('rsync', ['-av', '--delete', '-e', ssh.map(shellQuote).join(' '), `${join(root, 'dist')}/`, `${user}@${host}:${REMOTE_DIR}/`])
  log('静态文件同步完成；还需按部署流程核对线上 health 和实际页面。')
}
