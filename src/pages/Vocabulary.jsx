import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
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

// Accent the figure inside an otherwise-muted stat label, no emoji — matches the
// site's editorial palette (--accent / --muted) rather than shouting with icons.
function Stat({ label, value }) {
  return (
    <span>
      {label} <span style={{ color: 'var(--accent)' }}>{value}</span>
    </span>
  )
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

  const showControls = user && (status === 'ready' || status === 'empty' || status === 'done')

  return (
    <main className="page page-narrow vocab-page">
      <PageHeader
        kicker="Carnet de vocabulaire · 法语背词"
        title="间隔重复背词器"
        summary="艾宾浩斯阶梯调度 · 新词与复习词交替 · 进度按你的账号保存。"
        meta={[`词库 ${VALID_DECK.length} 条`, '空格翻面 · 1 没记住 · 2 记住了']}
      />

      {user && status === 'ready' && current ? (
        <div
          className="vocab-progress"
          role="progressbar"
          aria-label="本轮进度"
          aria-valuenow={index + 1}
          aria-valuemin={1}
          aria-valuemax={queue.length}
        >
          <span className="vocab-progress-label">{current.isNew ? '新词' : '复习'}</span>
          <span className="vocab-progress-track" aria-hidden="true">
            <span
              className="vocab-progress-fill"
              style={{ width: `${Math.round(((index + 1) / queue.length) * 100)}%` }}
            />
          </span>
          <span className="vocab-progress-count">{index + 1} / {queue.length}</span>
        </div>
      ) : null}

      {!user ? (
        <div className="vocab-card vocab-notice">
          <p>背词进度按账号保存,请先登录。</p>
          <p className="editorial-actions"><Link to="/login" className="text-button">前往登录 · Se connecter</Link></p>
        </div>
      ) : null}

      {user && status === 'loading' ? (
        <div className="vocab-card vocab-notice"><p className="daily-entry-meta">正在加载你的背词进度…</p></div>
      ) : null}

      {user && status === 'disabled' ? (
        <div className="vocab-card vocab-notice"><p>站点尚未配置 Supabase,背词功能暂不可用。</p></div>
      ) : null}

      {user && status === 'compat' ? (
        <div className="vocab-card vocab-notice">
          <p>背词数据表还没建立。请在 Supabase 执行 <code>setup_vocabulary.sql</code> 后再来。</p>
        </div>
      ) : null}

      {user && status === 'error' ? (
        <div className="vocab-card vocab-notice">
          <p>出错了:{errorMessage}</p>
          <p className="editorial-actions"><button type="button" className="text-button" onClick={load}>重试</button></p>
        </div>
      ) : null}

      {user && status === 'empty' ? (
        <div className="vocab-card vocab-notice">
          <p>这个范围今天没有要背的词了。换个标签或明天再来。</p>
        </div>
      ) : null}

      {user && status === 'done' ? (
        <div className="vocab-card vocab-notice">
          <p>本轮完成 — 答对 <span style={{ color: 'var(--accent)' }}>{stats.correct}</span> · 答错 <span style={{ color: 'var(--accent)' }}>{stats.wrong}</span>。</p>
          <p className="editorial-actions"><button type="button" className="text-button" onClick={load}>再来一轮</button></p>
        </div>
      ) : null}

      {user && status === 'ready' && current ? (
        <div className="vocab-card">
          <p className="daily-entry-kicker vocab-card-kicker">
            {current.isNew ? '新词 nouveau' : '复习 révision'}{current.word.tag ? ` · ${current.word.tag}` : ''}
          </p>

          <p className="vocab-word" lang="fr">{current.word.french}</p>
          {current.word.pos === 'noun' && current.word.gender ? (
            <p className="daily-entry-meta vocab-gender">{current.word.gender === 'm' ? 'masculin' : 'féminin'}</p>
          ) : null}

          {revealed ? (
            <div className="vocab-reveal">
              <div className="theorem-explanation-block">
                <p className="theorem-explanation-lang" aria-hidden="true">中文</p>
                <p className="vocab-chinese">{current.word.chinese}</p>
              </div>
              {current.word.conjugation ? (
                <div className="theorem-explanation-block">
                  <p className="theorem-explanation-lang" aria-hidden="true">Conjugaison</p>
                  <p lang="fr">{current.word.conjugation}</p>
                </div>
              ) : null}
              {current.word.example ? (
                <div className="theorem-explanation-block">
                  <p className="theorem-explanation-lang" aria-hidden="true">Exemple</p>
                  <p lang="fr">« {current.word.example} »</p>
                </div>
              ) : null}

              <div className="editorial-actions vocab-grade">
                <button type="button" className="text-button subtle" onClick={() => grade(REVIEW_RESULT.wrong)}>
                  没记住 <span className="vocab-key">1</span>
                </button>
                <button type="button" className="text-button" onClick={() => grade(REVIEW_RESULT.correct)}>
                  记住了 <span className="vocab-key">2</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="editorial-actions vocab-grade">
              <button type="button" className="text-button" onClick={() => setRevealed(true)}>
                显示释义 <span className="vocab-key">空格</span>
              </button>
            </div>
          )}
        </div>
      ) : null}

      {showControls ? (
        <footer className="vocab-footer">
          <div className="editorial-actions tabs vocab-tags">
            <span className="theorem-explanation-lang" aria-hidden="true">标签</span>
            {DECK_TAGS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTag(t)}
                aria-pressed={tag === t}
                className={`text-button${tag === t ? '' : ' subtle'}`}
              >
                {t === 'all' ? '全部' : t}
              </button>
            ))}
            <span className="vocab-dot" aria-hidden="true">·</span>
            <button type="button" className="text-button subtle" onClick={() => setShuffle((s) => !s)} aria-pressed={shuffle}>
              乱序 {shuffle ? '开' : '关'}
            </button>
            <button type="button" className="text-button subtle" onClick={handleExport}>导出</button>
            <button type="button" className="text-button subtle" onClick={() => fileInputRef.current?.click()}>导入</button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImportFile}
              style={{ display: 'none' }}
            />
          </div>

          {deckStats ? (
            <p className="daily-entry-meta vocab-stats" aria-label="学习进度">
              <Stat label="已掌握" value={deckStats.mastered} />
              <span className="vocab-dot" aria-hidden="true">·</span>
              <Stat label="学习中" value={deckStats.learning} />
              <span className="vocab-dot" aria-hidden="true">·</span>
              <Stat label="新词" value={deckStats.newCount} />
              <span className="vocab-dot" aria-hidden="true">·</span>
              <Stat label="连续" value={`${deckStats.streak} 天`} />
            </p>
          ) : null}

          {importMsg ? <p className="status-line vocab-msg">{importMsg}</p> : null}
        </footer>
      ) : null}
    </main>
  )
}
