import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

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

export default function Assistant() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([]) // {role:'user'|'model', content}
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  const send = useCallback(
    async (text) => {
      const content = `${text}`.trim()
      if (!content || loading) return
      setError('')
      const next = [...messages, { role: 'user', content }].slice(-MAX_HISTORY)
      setMessages(next)
      setInput('')
      setLoading(true)
      try {
        const res = await fetch(AI_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: next }),
        })
        if (!res.ok) throw new Error(`服务返回 ${res.status}`)
        const data = await res.json()
        const reply = `${data?.text || ''}`.trim()
        if (!reply) throw new Error('空回复')
        setMessages((m) => [...m, { role: 'model', content: reply }])
      } catch (err) {
        setError(err?.message || '请求失败,请稍后再试。')
      } finally {
        setLoading(false)
        inputRef.current?.focus()
      }
    },
    [messages, loading],
  )

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
              <p className="assistant-turn-text">{m.content}</p>
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

      <form
        className="assistant-composer"
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
      >
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
          placeholder="问一个数学或法语问题…（Entrée 发送，Shift+Entrée 换行）"
          rows={2}
          disabled={loading}
          aria-label="向 AI 助手提问"
        />
        <button type="submit" className="assistant-send" disabled={loading || !input.trim()}>
          {loading ? '…' : '发送'}
        </button>
      </form>
      <p className="assistant-foot">由 Gemini 驱动 · 仅供学习参考,请自行核对。</p>
    </main>
  )
}
