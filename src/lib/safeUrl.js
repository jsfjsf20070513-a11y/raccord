// Tiny helpers for rendering user-supplied URLs without exposing the
// site to `javascript:` / `data:` / `vbscript:` protocol XSS through
// stored content.
//
// Background: the resource catalog merges hand-curated entries from
// `src/data/resourceCatalog.js` (safe, authored by the maintainer) with
// rows from the Supabase `resources` table that an admin published from
// a contributor draft. The contributor draft's `url` field travels
// straight to <a href={...}>, so even though admins are expected to
// review before publishing, defense-in-depth keeps the renderer from
// being the place an unsafe protocol leaks through.

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:'])

/**
 * Returns the URL if it parses cleanly and uses an allowed protocol;
 * otherwise returns the fallback (defaults to '#'). Never throws.
 *
 * Note: empty / missing input returns the fallback so callers can
 * pass through `resource.url` without a separate truthiness check.
 */
export function sanitizeHttpUrl(input, fallback = '#') {
  if (!input || typeof input !== 'string') {
    return fallback
  }
  const trimmed = input.trim()
  if (!trimmed) {
    return fallback
  }
  try {
    // Use the current origin as a base so relative URLs resolve and
    // bare domains like "example.com/path" don't get treated as
    // unparseable.
    const candidate = new URL(trimmed, 'https://placeholder.invalid')
    if (!ALLOWED_PROTOCOLS.has(candidate.protocol)) {
      return fallback
    }
    return candidate.toString()
  } catch {
    return fallback
  }
}

/**
 * Convenience for inline external links: returns props that are safe
 * to spread onto an <a> tag. Always sets `rel="noopener noreferrer"`
 * even though modern browsers imply `noopener` for `target="_blank"`,
 * and falls back to a non-clickable href when the URL is unsafe.
 */
export function externalLinkProps(rawUrl, { fallback = '#' } = {}) {
  const href = sanitizeHttpUrl(rawUrl, fallback)
  return {
    href,
    target: '_blank',
    rel: 'noopener noreferrer',
  }
}
