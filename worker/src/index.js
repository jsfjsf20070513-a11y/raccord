// Cloudflare Worker — 班级 AI 助手代理 for rucmathclass.com.
//
// 持有 Gemini API key 的后端(option A)。key 以 Wrangler secret `GEMINI_API_KEY`
// 注入,浏览器永远拿不到。前端 POST { messages: [{ role, content }] } 到本 Worker,
// Worker 调 Gemini 后返回 { text }。
//
// 设计取向与主站一致:静态 SPA + 一个极薄的无状态代理;不引入数据库、不存对话。
// 部署见 ../README.md(wrangler secret put GEMINI_API_KEY → wrangler deploy → 绑路由)。

const ALLOWED_ORIGINS = new Set([
  'https://rucmathclass.com',
  'https://www.rucmathclass.com',
  'http://localhost:5173',
])

const MODEL = 'gemini-flash-latest'
const MAX_MESSAGES = 20
const MAX_CHARS = 4000

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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || ''

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) })
    }
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, origin)
    }
    if (!env.GEMINI_API_KEY) {
      return json({ error: 'Server not configured' }, 500, origin)
    }

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
    if (!contents.length) {
      return json({ error: 'No messages' }, 400, origin)
    }

    let upstream
    try {
      upstream = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': env.GEMINI_API_KEY,
          },
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

    if (!upstream.ok) {
      return json({ error: 'Upstream error', status: upstream.status }, 502, origin)
    }

    const data = await upstream.json()
    const parts = (((data.candidates || [])[0] || {}).content || {}).parts || []
    const text = parts.map((p) => p.text).filter(Boolean).join('')
    return json({ text }, 200, origin)
  },
}
