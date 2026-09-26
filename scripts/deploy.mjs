import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { siteOrigin } from './site-config.mjs'

export const projectRoot = fileURLToPath(new URL('..', import.meta.url))

export function deploymentConfig(env, fileExists = existsSync) {
  const host = env.RACCORD_DEPLOY_HOST || ''
  const user = env.RACCORD_DEPLOY_USER || ''
  const key = env.RACCORD_DEPLOY_SSH_KEY || ''
  const directory = env.RACCORD_DEPLOY_DIR || ''
  if (!/^[a-zA-Z0-9][a-zA-Z0-9.-]*$/.test(host)) throw new Error('请填写有效的 RACCORD_DEPLOY_HOST。')
  if (!/^[a-z_][a-z0-9_-]*$/i.test(user)) throw new Error('请填写有效的 RACCORD_DEPLOY_USER。')
  if (!key.startsWith('/') || /[\r\n\0]/.test(key) || !fileExists(key)) throw new Error('RACCORD_DEPLOY_SSH_KEY 必须是存在的密钥绝对路径。')
  if (directory !== '/var/www/raccord/dist') throw new Error('RACCORD_DEPLOY_DIR 只允许 /var/www/raccord/dist。')
  const origin = siteOrigin(env.RACCORD_SITE_URL)
  if (!origin) throw new Error('发布前请填写 RACCORD_SITE_URL。')
  return { host, user, key, directory, origin }
}

function run(command, args) {
  const result = spawnSync(command, args, { cwd: projectRoot, stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`${command} 执行失败，已停止发布。`)
}

export function deploy(env = process.env, execute = run, read = readFileSync, fileExists = existsSync) {
  const config = deploymentConfig(env, fileExists)
  execute('npm', ['run', 'check'])
  execute('npm', ['run', 'build'])
  const health = JSON.parse(read(resolve(projectRoot, 'dist/health.json'), 'utf8'))
  if (health.app !== 'raccord' || !fileExists(resolve(projectRoot, 'dist/index.html'))) {
    throw new Error('构建产物不是完整的 Raccord 站点，已停止发布。')
  }
  const ssh = ['-i', config.key, '-o', 'IdentitiesOnly=yes', '-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=yes']
  const destination = `${config.user}@${config.host}`
  execute('ssh', [...ssh, destination, `mkdir -p ${config.directory}`])
  // rsync parses its transport string separately; quote every argument, including spaced key paths.
  const quote = value => `'${value.replaceAll("'", "''")}'`
  execute('rsync', ['-av', '--delete', '-e', ['ssh', ...ssh].map(quote).join(' '), `${resolve(projectRoot, 'dist')}/`, `${destination}:${config.directory}/`])
  console.log(`已同步 Raccord 构建 ${health.buildTime}。请核对 ${config.origin}/health.json。`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { deploy() } catch (error) { console.error(error.message); process.exitCode = 1 }
}
