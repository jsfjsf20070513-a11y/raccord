// NOTE: this module no longer imports KaTeX at the top level. KaTeX is a
// ~270KB runtime; importing it here used to pull it into the entry bundle
// (Home.jsx → mathText.js → katex). Theorem proofs are static and behind a
// collapsed <details>, so they are pre-rendered to HTML at build time by
// scripts/render-theorems.mjs, which injects `katex` into the function
// below. The browser ships only the rendered HTML, never KaTeX itself.

const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

function escapeHtml(input = '') {
  return String(input).replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch])
}

/**
 * Render mixed prose + inline math text into safe HTML, using a caller-
 * supplied `katex` instance (so this module carries no KaTeX dependency
 * into the browser bundle).
 *
 * Math segments must be wrapped in single dollar signs, e.g. `$x = 1$`.
 * Anything outside the dollar pairs is plain prose and gets HTML-escaped.
 * KaTeX is configured with throwOnError: false so a single bad expression
 * does not crash the build; the offending segment falls back to its
 * literal source between dollar signs.
 *
 * Pre-rendered HTML is cached per input string to avoid repeating the
 * same KaTeX work across identical inputs within one build.
 */
const cache = new Map()

export function renderMathTextToHtmlWith(katex, input) {
  if (!input) {
    return ''
  }
  const text = String(input)
  if (cache.has(text)) {
    return cache.get(text)
  }

  const segments = []
  const regex = /\$([^$]+)\$/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push(escapeHtml(text.slice(lastIndex, match.index)))
    }
    const expression = match[1]
    try {
      segments.push(
        katex.renderToString(expression, {
          throwOnError: false,
          output: 'html',
        }),
      )
    } catch {
      segments.push(escapeHtml(`$${expression}$`))
    }
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    segments.push(escapeHtml(text.slice(lastIndex)))
  }

  const html = segments.join('')
  cache.set(text, html)
  return html
}
