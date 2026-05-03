import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const packageJson = JSON.parse(await readFile(resolve('package.json'), 'utf8'))
const targetPath = resolve('public/health.json')

const payload = {
  status: 'ok',
  app: 'MathClassWebsite',
  version: packageJson.version,
  buildTime: new Date().toISOString(),
  mode: 'static-spa',
}

await mkdir(dirname(targetPath), { recursive: true })
await writeFile(targetPath, `${JSON.stringify(payload, null, 2)}\n`)
