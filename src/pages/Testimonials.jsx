import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useWorld } from '../context/useWorld'
import { archivedTestimonials } from '../data/testimonialArchive'
import { createTestimonial, loadTestimonials } from '../lib/testimonialsBackend'
import { isSupabaseConfigured } from '../lib/supabase'

const MAX_CONTENT_LENGTH = 120
const MAX_SIGNATURE_LENGTH = 24

function formatDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Asia/Shanghai',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

export default function Testimonials() {
  const { user, isAuthEnabled } = useAuth()
  const { setWorld } = useWorld()
  const [remoteEntries, setRemoteEntries] = useState([])
  const [draft, setDraft] = useState('')
  const [signature, setSignature] = useState('')
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    setWorld('carnet')
  }, [setWorld])

  useEffect(() => {
    let active = true

    const load = async () => {
      if (!isSupabaseConfigured) {
        setLoading(false)
        return
      }

      try {
        const entries = await loadTestimonials()
        if (active) setRemoteEntries(entries)
      } catch (error) {
        if (active) {
          console.error('[testimonials] load failed', error)
          setStatus('寄语数据库尚未就绪;历史档案仍可阅读。')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const entries = useMemo(() => [
    ...archivedTestimonials,
    ...remoteEntries.map((entry) => ({
      id: `supabase-${entry.id}`,
      content: entry.content,
      signature: entry.signature || 'anonyme',
      date: formatDate(entry.created_at),
      source: 'supabase',
    })),
  ], [remoteEntries])

  const remaining = MAX_CONTENT_LENGTH - [...draft].length

  const handleSubmit = async (event) => {
    event.preventDefault()
    const content = draft.trim()

    if (!user) {
      setStatus('请先登录,再把这句话存入班级档案。')
      return
    }
    if (!content || remaining < 0) return

    setSubmitting(true)
    setStatus('')
    try {
      const entry = await createTestimonial({
        content,
        signature,
        userId: user.id,
      })
      setRemoteEntries((current) => [...current, entry])
      setDraft('')
      setSignature('')
      setStatus('已存入班级档案。')
    } catch (error) {
      console.error('[testimonials] submit failed', error)
      setStatus('暂时没能存下这句话;请稍后再试。')
    } finally {
      setSubmitting(false)
    }
  }

  const defaultSignature = user?.user_metadata?.nickname || user?.user_metadata?.real_name || ''

  return (
    <article className="testimonials-page">
      <div className="testimonials-column">
        <header className="testimonials-masthead">
          <div className="testimonials-running-head">
            <Link to="/">← Carnet de classe</Link>
            <span>N°02 · Le Carnet — archives</span>
          </div>
          <div className="testimonials-rule" />
          <div className="testimonials-title">
            <p>Registre des témoignages · 寄语簿</p>
            <h1>Pour la classe</h1>
            <p>给这个班留下一句话。留下的话会进入班级档案,和定理、照片一起被保存下去。</p>
          </div>
          <div className="testimonials-rule" />
        </header>

        <section className="testimonials-write">
          <p>Écrire · 留一句话</p>
          {user ? (
            <form onSubmit={handleSubmit}>
              <textarea
                rows="2"
                value={draft}
                maxLength={MAX_CONTENT_LENGTH + 20}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="写给 2025 级数学班……"
                aria-label="写给班级的寄语"
              />
              <input
                type="text"
                value={signature}
                maxLength={MAX_SIGNATURE_LENGTH}
                onChange={(event) => setSignature(event.target.value)}
                placeholder={defaultSignature || '署名 · signature'}
                aria-label="署名"
              />
              <p className={remaining < 0 ? 'is-error' : ''}>
                {remaining >= 0 ? `还能写 ${remaining} 字` : `超出 ${-remaining} 字`}
              </p>
              <button type="submit" disabled={submitting || !draft.trim() || remaining < 0}>
                {submitting ? 'déposer…' : 'déposer · 存入档案 →'}
              </button>
            </form>
          ) : (
            <p className="testimonials-signin">
              {isAuthEnabled ? (
                <><Link to="/login">登录</Link>后可以署名留话;阅读不需要登录。</>
              ) : '当前为只读档案;登录服务尚未启用。'}
            </p>
          )}
          {status ? <p className="testimonials-status" aria-live="polite">{status}</p> : null}
        </section>

        <section className="testimonials-register">
          <p>Registre · 已存 {entries.length} 条 · par ordre d’arrivée</p>
          {loading ? <p className="testimonials-loading">正在翻阅档案…</p> : null}
          <ol>
            {entries.map((entry, index) => (
              <li key={entry.id}>
                <p>№ {String(index + 1).padStart(2, '0')}</p>
                <blockquote>{entry.content}</blockquote>
                <p>— {entry.signature} · {entry.date}</p>
                {entry.source === 'solana' ? <small>archive class_anchor · migration vérifiée</small> : null}
                <span aria-hidden="true" />
              </li>
            ))}
          </ol>
        </section>

        <section className="testimonials-stele">
          <p>Archive · 碑 — 2026</p>
          <h2>那年,我们把班级写上了链</h2>
          <p>
            二〇二六年春,这面寄语墙曾经生活在 Solana 区块链上:每一句话都由留言者亲手签名,写进公共账本。
            那是一场黑客松,也是一次关于「永恒」的练习。后来我们把话取了回来,存进这本更安静的册子——
            因为真正替我们保存这些句子的,从来不是账本,是班级本身。
          </p>
          <p>
            Solana devnet · SPL Memo v2 · programme class_anchor<br />
            ed25519 signé par la classe · retiré avec dignité, 2026
          </p>
        </section>
      </div>
    </article>
  )
}
