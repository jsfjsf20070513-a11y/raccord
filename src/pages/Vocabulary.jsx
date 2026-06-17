import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Check, RotateCcw, Sparkles, X } from 'lucide-react'
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
import { fetchReviewStateMap, saveReviewState } from '../lib/vocabularyBackend'

const MAX_NEW = 8
const MAX_REVIEW = 40

// The deck is static, so validate it once at module load. Invalid entries
// (a noun without gender, a verb without a conjugation) are dropped rather than
// shown — the same domain rule the trainer enforces conceptually.
const VALID_DECK = cleanFrenchDeck(frenchVocabulary).valid

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
      const built = buildStudyQueue({
        deck: VALID_DECK,
        stateMap: states,
        now,
        maxNew: MAX_NEW,
        maxReview: MAX_REVIEW,
      })
      setQueue(built)
      setIndex(0)
      setRevealed(false)
      setStats({ correct: 0, wrong: 0 })
      setStatus(built.length ? 'ready' : 'empty')
    } catch (error) {
      setErrorMessage(error?.message || '加载背词数据失败。')
      setStatus('error')
    }
  }, [user])

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

  const progress = useMemo(
    () => (queue.length ? `${Math.min(index + 1, queue.length)} / ${queue.length}` : '0 / 0'),
    [index, queue.length],
  )

  return (
    <main className="page page-narrow">
      <PageHeader
        kicker="Carnet de vocabulaire · 法语背词"
        title="间隔重复背词器"
        summary="艾宾浩斯阶梯调度 · 新词与复习词交替 · 进度按你的账号保存。"
        meta={[`词库 ${VALID_DECK.length} 条`, '答对进一阶，答错归零']}
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
          <p style={{ marginTop: '1rem' }}>今天没有到期要复习的词,也没有新词了。明天再来 👋</p>
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
                  <X size={16} aria-hidden="true" /> 没记住
                </button>
                <button type="button" onClick={() => grade(REVIEW_RESULT.correct)}>
                  <Check size={16} aria-hidden="true" /> 记住了
                </button>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '1.6rem' }}>
              <button type="button" onClick={() => setRevealed(true)}>显示释义</button>
            </div>
          )}
        </section>
      ) : null}
    </main>
  )
}
