// Cloudflare Worker — 班级后端代理 for rucmathclass.com.
//
// 两个无状态端点,持有的 API key 都是 Wrangler secret,浏览器永远拿不到:
//   POST /api/chat   → Gemini(GEMINI_API_KEY)双语数学/法语答疑,返回 { text }。
//   GET  /api/speak  → Gemini TTS(同一把 GEMINI_API_KEY)按需法语朗读;Gemini 返回
//                      16-bit PCM,Worker 包 WAV 头后返回 audio/wav。免费层、不绑卡。
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
// 图片问答(多模态):只收常见图片类型,base64 体积设上限防刷配额。
const ALLOWED_IMAGE = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_IMAGE_B64 = 7000000 // ≈5MB 二进制

// Gemini 原生 TTS:多语种预置声音(支持法语)。换声音改 env.TTS_VOICE。
const TTS_MODEL = 'gemini-2.5-flash-preview-tts'
const TTS_VOICE = 'Kore'
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

  // 多模态:把当前这轮的图片附到最后一条 user 消息上(inlineData)。
  const img = body && body.image
  if (img && typeof img.data === 'string' && ALLOWED_IMAGE.has(img.mimeType) && img.data.length <= MAX_IMAGE_B64) {
    for (let i = contents.length - 1; i >= 0; i -= 1) {
      if (contents[i].role === 'user') {
        contents[i].parts.push({ inlineData: { mimeType: img.mimeType, data: img.data } })
        break
      }
    }
  }

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
          generationConfig: { temperature: 0.5, maxOutputTokens: 8192 },
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

// base64 → Uint8Array(Worker 有全局 atob)。
function base64ToBytes(b64) {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i)
  return out
}

// 给裸 PCM 加 44 字节 WAV 头,使 <audio> 能直接播。
function wavFromPcm(pcm, sampleRate, channels, bits) {
  const blockAlign = channels * (bits / 8)
  const byteRate = sampleRate * blockAlign
  const dataLen = pcm.length
  const buf = new Uint8Array(44 + dataLen)
  const dv = new DataView(buf.buffer)
  const wr = (off, s) => { for (let i = 0; i < s.length; i += 1) dv.setUint8(off + i, s.charCodeAt(i)) }
  wr(0, 'RIFF'); dv.setUint32(4, 36 + dataLen, true); wr(8, 'WAVE')
  wr(12, 'fmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true)
  dv.setUint16(22, channels, true); dv.setUint32(24, sampleRate, true)
  dv.setUint32(28, byteRate, true); dv.setUint16(32, blockAlign, true); dv.setUint16(34, bits, true)
  wr(36, 'data'); dv.setUint32(40, dataLen, true)
  buf.set(pcm, 44)
  return buf
}

async function handleSpeak(request, env, ctx, url, origin) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405, origin)
  if (!env.GEMINI_API_KEY) return json({ error: 'Server not configured' }, 500, origin)

  const text = `${url.searchParams.get('text') || ''}`.trim().slice(0, TTS_MAX_CHARS)
  if (!text) return json({ error: 'No text' }, 400, origin)

  const voice = env.TTS_VOICE || TTS_VOICE
  const model = env.TTS_MODEL || TTS_MODEL

  // 边缘缓存:key 含 voice/model,换声音/模型自动失效。
  const cache = caches.default
  const cacheKey = new Request(`https://rucmathclass.com/api/speak?v=${voice}&m=${model}&text=${encodeURIComponent(text)}`, { method: 'GET' })
  const hit = await cache.match(cacheKey)
  if (hit) return hit

  const reqBody = JSON.stringify({
    contents: [{ parts: [{ text: `Lis en français, clairement et lentement : ${text}` }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
    },
  })

  // Gemini TTS preview 偶发空返回(finishReason OTHER),重试一次让它稳。
  let inline = null
  let lastDetail = ''
  for (let attempt = 0; attempt < 2 && !inline; attempt += 1) {
    let upstream
    try {
      upstream = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-goog-api-key': env.GEMINI_API_KEY },
          body: reqBody,
        },
      )
    } catch {
      return json({ error: 'Upstream unreachable' }, 502, origin)
    }
    if (!upstream.ok) {
      try {
        lastDetail = (await upstream.text()).slice(0, 400)
      } catch {
        // ignore
      }
      // 4xx(配额/参数)重试也没用,直接返回
      if (upstream.status >= 400 && upstream.status < 500) {
        return json({ error: 'TTS error', status: upstream.status, detail: lastDetail }, 502, origin)
      }
      continue
    }
    const data = await upstream.json()
    const parts = (((data.candidates || [])[0] || {}).content || {}).parts || []
    inline = parts.map((p) => p && p.inlineData).filter(Boolean)[0] || null
    if (!inline) lastDetail = JSON.stringify(data).slice(0, 300)
  }
  if (!inline || !inline.data) {
    return json({ error: 'No audio', detail: lastDetail }, 502, origin)
  }
  const rateMatch = /rate=(\d+)/.exec(inline.mimeType || '')
  const rate = rateMatch ? Number(rateMatch[1]) : 24000
  const wav = wavFromPcm(base64ToBytes(inline.data), rate, 1, 16)

  const resp = new Response(wav, {
    status: 200,
    headers: {
      'Content-Type': 'audio/wav',
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
    // 简单限流:每 IP 每分钟若干次,防刷爆 Gemini/ElevenLabs 配额。绑定缺失时跳过。
    if (env.RATE_LIMITER) {
      const ip = request.headers.get('CF-Connecting-IP') || 'anon'
      try {
        const { success } = await env.RATE_LIMITER.limit({ key: ip })
        if (!success) return json({ error: 'Trop de requêtes — réessaie dans un instant.' }, 429, origin)
      } catch {
        // limiter is best-effort; never block on its failure
      }
    }
    const url = new URL(request.url)
    if (url.pathname.endsWith('/api/speak')) return handleSpeak(request, env, ctx, url, origin)
    return handleChat(request, env, origin)
  },
}
