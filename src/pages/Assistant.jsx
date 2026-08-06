import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import katex from 'katex'
import { useAuth } from '../context/useAuth'
import AssistantDesktopView from '../experiences/desktop/assistant/AssistantDesktopView'
import AssistantMobileView from '../experiences/mobile/assistant/AssistantMobileView'
import useExperienceMode from '../experiences/shared/useExperienceMode'
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

// AI 助手 — 前端只跟同域 Worker 代理对话(/api/chat),Gemini key 在
// Cloudflare secret 里,前端产物永不含它。无状态:历史只存在本页 state。
const AI_ENDPOINT = '/api/chat' // 同域相对路径(生产由 CF Worker 路由接管;dev 走 vite proxy)
const MAX_HISTORY = 20

const STARTERS = [
  '用中文解释一下中值定理的直觉',
  'Conjugue le verbe « résoudre » au présent',
  '« dérivée » 是阴性还是阳性?给个例句',
  'Explique la différence entre limite et continuité',
]

const MODE_PROMPTS = {
  guider: '采用引导模式：先诊断学生卡在哪里，通过简短问题推动其独立推理，不直接给出完整答案。',
  expliquer: '采用解释模式：用中法双语中的合适语言清楚解释概念，并给一个最小例子。',
  verifier: '采用核验模式：逐步检查用户的证明、计算或法语表达，指出第一个关键错误和修正理由。',
}

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
  const location = useLocation()
  const experienceMode = useExperienceMode()
  const [messages, setMessages] = useState([]) // {role:'user'|'model', content}
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [image, setImage] = useState(null) // { mimeType, data, preview }
  const [mode, setMode] = useState('guider')
  const inputRef = useRef(null)
  const fileRef = useRef(null)
  const requestRef = useRef(null)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const requestedMode = params.get('mode')
    const term = params.get('term')
    const answer = params.get('answer')
    if (MODE_PROMPTS[requestedMode]) setMode(requestedMode)
    if (term) setInput(`请解释法语词 « ${term} »${answer ? `，并分析我刚才的答案「${answer}」为什么不对` : ''}。`)
  }, [location.search])

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
        const modelMessages = next.map((m) => ({ role: m.role, content: m.content }))
        const lastUserIndex = modelMessages.findLastIndex((message) => message.role === 'user')
        if (lastUserIndex >= 0) modelMessages[lastUserIndex].content = `${MODE_PROMPTS[mode]}\n\n${modelMessages[lastUserIndex].content}`
        const body = { messages: modelMessages }
        if (sentImage) body.image = { mimeType: sentImage.mimeType, data: sentImage.data }
        const controller = new AbortController()
        requestRef.current = controller
        const res = await fetch(AI_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        })
        if (!res.ok) throw new Error(`服务返回 ${res.status}`)
        const data = await res.json()
        const reply = `${data?.text || ''}`.trim()
        if (!reply) throw new Error('空回复')
        setMessages((m) => [...m, { role: 'model', content: reply }])
        if (user) saveMessage(user.id, 'model', reply).catch(() => {})
      } catch (err) {
        if (err?.name !== 'AbortError') setError(err?.message || '请求失败,请稍后再试。')
      } finally {
        requestRef.current = null
        setLoading(false)
        inputRef.current?.focus()
      }
    },
    [messages, loading, user, image, mode],
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

  const handleStop = useCallback(() => {
    requestRef.current?.abort()
  }, [])

  const View = experienceMode === 'mobile' ? AssistantMobileView : AssistantDesktopView
  return <View user={user} messages={messages} starters={STARTERS} mode={mode} setMode={setMode} input={input} setInput={setInput} loading={loading} error={error} image={image} setImage={setImage} send={send} stop={handleStop} clear={handleClear} pickImage={onPickImage} fileRef={fileRef} inputRef={inputRef} renderRich={renderRich} />
}
