import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import katex from 'katex'
import { useAuth } from '../context/useAuth'
import { clearMessages, fetchMessages, saveMessage } from '../lib/aiAssistantBackend'

// 把助手回复里的 $...$ / $$...$$ 渲染成 KaTeX 公式,**粗体** 转 <strong>,其余
// 文本 HTML 转义后原样保留(容器 white-space:pre-wrap 负责换行)。KaTeX 输出是
// 安全 HTML;katex 随本 lazy 路由加载,不进主包。
const HTML_ESCAPE = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
function escapeHtml(s) {
  return `${s}`.replace(/[&<>"']/g, (c) => HTML_ESCAPE[c])
}
function renderProse(s) {
  return escapeHtml(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
}
function renderRich(text) {
  const out = []
  const re = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g
  let last = 0
  let m
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(renderProse(text.slice(last, m.index)))
    const display = m[1] !== undefined
    const expr = display ? m[1] : m[2]
    try {
      out.push(katex.renderToString(expr, { throwOnError: false, displayMode: display, output: 'html' }))
    } catch {
      out.push(escapeHtml(m[0]))
    }
    last = re.lastIndex
  }
  if (last < text.length) out.push(renderProse(text.slice(last)))
  return out.join('')
}

// 班级 AI 助手 — 前端只跟同域 Worker 代理对话(/api/chat),Gemini key 在
// Cloudflare secret 里,前端产物永不含它。无状态:历史只存在本页 state。
const AI_ENDPOINT = 'https://rucmathclass.com/api/chat'
const MAX_HISTORY = 20

const STARTERS = [
  '用中文解释一下中值定理的直觉',
  'Conjugue le verbe « résoudre » au présent',
  '« dérivée » 是阴性还是阳性?给个例句',
  'Explique la différence entre limite et continuité',
]

// 选图后在浏览器里压缩:缩到最长边 1536、转 JPEG q0.85——既省 token 又统一格式。
// 返回 { mimeType, data(纯 base64), preview(data URL 用于缩略图) }。
async function compressImage(file) {
  const dataUrl = await new Promise((res, rej) => {
    const fr = new FileReader()
    fr.onload = () => res(fr.result)
    fr.onerror = rej
    fr.readAsDataURL(file)
  })
  const img = await new Promise((res, rej) => {
    const im = new Image()
    im.onload = () => res(im)
    im.onerror = rej
    im.src = dataUrl
  })
  const maxDim = 1536
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
  const w = Math.max(1, Math.round(img.width * scale))
  const h = Math.max(1, Math.round(img.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d').drawImage(img, 0, 0, w, h)
  const out = canvas.toDataURL('image/jpeg', 0.85)
  return { mimeType: 'image/jpeg', data: out.split(',')[1], preview: out }
}

export default function Assistant() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([]) // {role:'user'|'model', content}
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [image, setImage] = useState(null) // { mimeType, data, preview }
  const scrollRef = useRef(null)
  const inputRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  // 登录后从云端加载已保存的对话(跨设备)。表未建(compat)时返回空,静默降级为
  // 仅本次会话内存。
  useEffect(() => {
    if (!user) return undefined
    let alive = true
    fetchMessages(user.id)
      .then(({ messages: loaded }) => {
        if (alive && loaded.length) setMessages(loaded)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [user])

  const send = useCallback(
    async (text) => {
      const typed = `${text}`.trim()
      if ((!typed && !image) || loading) return
      setError('')
      const content = typed || '请看图,用中文一步步解释这道题并给出答案。'
      const sentImage = image
      const userMsg = { role: 'user', content, image: sentImage?.preview }
      const next = [...messages, userMsg].slice(-MAX_HISTORY)
      setMessages(next)
      setInput('')
      setImage(null)
      setLoading(true)
      if (user) saveMessage(user.id, 'user', content).catch(() => {})
      try {
        // 只把 {role, content} 发给模型(不回传缩略图);当前这轮的图走 body.image。
        const body = { messages: next.map((m) => ({ role: m.role, content: m.content })) }
        if (sentImage) body.image = { mimeType: sentImage.mimeType, data: sentImage.data }
        const res = await fetch(AI_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error(`服务返回 ${res.status}`)
        const data = await res.json()
        const reply = `${data?.text || ''}`.trim()
        if (!reply) throw new Error('空回复')
        setMessages((m) => [...m, { role: 'model', content: reply }])
        if (user) saveMessage(user.id, 'model', reply).catch(() => {})
      } catch (err) {
        setError(err?.message || '请求失败,请稍后再试。')
      } finally {
        setLoading(false)
        inputRef.current?.focus()
      }
    },
    [messages, loading, user, image],
  )

  const onPickImage = useCallback(async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('只支持图片文件。')
      return
    }
    if (file.size > 12 * 1024 * 1024) {
      setError('图片太大,请小于 12MB。')
      return
    }
    try {
      setError('')
      setImage(await compressImage(file))
    } catch {
      setError('图片处理失败,换一张试试。')
    }
  }, [])

  const handleClear = useCallback(() => {
    setMessages([])
    setError('')
    if (user) clearMessages(user.id).catch(() => {})
  }, [user])

  if (!user) {
    return (
      <main className="page-column assistant-page">
        <header className="assistant-masthead">
          <p className="assistant-kicker">Assistant · 班级 AI 助手</p>
          <h1 className="assistant-title">中法双语数学答疑</h1>
          <p className="assistant-subtitle" lang="fr">Pose une question de maths ou de français — en chinois ou en français.</p>
        </header>
        <div className="assistant-gate">
          <p>登录后即可使用班级 AI 助手。</p>
          <p><Link to="/login" className="assistant-link">前往登录 →</Link></p>
        </div>
      </main>
    )
  }

  return (
    <main className="page-column assistant-page">
      <header className="assistant-masthead">
        <p className="assistant-kicker">Assistant · 班级 AI 助手</p>
        <h1 className="assistant-title">中法双语数学答疑</h1>
        <p className="assistant-subtitle" lang="fr">Pose une question de maths ou de français — en chinois ou en français.</p>
      </header>

      {messages.length > 0 ? (
        <div className="assistant-toolbar">
          <button type="button" className="assistant-clear" onClick={handleClear}>清空历史 · Effacer</button>
        </div>
      ) : null}

      <div className="assistant-thread" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="assistant-starters">
            <p className="assistant-starters-label">试试问:</p>
            {STARTERS.map((s) => (
              <button key={s} type="button" className="assistant-starter" onClick={() => send(s)} lang={/[a-zA-Zéèàçù]/.test(s[0]) ? 'fr' : undefined}>
                {s}
              </button>
            ))}
          </div>
        ) : (
          messages.map((m, idx) => (
            <div key={idx} className={`assistant-turn is-${m.role === 'user' ? 'user' : 'ai'}`}>
              <p className="assistant-turn-role" aria-hidden="true">{m.role === 'user' ? '你' : 'Assistant'}</p>
              {m.role === 'user' ? (
                <>
                  {m.image ? <img className="assistant-turn-img" src={m.image} alt="附图" /> : null}
                  <p className="assistant-turn-text">{m.content}</p>
                </>
              ) : (
                <p className="assistant-turn-text" dangerouslySetInnerHTML={{ __html: renderRich(m.content) }} />
              )}
            </div>
          ))
        )}
        {loading ? (
          <div className="assistant-turn is-ai">
            <p className="assistant-turn-role" aria-hidden="true">Assistant</p>
            <p className="assistant-turn-text assistant-typing"><span /><span /><span /></p>
          </div>
        ) : null}
      </div>

      {error ? <p className="assistant-error">{error}</p> : null}

      {image ? (
        <div className="assistant-attach">
          <img className="assistant-attach-thumb" src={image.preview} alt="待发送的图片" />
          <span className="assistant-attach-label">图片已附上 · 发送即一起提问</span>
          <button type="button" className="assistant-attach-remove" onClick={() => setImage(null)} aria-label="移除图片">×</button>
        </div>
      ) : null}

      <form
        className="assistant-composer"
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
      >
        <button
          type="button"
          className="assistant-attach-btn"
          onClick={() => fileRef.current?.click()}
          disabled={loading}
          aria-label="上传图片(拍数学题)"
          title="上传图片(拍数学题)"
        >
          📷
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={onPickImage} style={{ display: 'none' }} />
        <textarea
          ref={inputRef}
          className="assistant-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send(input)
            }
          }}
          placeholder="问问题,或 📷 拍张数学题…（Entrée 发送，Shift+Entrée 换行）"
          rows={2}
          disabled={loading}
          aria-label="向 AI 助手提问"
        />
        <button type="submit" className="assistant-send" disabled={loading || (!input.trim() && !image)}>
          {loading ? '…' : '发送'}
        </button>
      </form>
      <p className="assistant-foot">由 Gemini 驱动 · 可拍题问图 · 仅供学习参考,请自行核对。</p>
    </main>
  )
}
