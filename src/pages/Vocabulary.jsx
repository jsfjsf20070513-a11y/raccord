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
import {
  EXERCISE_TYPES,
  buildExercise,
  buildMatchExercise,
  gradeExercise,
} from '../lib/exerciseGenerator'
import { fetchReviewStateMap, importReviewStates, saveReviewState } from '../lib/vocabularyBackend'
import { parseProgressImport, serializeProgress } from '../lib/vocabularyProgress'

const MAX_NEW = 8
const MAX_REVIEW = 40
// Rotate exercise formats across the session so a word is met different ways.
const TYPE_ROTATION = [
  EXERCISE_TYPES.recognition,
  EXERCISE_TYPES.build,
  EXERCISE_TYPES.cloze,
  EXERCISE_TYPES.listen,
  EXERCISE_TYPES.spelling,
]

const VALID_DECK = cleanFrenchDeck(frenchVocabulary).valid
const DECK_TAGS = ['all', ...Array.from(new Set(VALID_DECK.map((w) => w.tag).filter(Boolean)))]

function shuffled(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function Stat({ label, value }) {
  return (
    <span>
      {label} <span style={{ color: 'var(--accent)' }}>{value}</span>
    </span>
  )
}

// Turn the SRS study queue into a list of exercise steps. A match warm-up leads
// when there are ≥4 cards; the rest rotate through the formats. Non-match steps
// carry the word + SRS state so grading can persist.
function buildSession(queue, deck) {
  const steps = []
  if (queue.length >= 4) {
    const four = queue.slice(0, 4)
    steps.push({ kind: 'match', exercise: buildMatchExercise(four.map((q) => q.word)) })
  }
  queue.forEach((item, idx) => {
    const type = TYPE_ROTATION[idx % TYPE_ROTATION.length]
    steps.push({ kind: 'card', word: item.word, state: item.state, exercise: buildExercise(item.word, deck, { type }) })
  })
  return steps
}

export default function Vocabulary() {
  const { user } = useAuth()
  const [status, setStatus] = useState('loading') // loading|ready|disabled|compat|empty|error|done
  const [steps, setSteps] = useState([])
  const [i, setI] = useState(0)
  const [phase, setPhase] = useState('answer') // answer|feedback
  const [lastCorrect, setLastCorrect] = useState(null)
  const [picked, setPicked] = useState(null)
  const [input, setInput] = useState('')
  const [chosen, setChosen] = useState([]) // build: ordered tile ids
  const [match, setMatch] = useState({ sel: null, done: [], wrong: [] })
  const [stats, setStats] = useState({ correct: 0, attempts: 0, combo: 0, maxCombo: 0 })
  const [deckStats, setDeckStats] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [tag, setTag] = useState('all')
  const [shuffle, setShuffle] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const fileInputRef = useRef(null)
  const inputRef = useRef(null)
  const audioRef = useRef(null)
  const spokenRef = useRef(-1)

  const current = steps[i]

  // ── audio: WebAudio verdict cue + speechSynthesis for the listen format ──
  const tone = useCallback((ok) => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!Ctx) return
      const ac = audioRef.current || (audioRef.current = new Ctx())
      if (ac.state === 'suspended') ac.resume()
      const t = ac.currentTime
      const notes = ok ? [587.33, 880] : [392, 261.63]
      notes.forEach((f, k) => {
        const osc = ac.createOscillator()
        const gain = ac.createGain()
        osc.type = 'sine'
        osc.frequency.value = f
        const st = t + k * 0.1
        gain.gain.setValueAtTime(0.0001, st)
        gain.gain.exponentialRampToValueAtTime(0.09, st + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, st + 0.22)
        osc.connect(gain)
        gain.connect(ac.destination)
        osc.start(st)
        osc.stop(st + 0.24)
      })
    } catch {
      // audio is a nicety; never let it break the study flow
    }
  }, [])

  const speak = useCallback((text) => {
    try {
      const synth = window.speechSynthesis
      if (!synth || !text) return
      synth.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'fr-FR'
      u.rate = 0.9
      const voice = (synth.getVoices() || []).find((v) => /fr/i.test(v.lang))
      if (voice) u.voice = voice
      synth.speak(u)
    } catch {
      // speech is optional
    }
  }, [])

  const load = useCallback(async () => {
    if (!user) return
    setStatus('loading')
    setErrorMessage('')
    try {
      const { mode, states } = await fetchReviewStateMap(user.id)
      if (mode === 'disabled') return setStatus('disabled')
      if (mode === 'compat') return setStatus('compat')
      const now = new Date().toISOString()
      setDeckStats({
        ...computeDeckStats({ deck: VALID_DECK, stateMap: states, now }),
        streak: computeStudyStreak(Object.values(states), now),
      })
      const deck = tag === 'all' ? VALID_DECK : VALID_DECK.filter((w) => w.tag === tag)
      let queue = buildStudyQueue({ deck, stateMap: states, now, maxNew: MAX_NEW, maxReview: MAX_REVIEW })
      if (shuffle) queue = shuffled(queue)
      const built = buildSession(queue, deck)
      setSteps(built)
      setI(0)
      setPhase('answer')
      setPicked(null)
      setInput('')
      setChosen([])
      setMatch({ sel: null, done: [], wrong: [] })
      setStats({ correct: 0, attempts: 0, combo: 0, maxCombo: 0 })
      spokenRef.current = -1
      setStatus(built.length ? 'ready' : 'empty')
    } catch (error) {
      setErrorMessage(error?.message || '加载背词数据失败。')
      setStatus('error')
    }
    return undefined
  }, [user, tag, shuffle])

  useEffect(() => {
    if (user) load()
  }, [user, load])

  // record verdict (combo/score) and persist the SRS state for card steps
  const record = useCallback(
    (ok, step) => {
      tone(ok)
      setLastCorrect(ok)
      setStats((s) => {
        const combo = ok ? s.combo + 1 : 0
        return {
          correct: s.correct + (ok ? 1 : 0),
          attempts: s.attempts + 1,
          combo,
          maxCombo: Math.max(s.maxCombo, combo),
        }
      })
      if (step?.kind === 'card' && user) {
        const now = new Date().toISOString()
        const next = gradeReviewState(
          { ...step.state, user_id: user.id, word_id: step.word.id },
          ok ? REVIEW_RESULT.correct : REVIEW_RESULT.wrong,
          now,
        )
        saveReviewState(next).catch(() => {})
      }
    },
    [tone, user],
  )

  const choose = useCallback(
    (opt) => {
      if (phase !== 'answer' || !current) return
      setPicked(opt)
      setPhase('feedback')
      record(gradeExercise(current.exercise, opt), current)
    },
    [phase, current, record],
  )

  const submitSpelling = useCallback(() => {
    if (phase !== 'answer' || !current) return
    setPhase('feedback')
    record(gradeExercise(current.exercise, input), current)
  }, [phase, current, input, record])

  const submitBuild = useCallback(() => {
    if (phase !== 'answer' || !current) return
    const map = Object.fromEntries(current.exercise.bank.map((t) => [t.id, t.w]))
    const words = chosen.map((id) => map[id])
    setPhase('feedback')
    record(gradeExercise(current.exercise, words), current)
  }, [phase, current, chosen, record])

  const tapTile = useCallback((id) => {
    setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))
  }, [])

  const tapMatch = useCallback(
    (side, id) => {
      if (phase !== 'answer' || !current) return
      const m = match
      if (m.done.includes(id)) return
      if (!m.sel) { setMatch({ ...m, sel: { side, id }, wrong: [] }); return }
      if (m.sel.side === side) { setMatch({ ...m, sel: { side, id } }); return }
      if (m.sel.id === id) {
        // correct pair — keep side effects OUT of the state updater
        const done = [...m.done, id]
        setMatch({ sel: null, done, wrong: [] })
        if (done.length >= current.exercise.cards.length) {
          setPhase('feedback')
          record(true, current)
        }
        return
      }
      // mismatch — flash both, then clear
      setMatch({ ...m, sel: null, wrong: [`${m.sel.side}${m.sel.id}`, `${side}${id}`] })
      setTimeout(() => setMatch((mm) => ({ ...mm, wrong: [] })), 380)
    },
    [phase, current, match, record],
  )

  const next = useCallback(() => {
    const ni = i + 1
    try { window.speechSynthesis && window.speechSynthesis.cancel() } catch { /* ignore */ }
    if (ni >= steps.length) {
      setStatus('done')
      return
    }
    setI(ni)
    setPhase('answer')
    setPicked(null)
    setInput('')
    setChosen([])
    setMatch({ sel: null, done: [], wrong: [] })
  }, [i, steps.length])

  // speak the listen prompt when its step appears; autofocus the spelling input
  useEffect(() => {
    if (status !== 'ready' || !current) return
    if (current.exercise?.type === EXERCISE_TYPES.listen && phase === 'answer' && spokenRef.current !== i) {
      spokenRef.current = i
      speak(current.exercise.audioText)
    }
    if (current.exercise?.type === EXERCISE_TYPES.spelling && phase === 'answer') {
      inputRef.current?.focus()
    }
  }, [status, current, phase, i, speak])

  // keyboard: 1–4 pick options, Enter submits/advances
  useEffect(() => {
    if (status !== 'ready') return undefined
    const onKey = (event) => {
      const tagName = event.target?.tagName
      const inField = tagName === 'INPUT' || tagName === 'TEXTAREA'
      if (phase === 'feedback') {
        if (event.key === 'Enter' || event.code === 'Space') {
          if (inField && event.key !== 'Enter') return
          event.preventDefault()
          next()
        }
        return
      }
      const ex = current?.exercise
      if (!ex) return
      if ((ex.type === EXERCISE_TYPES.recognition || ex.type === EXERCISE_TYPES.cloze || ex.type === EXERCISE_TYPES.listen) && !inField) {
        const n = Number(event.key)
        if (n >= 1 && n <= ex.options.length) {
          event.preventDefault()
          choose(ex.options[n - 1])
        }
      } else if (ex.type === EXERCISE_TYPES.spelling && event.key === 'Enter') {
        event.preventDefault()
        submitSpelling()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [status, phase, current, choose, submitSpelling, next])

  // ── export / import progress ──
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
        if (mode === 'compat') setImportMsg('数据表还没建立,无法导入。')
        else if (mode === 'disabled') setImportMsg('Supabase 未配置,无法导入。')
        else {
          setImportMsg(`导入完成:写入 ${count} 条,跳过 ${report.rejected.length} 条无效行。`)
          await load()
        }
      } catch (error) {
        setImportMsg(`导入失败:${error?.message || error}`)
      } finally {
        event.target.value = ''
      }
    },
    [user, load],
  )

  const showControls = user && (status === 'ready' || status === 'empty' || status === 'done')

  // ── render helpers ──
  const ex = current?.exercise
  const fb = phase === 'feedback'

  function optionMark(opt) {
    if (!fb) return { color: 'inherit', mark: '' }
    if (opt === ex.answer) return { color: 'var(--ok)', mark: '✓', tint: 'ok' }
    if (opt === picked) return { color: 'var(--accent)', mark: '✗', tint: 'no', strike: true }
    return { color: 'var(--muted)', mark: '' }
  }

  function renderChoice() {
    const prompt = ex.type === EXERCISE_TYPES.cloze
      ? ex.sentence
      : ex.type === EXERCISE_TYPES.listen
        ? null
        : ex.prompt
    return (
      <>
        {ex.type === EXERCISE_TYPES.listen ? (
          <button type="button" className="text-button vocab-replay" onClick={() => speak(ex.audioText)}>
            ▶ 再听一次 · écouter
          </button>
        ) : (
          <p className="vocab-word" lang={ex.type === EXERCISE_TYPES.cloze ? 'fr' : undefined}>{prompt}</p>
        )}
        <ul className="vocab-options">
          {ex.options.map((opt, idx) => {
            const m = optionMark(opt)
            return (
              <li key={opt}>
                <button
                  type="button"
                  className={`vocab-option${m.tint ? ` is-${m.tint}` : ''}`}
                  onClick={() => choose(opt)}
                  disabled={fb}
                  style={{ color: m.color, textDecoration: m.strike ? 'line-through' : 'none' }}
                  lang={ex.type === EXERCISE_TYPES.recognition ? undefined : 'fr'}
                >
                  <span className="vocab-option-key" aria-hidden="true">{idx + 1}</span>
                  <span className="vocab-option-text">{opt}</span>
                  {m.mark ? <span className="vocab-option-mark">{m.mark}</span> : null}
                </button>
              </li>
            )
          })}
        </ul>
      </>
    )
  }

  function renderSpelling() {
    return (
      <>
        <p className="vocab-word">{ex.prompt}</p>
        <p className="daily-entry-meta vocab-gender">拼出对应的法语词 · écris en français</p>
        <input
          ref={inputRef}
          className="vocab-input"
          lang="fr"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submitSpelling() }}
          disabled={fb}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="法语拼写输入"
        />
        {!fb ? (
          <div className="editorial-actions vocab-grade">
            <button type="button" className="text-button" onClick={submitSpelling}>提交 <span className="vocab-key">回车</span></button>
          </div>
        ) : null}
      </>
    )
  }

  function renderBuild() {
    const map = Object.fromEntries(ex.bank.map((t) => [t.id, t.w]))
    return (
      <>
        <p className="daily-entry-meta vocab-gender">把词块拼成正确句子 · reconstruis la phrase</p>
        <p className="vocab-build-line" lang="fr">
          {chosen.length
            ? chosen.map((id) => (
              <button key={id} type="button" className="vocab-tile is-chosen" onClick={() => tapTile(id)} disabled={fb}>{map[id]}</button>
            ))
            : <span className="vocab-build-placeholder">点词块组句…</span>}
        </p>
        <p className="vocab-build-bank" lang="fr">
          {ex.bank.filter((t) => !chosen.includes(t.id)).map((t) => (
            <button key={t.id} type="button" className="vocab-tile" onClick={() => tapTile(t.id)} disabled={fb}>{t.w}</button>
          ))}
        </p>
        {!fb ? (
          <div className="editorial-actions vocab-grade">
            <button type="button" className="text-button" onClick={submitBuild} disabled={!chosen.length}>提交</button>
          </div>
        ) : null}
      </>
    )
  }

  function renderMatch() {
    const flash = (side, id) => match.wrong.includes(`${side}${id}`)
    return (
      <>
        <p className="daily-entry-meta vocab-gender">点一对 法语 ↔ 中文 · associe</p>
        <div className="vocab-match">
          <div className="vocab-match-col">
            {ex.left.map((c) => (
              <button
                key={c.id}
                type="button"
                lang="fr"
                className={`vocab-tile${match.done.includes(c.id) ? ' is-done' : ''}${match.sel?.side === 'L' && match.sel?.id === c.id ? ' is-sel' : ''}${flash('L', c.id) ? ' is-wrong' : ''}`}
                onClick={() => tapMatch('L', c.id)}
                disabled={match.done.includes(c.id)}
              >{c.text}</button>
            ))}
          </div>
          <div className="vocab-match-col">
            {ex.right.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`vocab-tile${match.done.includes(c.id) ? ' is-done' : ''}${match.sel?.side === 'R' && match.sel?.id === c.id ? ' is-sel' : ''}${flash('R', c.id) ? ' is-wrong' : ''}`}
                onClick={() => tapMatch('R', c.id)}
                disabled={match.done.includes(c.id)}
              >{c.text}</button>
            ))}
          </div>
        </div>
      </>
    )
  }

  function renderFeedback() {
    if (!fb || !ex) return null
    if (ex.type === EXERCISE_TYPES.match) {
      return <p className="vocab-fb is-ok">配对完成 ✓</p>
    }
    // recognition answer is the Chinese gloss; build answer is the full
    // sentence; the rest (cloze/listen/spelling) resolve to the French headword.
    const correct = (ex.type === EXERCISE_TYPES.recognition || ex.type === EXERCISE_TYPES.build)
      ? ex.answer
      : (current.word?.french || ex.answer)
    const gloss = ex.type === EXERCISE_TYPES.build ? null : current.word?.chinese
    return (
      <div className={`vocab-fb ${lastCorrect ? 'is-ok' : 'is-no'}`}>
        <p className="vocab-fb-verdict">{lastCorrect ? '答对 ✓ Juste' : '答错 ✗ Faux'}</p>
        {!lastCorrect ? (
          <p className="vocab-fb-answer">正确答案 <span lang="fr">{correct}</span>{gloss ? <span className="vocab-fb-gloss"> · {gloss}</span> : null}</p>
        ) : null}
      </div>
    )
  }

  return (
    <main className="page page-narrow vocab-page">
      <PageHeader
        kicker="Carnet de vocabulaire · 法语背词"
        title="间隔重复背词器"
        summary="多题型轮换 · 艾宾浩斯阶梯调度 · 进度按你的账号保存。"
        meta={[`词库 ${VALID_DECK.length} 条`, '1–4 选项 · 回车提交']}
      />

      {user && status === 'ready' && current ? (
        <div
          className="vocab-progress"
          role="progressbar"
          aria-label="本轮进度"
          aria-valuenow={i + 1}
          aria-valuemin={1}
          aria-valuemax={steps.length}
        >
          <span className="vocab-progress-label">{stats.combo >= 2 ? `连击 ${stats.combo}` : '本轮'}</span>
          <span className="vocab-progress-track" aria-hidden="true">
            <span className="vocab-progress-fill" style={{ width: `${Math.round(((i + 1) / steps.length) * 100)}%` }} />
          </span>
          <span className="vocab-progress-count">{i + 1} / {steps.length}</span>
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
          <p>本轮完成 — 答对 <span style={{ color: 'var(--ok)' }}>{stats.correct}</span> / {stats.attempts}，最高连击 <span style={{ color: 'var(--accent)' }}>{stats.maxCombo}</span>。</p>
          <p className="editorial-actions"><button type="button" className="text-button" onClick={load}>再来一轮</button></p>
        </div>
      ) : null}

      {user && status === 'ready' && current ? (
        <div className="vocab-card">
          {current.kind !== 'match' ? (
            <p className="daily-entry-kicker vocab-card-kicker">
              {ex.type === EXERCISE_TYPES.recognition ? '认词 · reconnaître'
                : ex.type === EXERCISE_TYPES.cloze ? '填空 · compléter'
                  : ex.type === EXERCISE_TYPES.listen ? '听写 · écouter'
                    : ex.type === EXERCISE_TYPES.spelling ? '拼写 · épeler'
                      : ex.type === EXERCISE_TYPES.build ? '拼句 · reconstruire'
                        : ''}{current.word?.tag ? ` · ${current.word.tag}` : ''}
            </p>
          ) : (
            <p className="daily-entry-kicker vocab-card-kicker">配对 · associer</p>
          )}

          {ex.type === EXERCISE_TYPES.match ? renderMatch()
            : ex.type === EXERCISE_TYPES.spelling ? renderSpelling()
              : ex.type === EXERCISE_TYPES.build ? renderBuild()
                : renderChoice()}

          {renderFeedback()}

          {fb ? (
            <div className="editorial-actions vocab-grade">
              <button type="button" className="text-button" onClick={next}>继续 <span className="vocab-key">回车</span></button>
            </div>
          ) : null}
        </div>
      ) : null}

      {showControls ? (
        <footer className="vocab-footer">
          <div className="editorial-actions tabs vocab-tags">
            <span className="theorem-explanation-lang" aria-hidden="true">标签</span>
            {DECK_TAGS.map((t) => (
              <button key={t} type="button" onClick={() => setTag(t)} aria-pressed={tag === t} className={`text-button${tag === t ? '' : ' subtle'}`}>
                {t === 'all' ? '全部' : t}
              </button>
            ))}
            <span className="vocab-dot" aria-hidden="true">·</span>
            <button type="button" className="text-button subtle" onClick={() => setShuffle((s) => !s)} aria-pressed={shuffle}>乱序 {shuffle ? '开' : '关'}</button>
            <button type="button" className="text-button subtle" onClick={handleExport}>导出</button>
            <button type="button" className="text-button subtle" onClick={() => fileInputRef.current?.click()}>导入</button>
            <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleImportFile} style={{ display: 'none' }} />
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
