// Resource links are rendered as <a href> on public pages, so only http(s)
// URLs may be stored or displayed: a submitted `javascript:` (or `data:`,
// `vbscript:`, …) URL would execute in the clicking visitor's session once
// an admin publishes it. The browser <input type="url"> check is advisory
// only — submissions can hit the Supabase API directly.
export function sanitizeExternalUrl(value) {
  const trimmed = typeof value === 'string' ? value.trim() : ''

  if (!trimmed) {
    return ''
  }

  let parsed
  try {
    parsed = new URL(trimmed)
  } catch {
    return ''
  }

  return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? trimmed : ''
}
