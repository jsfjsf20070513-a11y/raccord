// Raccord has its own database. Never inherit the class site's old environment.
const CLASS_DATABASE_HOST = 'xfwkjhajrqxsakzovcwx.supabase.co'

export function resolveBackendConfig(urlValue, keyValue) {
  const url = urlValue?.trim() || ''
  const key = keyValue?.trim() || ''
  if (!url || !key || url.startsWith('YOUR_SUPABASE_') || key.startsWith('YOUR_SUPABASE_')) {
    return { configured: false, reason: 'missing' }
  }
  try {
    const parsed = new URL(url)
    if (parsed.hostname.toLowerCase().replace(/\.$/, '') === CLASS_DATABASE_HOST) return { configured: false, reason: 'class-database' }
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname)
    if (parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== '/') {
      return { configured: false, reason: 'invalid-url' }
    }
    if (parsed.protocol !== 'https:' && !(local && parsed.protocol === 'http:')) {
      return { configured: false, reason: 'invalid-url' }
    }
    return { configured: true, url: parsed.origin, key }
  } catch { return { configured: false, reason: 'invalid-url' } }
}
