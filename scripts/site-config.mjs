import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

export function siteOrigin(value = '') {
  if (!value.trim()) return null
  const url = new URL(value)
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash || !/^[a-z0-9.-]+$/i.test(url.hostname) || url.hostname.split('.').some(label => !label || label.startsWith('-') || label.endsWith('-'))) {
    throw new Error('RACCORD_SITE_URL 必须是独立站点的 HTTPS 源地址，不能包含路径、凭据或查询参数。')
  }
  return url.origin
}

export function siteMetadata(origin) {
  return {
    name: 'raccord-site-metadata',
    transformIndexHtml() {
      return origin ? [
        { tag: 'link', attrs: { rel: 'canonical', href: `${origin}/` }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:url', content: `${origin}/` }, injectTo: 'head' },
      ] : []
    },
    generateBundle() {
      const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
      let revision = null
      try { revision = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: new URL('..', import.meta.url), encoding: 'utf8' }).trim() } catch { /* Source archives may have no Git metadata. */ }
      this.emitFile({ type: 'asset', fileName: 'health.json', source: JSON.stringify({ app: 'raccord', version, revision, buildTime: new Date().toISOString(), mode: 'static-spa' }, null, 2) + '\n' })
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n${origin ? `Sitemap: ${origin}/sitemap.xml\n` : ''}` })
      if (origin) this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url><url><loc>${origin}/enter</loc></url></urlset>\n` })
    },
  }
}
