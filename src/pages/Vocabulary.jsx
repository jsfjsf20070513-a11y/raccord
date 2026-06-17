import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Check, Download, RotateCcw, Shuffle, Sparkles, Upload, X } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/useAuth'
import { frenchVocabulary } from '../data/frenchVocabulary'
import {
  REVIEW_RESULT,
  buildStudyQueue,
  cleanFrenchDeck,
  computeDeckStats,
  computeStudyStreak,
  gradeReviewState,
} from '../lib/srsScheduler'
import { fetchReviewStateMap, importReviewStates, saveReviewState } from '../lib/vocabularyBackend'
import { parseProgressImport, serializeProgress } from '../lib/vocabularyProgress'

const MAX_NEW = 8
const MAX_REVIEW = 40

// The deck is static, so validate it once at module load. Invalid entries
// (a noun without gender, a verb without a conjugation) are dropped rather than
// shown — the same domain rule the trainer enforces conceptually.
const VALID_DECK = cleanFrenchDeck(frenchVocabulary).valid
const DECK_TAGS = ['all', ...Array.from(new Set(VALID_DECK.map((w) => w.tag).filter(Boolean)))]

// Fisher–Yates; lives here (not in the pure tested scheduler) because it uses
// Math.random. Order-only, never mutates the input.
function shuffled(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const cardStyle = {
  border: '1px solid var(--rule, #d8d2c4)',
  borderRadius: '10px',
  padding: '2.4rem 1.8rem',
  textAlign: 'center',
  background: 'var(--surface, #fcfbf7)',
  marginTop: '1.4rem',
}

export default function Vocabulary() {
  const { user } = useAuth()
  const [status, setStatus] = useState('loading') // loading|ready|disabled|compat|empty|error|done
  const [queue, setQueue] = useState([])
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [stats, setStats] = useState({ correct: 0, wrong: 0 })
  const [deckStats, setDeckStats] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [tag, setTag] = useState('all')
  const [shuffle, setShuffle] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const fileInputRef = useRef(null)

  const load = useCallback(async () => {
    if (!user) return
    setStatus('loading')
    setErrorMessage('')
    try {
      const { mode, states } = await fetchReviewStateMap(user.id)
      if (mode === 'disabled') {
        setStatus('disabled')
        return
      }
      if (mode === 'compat') {
        setStatus('compat')
        return
      }
      const now = new Date().toISOString()
      // Progress stats always reflect the WHOLE deck, not the current filter.
      setDeckStats({
        ...computeDeckStats({ deck: VALID_DECK, stateMap: states, now }),
        streak: computeStudyStreak(Object.values(states), now),
      })
      const deck = tag === 'all' ? VALID_DECK : VALID_DECK.filter((w) => w.tag === tag)
      let built = buildStudyQueue({ deck, stateMap: states, now, maxNew: MAX_NEW, maxReview: MAX_REVIEW })
      if (shuffle) built = shuffled(built)
      setQueue(built)
      setIndex(0)
      setRevealed(false)
      setStats({ correct: 0, wrong: 0 })
      setStatus(built.length ? 'ready' : 'empty')
    } catch (error) {
      setErrorMessage(error?.message || '加载背词数据失败。')
      setStatus('error')
    }
  }, [user, tag, shuffle])

  useEffect(() => {
    if (user) {
      load()
    }
  }, [user, load])

  const current = queue[index]

  const grade = useCallback(
    async (result) => {
      if (!current || !user) return
      const now = new Date().toISOString()
      const nextState = gradeReviewState(
        { ...current.state, user_id: user.id, word_id: current.word.id },
        result,
        now,
      )

      setStats((prev) => ({
        correct: prev.correct + (result === REVIEW_RESULT.correct ? 1 : 0),
        wrong: prev.wrong + (result === REVIEW_RESULT.wrong ? 1 : 0),
      }))

      // Persist best-effort; a missing table or transient error must not block
      // the study flow (the schedule still advanced locally for this session).
      try {
        await saveReviewState(nextState)
      } catch {
        // swallow — keep studying
      }

      if (index + 1 >= queue.length) {
        setStatus('done')
      } else {
        setIndex((i) => i + 1)
        setRevealed(false)
      }
    },
    [current, user, index, queue.length],
  )

  // Keyboard shortcuts: Space reveals; once revealed, 1 = 没记住, 2 = 记住了.
  useEffect(() => {
    if (status !== 'ready') return undefined
    const onKey = (event) => {
      const tagName = event.target?.tagName
      if (tagName === 'INPUT' || tagName === 'TEXTAREA') return
      if (event.code === 'Space') {
        event.preventDefault()
        if (!revealed) setRevealed(true)
      } else if (revealed && event.key === '1') {
        grade(REVIEW_RESULT.wrong)
      } else if (revealed && event.key === '2') {
        grade(REVIEW_RESULT.correct)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [status, revealed, grade])

  const handleExport = useCallback(async () => {
    if (!user) return
    try {
      const { states } = await fetchReviewStateMap(user.id)
      const json = serializeProgress(Object.values(states), { exportedAt: new Date().toISOString() })
      const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `vocab-progress-${new Date().toISOString().slice(0, 10)}.json`
      anchor.click()
      URL.revokeObjectURL(url)
      setImportMsg('已导出进度 JSON。')
    } catch (error) {
      setImportMsg(`导出失败:${error?.message || error}`)
    }
  }, [user])

  const handleImportFile = useCallback(
    async (event) => {
      const file = event.target.files?.[0]
      if (!file || !user) return
      setImportMsg('正在导入…')
      try {
        const text = await file.text()
        const { rows, report } = parseProgressImport(text)
        const { mode, count } = await importReviewStates(rows, user.id)
        if (mode === 'compat') {
          setImportMsg('数据表还没建立,无法导入。')
        } else if (mode === 'disabled') {
          setImportMsg('Supabase 未配置,无法导入。')
        } else {
          setImportMsg(`导入完成:写入 ${count} 条,跳过 ${report.rejected.length} 条无效行。`)
          await load()
        }
      } catch (error) {
        setImportMsg(`导入失败:${error?.message || error}`)
      } finally {
        event.target.value = '' // allow re-selecting the same file
      }
    },
    [user, load],
  )

  const progress = useMemo(
    () => (queue.length ? `${Math.min(index + 1, queue.length)} / ${queue.length}` : '0 / 0'),
    [index, queue.length],
  )

  const showControls = user && (status === 'ready' || status === 'empty' || status === 'done')

  return (
    <main className="page page-narrow">
      <PageHeader
        kicker="Carnet de vocabulaire · 法语背词"
        title="间隔重复背词器"
        summary="艾宾浩斯阶梯调度 · 新词与复习词交替 · 进度按你的账号保存。"
        meta={[`词库 ${VALID_DECK.length} 条`, '空格翻面 · 1 没记住 · 2 记住了']}
      />

      {user && deckStats ? (
        <section
          aria-label="学习进度"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.6rem 1.4rem',
            justifyContent: 'center',
            margin: '0.6rem 0 0',
            fontSize: '0.9rem',
          }}
        >
          <span title="今天可学(新词 + 到期复习)">📅 今日到期 <strong>{deckStats.due}</strong></span>
          <span title="已掌握(达到 30 天间隔阶)">✅ 已掌握 <strong>{deckStats.mastered}</strong></span>
          <span title="学习中(已见过但未掌握)">📖 学习中 <strong>{deckStats.learning}</strong></span>
          <span title="还没开始背的新词">✨ 新词 <strong>{deckStats.newCount}</strong></span>
          <span title="连续背词天数">🔥 连续 <strong>{deckStats.streak}</strong> 天</span>
        </section>
      ) : null}

      {showControls ? (
        <section
          aria-label="背词设置"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem 0.8rem',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '1rem 0 0',
            fontSize: '0.85rem',
          }}
        >
          <span style={{ opacity: 0.7 }}>标签:</span>
          {DECK_TAGS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTag(t)}
              aria-pressed={tag === t}
              style={{ fontWeight: tag === t ? 700 : 400, textDecoration: tag === t ? 'underline' : 'none' }}
            >
              {t === 'all' ? '全部' : t}
            </button>
          ))}
          <button type="button" onClick={() => setShuffle((s) => !s)} aria-pressed={shuffle}>
            <Shuffle size={14} aria-hidden="true" /> 乱序{shuffle ? ':开' : ':关'}
          </button>
          <button type="button" onClick={handleExport}>
            <Download size={14} aria-hidden="true" /> 导出进度
          </button>
          <button type="button" onClick={() => fileInputRef.current?.click()}>
            <Upload size={14} aria-hidden="true" /> 导入进度
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportFile}
            style={{ display: 'none' }}
          />
          {importMsg ? <span style={{ width: '100%', textAlign: 'center', opacity: 0.75 }}>{importMsg}</span> : null}
        </section>
      ) : null}

      {!user ? (
        <section style={cardStyle}>
          <BookOpen size={28} aria-hidden="true" />
          <p style={{ marginTop: '1rem' }}>背词进度按账号保存,请先登录。</p>
          <p style={{ marginTop: '1rem' }}>
            <Link to="/login">前往登录 · Se connecter</Link>
          </p>
        </section>
      ) : null}

      {user && status === 'loading' ? (
        <section style={cardStyle}><p>正在加载你的背词进度…</p></section>
      ) : null}

      {user && status === 'disabled' ? (
        <section style={cardStyle}>
          <p>站点尚未配置 Supabase,背词功能暂不可用。</p>
        </section>
      ) : null}

      {user && status === 'compat' ? (
        <section style={cardStyle}>
          <p>背词数据表还没建立。请在 Supabase 执行 <code>setup_vocabulary.sql</code> 后再来。</p>
        </section>
      ) : null}

      {user && status === 'error' ? (
        <section style={cardStyle}>
          <p>出错了:{errorMessage}</p>
          <p style={{ marginTop: '1rem' }}>
            <button type="button" onClick={load}>重试</button>
          </p>
        </section>
      ) : null}

      {user && status === 'empty' ? (
        <section style={cardStyle}>
          <Sparkles size={28} aria-hidden="true" />
          <p style={{ marginTop: '1rem' }}>这个范围今天没有要背的词了。换个标签或明天再来 👋</p>
        </section>
      ) : null}

      {user && status === 'done' ? (
        <section style={cardStyle}>
          <Sparkles size={28} aria-hidden="true" />
          <p style={{ marginTop: '1rem' }}>本轮完成!答对 {stats.correct} · 答错 {stats.wrong}</p>
          <p style={{ marginTop: '1rem' }}>
            <button type="button" onClick={load}>
              <RotateCcw size={16} aria-hidden="true" /> 再来一轮
            </button>
          </p>
        </section>
      ) : null}

      {user && status === 'ready' && current ? (
        <section style={cardStyle}>
          <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>
            {progress} · {current.isNew ? '新词 nouveau' : '复习 révision'} · {current.word.tag || ''}
          </p>

          <p style={{ fontSize: '2rem', margin: '1.2rem 0 0.4rem' }} lang="fr">
            {current.word.french}
          </p>
          {current.word.pos === 'noun' && current.word.gender ? (
            <p style={{ opacity: 0.7 }}>({current.word.gender === 'm' ? 'masculin' : 'féminin'})</p>
          ) : null}

          {revealed ? (
            <div style={{ marginTop: '1.2rem' }}>
              <p style={{ fontSize: '1.4rem' }}>{current.word.chinese}</p>
              {current.word.conjugation ? (
                <p style={{ opacity: 0.75, marginTop: '0.4rem' }} lang="fr">变位:{current.word.conjugation}</p>
              ) : null}
              {current.word.example ? (
                <p style={{ opacity: 0.75, marginTop: '0.4rem' }} lang="fr">« {current.word.example} »</p>
              ) : null}

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginTop: '1.6rem' }}>
                <button type="button" onClick={() => grade(REVIEW_RESULT.wrong)}>
                  <X size={16} aria-hidden="true" /> 没记住 <kbd>1</kbd>
                </button>
                <button type="button" onClick={() => grade(REVIEW_RESULT.correct)}>
                  <Check size={16} aria-hidden="true" /> 记住了 <kbd>2</kbd>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '1.6rem' }}>
              <button type="button" onClick={() => setRevealed(true)}>显示释义 <kbd>空格</kbd></button>
            </div>
          )}
        </section>
      ) : null}
    </main>
  )
}
