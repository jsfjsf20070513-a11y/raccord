// Cloudflare Worker — 班级后端代理 for rucmathclass.com.
//
// 两个无状态端点,持有的 API key 都是 Wrangler secret,浏览器永远拿不到:
//   POST /api/chat   → Gemini(GEMINI_API_KEY)双语数学/法语答疑,返回 { text }。
//   GET  /api/speak  → ElevenLabs(ELEVENLABS_API_KEY)按需法语朗读,返回 audio/mpeg。
//                      用 Cloudflare 边缘缓存(caches.default),每个词一辈子只生成一次。
//
// 设计取向与主站一致:静态 SPA + 极薄无状态代理;不引入数据库、不存对话。
// 部署见 ../README.md。

const ALLOWED_ORIGINS = new Set([
  'https://rucmathclass.com',
  'https://www.rucmathclass.com',
  'http://localhost:5173',
])

const CHAT_MODEL = 'gemini-flash-latest'
const MAX_MESSAGES = 20
const MAX_CHARS = 4000

// 与首页朗读一致:ElevenLabs George storyteller voice + multilingual_v2。
const TTS_VOICE = 'JBFqnCBsd6RMkjVDRZzb'
const TTS_MODEL = 'eleven_multilingual_v2'
const TTS_MAX_CHARS = 160

const SYSTEM_PROMPT = [
  "Tu es l'assistant bilingue (中文 / français) de la classe de mathématiques 2025 du campus sino-français.",
  'Public : des élèves qui apprennent les mathématiques ET le français (du niveau A1 au C2).',
  'Règles :',
  "- Réponds dans la langue de la question ; si on te le demande, donne le terme dans l'autre langue.",
  '- Pour les maths : sois rigoureux, montre les étapes clés, utilise la notation LaTeX entre $...$ quand c\'est utile.',
  '- Pour le français : explique le sens, le genre des noms, et donne un exemple court.',
  '- Reste concis et bienveillant. Si tu n\'es pas sûr, dis-le.',
  '- Refuse poliment ce qui sort du cadre scolaire (maths / français / méthode d\'étude).',
].join('\n')

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : 'https://rucmathclass.com'
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  })
}

async function handleChat(request, env, origin) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, origin)
  if (!env.GEMINI_API_KEY) return json({ error: 'Server not configured' }, 500, origin)

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400, origin)
  }

  const raw = Array.isArray(body && body.messages) ? body.messages.slice(-MAX_MESSAGES) : []
  const contents = []
  for (const m of raw) {
    const role = m && (m.role === 'model' || m.role === 'assistant') ? 'model' : 'user'
    const text = `${(m && m.content) || ''}`.slice(0, MAX_CHARS)
    if (text.trim()) contents.push({ role, parts: [{ text }] })
  }
  if (!contents.length) return json({ error: 'No messages' }, 400, origin)

  let upstream
  try {
    upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${CHAT_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-goog-api-key': env.GEMINI_API_KEY },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { temperature: 0.5, maxOutputTokens: 800 },
        }),
      },
    )
  } catch {
    return json({ error: 'Upstream unreachable' }, 502, origin)
  }
  if (!upstream.ok) return json({ error: 'Upstream error', status: upstream.status }, 502, origin)

  const data = await upstream.json()
  const parts = (((data.candidates || [])[0] || {}).content || {}).parts || []
  const text = parts.map((p) => p.text).filter(Boolean).join('')
  return json({ text }, 200, origin)
}

async function handleSpeak(request, env, ctx, url, origin) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405, origin)
  if (!env.ELEVENLABS_API_KEY) return json({ error: 'Server not configured' }, 500, origin)

  const text = `${url.searchParams.get('text') || ''}`.trim().slice(0, TTS_MAX_CHARS)
  if (!text) return json({ error: 'No text' }, 400, origin)

  // 边缘缓存:同一个词的 URL 只命中一次上游,之后全走缓存(配额只在首次消耗)。
  const cache = caches.default
  const cacheKey = new Request(`https://rucmathclass.com/api/speak?text=${encodeURIComponent(text)}`, { method: 'GET' })
  const hit = await cache.match(cacheKey)
  if (hit) return hit

  let upstream
  try {
    upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${TTS_VOICE}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: TTS_MODEL,
          voice_settings: { stability: 0.4, similarity_boost: 0.8 },
        }),
      },
    )
  } catch {
    return json({ error: 'Upstream unreachable' }, 502, origin)
  }
  if (!upstream.ok) return json({ error: 'TTS error', status: upstream.status }, 502, origin)

  const audio = await upstream.arrayBuffer()
  const resp = new Response(audio, {
    status: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
      ...corsHeaders(origin),
    },
  })
  ctx.waitUntil(cache.put(cacheKey, resp.clone()))
  return resp
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || ''
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) })
    }
    const url = new URL(request.url)
    if (url.pathname.endsWith('/api/speak')) return handleSpeak(request, env, ctx, url, origin)
    return handleChat(request, env, origin)
  },
}
