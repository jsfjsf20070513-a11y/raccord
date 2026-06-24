import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
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
// 法语发音:USE_WORKER_VOICE 为 true 时优先走同域 Worker(真人音 + 边缘缓存),
// 失败回退浏览器 TTS。当前 ElevenLabs 免费层无法用法语库声音(George 是英音),
// 故暂时直接用浏览器法语 TTS(免费、法语、单声音);接好 Google TTS 真人法语音后
// 把开关置 true 即可切回 Worker 路径。
const SPEAK_ENDPOINT = 'https://rucmathclass.com/api/speak'
const USE_WORKER_VOICE = false

const VALID_DECK = cleanFrenchDeck(frenchVocabulary).valid
const DECK_TAGS = ['all', ...Array.from(new Set(VALID_DECK.map((w) => w.tag).filter(Boolean)))]
// CEFR ladder A1→C2; only the levels actually present in the deck are offered.
const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const DECK_LEVELS = ['all', ...LEVEL_ORDER.filter((l) => VALID_DECK.some((w) => w.level === l))]

// Filter the deck on both axes the learner controls: CEFR level and theme tag.
function selectDeck(level, tag) {
  return VALID_DECK.filter(
    (w) => (level === 'all' || w.level === level) && (tag === 'all' || w.tag === tag),
  )
}

function shuffled(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Short grammatical label for the prompt line, e.g. « n.f. » / « v. » / « adj. ».
function posLabel(word) {
  if (!word) return ''
  if (word.pos === 'verb') return 'v.'
  if (word.pos === 'adjective') return 'adj.'
  if (word.pos === 'noun') return word.gender === 'm' ? 'n.m.' : word.gender === 'f' ? 'n.f.' : 'n.'
  return ''
}

// Long italic part-of-speech for the study card, in French.
function posLong(word) {
  if (!word) return ''
  if (word.pos === 'verb') return 'verbe'
  if (word.pos === 'adjective') return 'adjectif'
  if (word.pos === 'adverb') return 'adverbe'
  if (word.pos === 'noun') return word.gender === 'm' ? 'nom masc.' : word.gender === 'f' ? 'nom fém.' : 'nom'
  return ''
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
    let type = TYPE_ROTATION[idx % TYPE_ROTATION.length]
    // 「词块拼句」要求把例句译成法语,必须有例句中文(exampleZh)做题干;没有就
    // 换成拼写题,绝不出"考拼句却不给中文"的残题。
    if (type === EXERCISE_TYPES.build && !item.word.exampleZh) {
      type = EXERCISE_TYPES.spelling
    }
    steps.push({ kind: 'card', word: item.word, state: item.state, exercise: buildExercise(item.word, deck, { type }) })
  })
  return steps
}

export default function Vocabulary() {
  const { user } = useAuth()
  const [status, setStatus] = useState('loading') // loading|study|ready|disabled|compat|empty|error|done
  const [studyList, setStudyList] = useState([]) // {word, state} — preview deck shown before the test
  const [studyIdx, setStudyIdx] = useState(0)
  const [steps, setSteps] = useState([])
  const [i, setI] = useState(0)
  const [phase, setPhase] = useState('answer') // answer|feedback
  const [lastCorrect, setLastCorrect] = useState(null)
  const [picked, setPicked] = useState(null)
  const [input, setInput] = useState('')
  const [chosen, setChosen] = useState([]) // build: ordered tile ids
  const [match, setMatch] = useState({ sel: null, done: [], wrong: [] })
  const [stats, setStats] = useState({ correct: 0, attempts: 0, combo: 0, maxCombo: 0 })
  const [wrong, setWrong] = useState([]) // {word, state} missed this session — feeds the review list + 只练错词
  const [deckStats, setDeckStats] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [tag, setTag] = useState('all')
  const [level, setLevel] = useState('all')
  const [shuffle, setShuffle] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const fileInputRef = useRef(null)
  const inputRef = useRef(null)
  const audioRef = useRef(null)
  const voiceRef = useRef(null)
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

  const browserTTS = useCallback((text) => {
    try {
      const synth = window.speechSynthesis
      if (!synth || !text) return
      synth.cancel()
      let done = false
      // Speak with a FRENCH voice. getVoices() is often empty on first call until
      // the engine loads — wait once for `voiceschanged`, with a timed safety. The
      // `done` flag guarantees exactly one utterance (never English + French double).
      const speakWith = () => {
        if (done) return
        done = true
        const u = new SpeechSynthesisUtterance(text)
        u.lang = 'fr-FR'
        u.rate = 0.9
        const fr = (synth.getVoices() || []).find((v) => /fr/i.test(v.lang))
        if (fr) u.voice = fr
        synth.speak(u)
      }
      if ((synth.getVoices() || []).length) {
        speakWith()
      } else {
        synth.addEventListener('voiceschanged', speakWith, { once: true })
        setTimeout(speakWith, 300)
      }
    } catch {
      // speech is optional
    }
  }, [])

  // Prefer the real voice via the Worker; fall back to browser TTS if the audio
  // can't load. `fallbackOnce` guards so the fallback fires AT MOST ONCE — both
  // `onerror` and the play() rejection used to fire it, causing a double voice.
  const speak = useCallback((text) => {
    if (!text) return
    try { window.speechSynthesis && window.speechSynthesis.cancel() } catch { /* ignore */ }
    // 暂走浏览器法语 TTS(见 USE_WORKER_VOICE 注释)。
    if (!USE_WORKER_VOICE) {
      browserTTS(text)
      return
    }
    let usedFallback = false
    const fallbackOnce = () => {
      if (usedFallback) return
      usedFallback = true
      browserTTS(text)
    }
    try {
      const a = voiceRef.current || (voiceRef.current = new Audio())
      a.onerror = fallbackOnce
      a.src = `${SPEAK_ENDPOINT}?text=${encodeURIComponent(text.slice(0, 160))}`
      const p = a.play()
      if (p && typeof p.catch === 'function') p.catch(fallbackOnce)
    } catch {
      fallbackOnce()
    }
  }, [browserTTS])

  const load = useCallback(async () => {
    if (!user) return
    setStatus('loading')
    setErrorMessage('')
    try {
      const { mode, states } = await fetchReviewStateMap(user.id)
      if (mode === 'disabled') return setStatus('disabled')
      if (mode === 'compat') return setStatus('compat')
      const now = new Date().toISOString()
      const deck = selectDeck(level, tag)
      setDeckStats({
        ...computeDeckStats({ deck, stateMap: states, now }),
        streak: computeStudyStreak(Object.values(states), now),
      })
      let queue = buildStudyQueue({ deck, stateMap: states, now, maxNew: MAX_NEW, maxReview: MAX_REVIEW })
      if (shuffle) queue = shuffled(queue)
      const built = buildSession(queue, deck)
      setSteps(built)
      setStudyList(queue.map((q) => ({ word: q.word, state: q.state })))
      setStudyIdx(0)
      setI(0)
      setPhase('answer')
      setPicked(null)
      setInput('')
      setChosen([])
      setMatch({ sel: null, done: [], wrong: [] })
      setStats({ correct: 0, attempts: 0, combo: 0, maxCombo: 0 })
      setWrong([])
      spokenRef.current = -1
      // Preview new words first (先学一遍); the test begins after study or skip.
      setStatus(built.length ? (queue.length ? 'study' : 'ready') : 'empty')
    } catch (error) {
      setErrorMessage(error?.message || '加载背词数据失败。')
      setStatus('error')
    }
    return undefined
  }, [user, tag, level, shuffle])

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
      if (!ok && step?.kind === 'card' && step.word) {
        setWrong((w) => (w.some((x) => x.word.id === step.word.id) ? w : [...w, { word: step.word, state: step.state }]))
      }
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

  // Re-drill only the words missed this session (design: « 只练错词 »).
  const retryWrong = useCallback(() => {
    if (!wrong.length) return
    const deck = selectDeck(level, tag)
    const built = buildSession(wrong.map((x) => ({ word: x.word, state: x.state })), deck)
    setSteps(built)
    setI(0)
    setPhase('answer')
    setPicked(null)
    setInput('')
    setChosen([])
    setMatch({ sel: null, done: [], wrong: [] })
    setStats({ correct: 0, attempts: 0, combo: 0, maxCombo: 0 })
    setWrong([])
    spokenRef.current = -1
    setStatus('ready')
  }, [wrong, tag, level])

  // Study (preview) navigation: step through the deck, then begin the test.
  const studyNext = useCallback(() => {
    setStudyIdx((idx) => {
      if (idx + 1 >= studyList.length) { setStatus('ready'); return idx }
      return idx + 1
    })
  }, [studyList.length])
  const skipStudy = useCallback(() => setStatus('ready'), [])

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

  // study preview: Enter / Space advances to the next word (or the test)
  useEffect(() => {
    if (status !== 'study') return undefined
    const onKey = (event) => {
      if (event.key === 'Enter' || event.code === 'Space') {
        event.preventDefault()
        studyNext()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [status, studyNext])

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

  // controls (tags / shuffle / import-export / stats) sit on the idle + done
  // screens only — never during an active lesson, per the design's clean flow.
  const showControls = user && (status === 'empty' || status === 'done')

  // ── render helpers ──
  const ex = current?.exercise
  const fb = phase === 'feedback'
  const acc = stats.attempts ? `${Math.round((stats.correct / stats.attempts) * 100)}%` : '—'

  function renderOptions() {
    return (
      <ul className="vocab-options">
        {ex.options.map((opt) => {
          let mark = ''
          let tint = ''
          let strike = false
          if (fb) {
            if (opt === ex.answer) { mark = '✓'; tint = 'ok' }
            else if (opt === picked) { mark = '✗'; tint = 'no'; strike = true }
            else { tint = 'dim' }
          }
          return (
            <li key={opt}>
              <button
                type="button"
                className={`vocab-option${tint ? ` is-${tint}` : ''}`}
                onClick={() => choose(opt)}
                disabled={fb}
                style={strike ? { textDecoration: 'line-through' } : undefined}
                lang={ex.type === EXERCISE_TYPES.recognition ? undefined : 'fr'}
              >
                <span className="vocab-option-text">{opt}</span>
                {mark ? <span className="vocab-option-mark">{mark}</span> : null}
              </button>
            </li>
          )
        })}
      </ul>
    )
  }

  function renderStage() {
    switch (ex.type) {
      case EXERCISE_TYPES.match: {
        const flash = (side, id) => match.wrong.includes(`${side}${id}`)
        const tileClass = (side, c) => `vocab-tile${match.done.includes(c.id) ? ' is-done' : ''}${match.sel?.side === side && match.sel?.id === c.id ? ' is-sel' : ''}${flash(side, c.id) ? ' is-wrong' : ''}`
        return (
          <>
            <p className="vocab-prompt">Associez · 配对</p>
            <p className="vocab-prompt-sub">点法语,再点对应的中文。</p>
            <div className="vocab-match">
              <div className="vocab-match-col">
                {ex.left.map((c) => (
                  <button key={c.id} type="button" lang="fr" className={tileClass('L', c)} onClick={() => tapMatch('L', c.id)} disabled={match.done.includes(c.id)}>{c.text}</button>
                ))}
              </div>
              <div className="vocab-match-col">
                {ex.right.map((c) => (
                  <button key={c.id} type="button" className={tileClass('R', c)} onClick={() => tapMatch('R', c.id)} disabled={match.done.includes(c.id)}>{c.text}</button>
                ))}
              </div>
            </div>
          </>
        )
      }
      case EXERCISE_TYPES.recognition:
        return (
          <>
            <p className="vocab-prompt">Quel est le sens ? · 选择词义</p>
            <p className="vocab-word" lang="fr">{ex.prompt}</p>
            {renderOptions()}
          </>
        )
      case EXERCISE_TYPES.cloze:
        return (
          <>
            <p className="vocab-prompt">Complétez la phrase · 例句填空</p>
            <p className="vocab-sentence" lang="fr">{ex.sentence}</p>
            {renderOptions()}
          </>
        )
      case EXERCISE_TYPES.listen:
        return (
          <>
            <p className="vocab-prompt">Écoutez et choisissez · 听写</p>
            <button type="button" className="vocab-replay" onClick={() => speak(ex.audioText)}>
              ▶ <span className="vocab-replay-label">再听 · réécouter</span>
            </button>
            {renderOptions()}
          </>
        )
      case EXERCISE_TYPES.spelling:
        return (
          <>
            <p className="vocab-prompt">
              Écrivez en français · 拼写
              {posLabel(current.word) ? <span className="vocab-prompt-pos"> · {posLabel(current.word)}</span> : null}
            </p>
            <p className="vocab-cue">{ex.prompt}</p>
            <input
              ref={inputRef}
              className="vocab-input"
              lang="fr"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitSpelling() }}
              disabled={fb}
              placeholder="tapez le mot…"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-label="法语拼写输入"
            />
            {!fb ? (
              <div className="vocab-grade">
                <button type="button" className="vocab-verify" onClick={submitSpelling}>Vérifier <span className="vocab-key">↵</span></button>
              </div>
            ) : null}
          </>
        )
      case EXERCISE_TYPES.build: {
        const map = Object.fromEntries(ex.bank.map((t) => [t.id, t.w]))
        return (
          <>
            <p className="vocab-prompt">Traduisez en français · 把下面这句话拼成法语</p>
            <p className="vocab-cue vocab-cue-sm">{current.word?.exampleZh}</p>
            <div className="vocab-build-line" lang="fr">
              {chosen.length
                ? chosen.map((id) => (
                  <button key={id} type="button" className="vocab-tile is-chosen" onClick={() => tapTile(id)} disabled={fb}>{map[id]}</button>
                ))
                : <span className="vocab-build-placeholder">点词块组句…</span>}
            </div>
            <div className="vocab-build-bank" lang="fr">
              {ex.bank.filter((t) => !chosen.includes(t.id)).map((t) => (
                <button key={t.id} type="button" className="vocab-tile" onClick={() => tapTile(t.id)} disabled={fb}>{t.w}</button>
              ))}
            </div>
            {!fb ? (
              <div className="vocab-grade">
                <button type="button" className="vocab-verify" onClick={submitBuild} disabled={!chosen.length}>Vérifier <span className="vocab-key">↵</span></button>
              </div>
            ) : null}
          </>
        )
      }
      default:
        return null
    }
  }

  function renderFeedback() {
    if (!fb || !ex) return null
    const isMatch = ex.type === EXERCISE_TYPES.match
    const ok = isMatch || lastCorrect
    // recognition + build resolve to the exercise answer; the rest reveal the French headword.
    const correct = (ex.type === EXERCISE_TYPES.recognition || ex.type === EXERCISE_TYPES.build)
      ? ex.answer
      : (current.word?.french || ex.answer)
    const gloss = ex.type === EXERCISE_TYPES.build ? current.word?.exampleZh : current.word?.chinese
    return (
      <div className={`vocab-fb ${ok ? 'is-ok' : 'is-no'}`}>
        <p className="vocab-fb-verdict">{isMatch ? '配对完成 ✓' : ok ? '答对 ✓ Juste' : '答错 ✗ Faux'}</p>
        {!ok ? (
          <p className="vocab-fb-answer">正确答案 <span lang="fr">{correct}</span>{gloss ? <span className="vocab-fb-gloss"> · {gloss}</span> : null}</p>
        ) : null}
        {!isMatch && current.word?.note ? <p className="vocab-fb-note">💡 {current.word.note}</p> : null}
        <div className="vocab-fb-actions">
          <button type="button" className="vocab-next" onClick={next}>
            {i + 1 >= steps.length ? 'Terminer · 结束' : 'Continuer · 继续'} <span className="vocab-next-key">↵</span>
          </button>
        </div>
      </div>
    )
  }

  // CEFR level chips (A1→C2). Selecting a level just flips `level`; the load
  // effect (which depends on `level`) rebuilds the deck — same wiring as tags.
  function renderLevelRow() {
    return (
      <div className="vocab-control-row">
        <span className="vocab-control-label" aria-hidden="true">级别</span>
        {DECK_LEVELS.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLevel(l)}
            aria-pressed={level === l}
            className={`vocab-link-btn${level === l ? ' is-active' : ''}`}
          >
            {l === 'all' ? '全部 A1–C2' : l}
          </button>
        ))}
      </div>
    )
  }

  function renderControls() {
    return (
      <div className="vocab-controls">
        {renderLevelRow()}
        <div className="vocab-control-row">
          <span className="vocab-control-label" aria-hidden="true">标签</span>
          {DECK_TAGS.map((t) => (
            <button key={t} type="button" onClick={() => setTag(t)} aria-pressed={tag === t} className={`vocab-link-btn${tag === t ? ' is-active' : ''}`}>
              {t === 'all' ? '全部' : t}
            </button>
          ))}
          <span className="vocab-dot" aria-hidden="true">·</span>
          <button type="button" className={`vocab-link-btn${shuffle ? ' is-active' : ''}`} onClick={() => setShuffle((s) => !s)} aria-pressed={shuffle}>乱序 {shuffle ? '开' : '关'}</button>
          <button type="button" className="vocab-link-btn" onClick={handleExport}>导出</button>
          <button type="button" className="vocab-link-btn" onClick={() => fileInputRef.current?.click()}>导入</button>
          <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleImportFile} style={{ display: 'none' }} />
        </div>
        {deckStats ? (
          <p className="vocab-control-stats" aria-label="学习进度">
            已掌握 <span>{deckStats.mastered}</span> · 学习中 <span>{deckStats.learning}</span> · 新词 <span>{deckStats.newCount}</span> · 连续 <span>{deckStats.streak}</span> 天
          </p>
        ) : null}
        {importMsg ? <p className="vocab-msg">{importMsg}</p> : null}
      </div>
    )
  }

  return (
    <main className="page-column vocab-page">
      {user && status === 'ready' && current ? (
        <div
          className="vocab-progress"
          role="progressbar"
          aria-label="本轮进度"
          aria-valuenow={i + 1}
          aria-valuemin={1}
          aria-valuemax={steps.length}
        >
          <span className="vocab-progress-track" aria-hidden="true">
            <span className="vocab-progress-fill" style={{ width: `${Math.round(((i + 1) / steps.length) * 100)}%` }} />
          </span>
          <span className="vocab-progress-side">
            {stats.combo >= 2 ? `连击 ×${stats.combo}` : `${i + 1} / ${steps.length}`}
          </span>
        </div>
      ) : null}

      {!user ? (
        <div className="vocab-notice">
          <p>背词进度按账号保存,请先登录。</p>
          <p><Link to="/login" className="vocab-link">前往登录 →</Link></p>
        </div>
      ) : null}

      {user && status === 'loading' ? (
        <div className="vocab-notice"><p>正在加载你的背词进度…</p></div>
      ) : null}

      {user && status === 'disabled' ? (
        <div className="vocab-notice"><p>站点尚未配置 Supabase,背词功能暂不可用。</p></div>
      ) : null}

      {user && status === 'compat' ? (
        <div className="vocab-notice">
          <p>背词数据表还没建立。请在 Supabase 执行 <code>setup_vocabulary.sql</code> 后再来。</p>
        </div>
      ) : null}

      {user && status === 'error' ? (
        <div className="vocab-notice">
          <p>出错了:{errorMessage}</p>
          <p><button type="button" className="vocab-link-btn" onClick={load}>重试</button></p>
        </div>
      ) : null}

      {user && status === 'empty' ? (
        <div className="vocab-notice">
          <p>这个范围今天没有要背的词了。换个标签或明天再来。</p>
        </div>
      ) : null}

      {user && status === 'study' && studyList[studyIdx] ? (() => {
        const sw = studyList[studyIdx].word
        const last = studyIdx + 1 >= studyList.length
        return (
          <div className="vocab-study">
            {renderLevelRow()}
            <div className="vocab-study-head">
              <p className="vocab-prompt">Aperçu · 先学一遍</p>
              <span className="vocab-study-count">{studyIdx + 1} / {studyList.length}</span>
            </div>
            <div className="vocab-study-body">
              <div className="vocab-study-title">
                <h2 lang="fr">{sw.french}</h2>
                {posLong(sw) ? <span className="vocab-study-pos">{posLong(sw)}</span> : null}
                {sw.level ? <span className="vocab-study-tag">{sw.level}</span> : null}
                {sw.tag ? <span className="vocab-study-tag">{sw.tag}</span> : null}
              </div>
              <div className="vocab-study-rule" aria-hidden="true" />
              <p className="vocab-study-zh">{sw.chinese}</p>
              {sw.example ? <p className="vocab-study-example" lang="fr">{sw.example}</p> : null}
              {sw.exampleZh ? <p className="vocab-study-example-zh">{sw.exampleZh}</p> : null}
              {sw.note ? <p className="vocab-study-note">💡 {sw.note}</p> : null}
            </div>
            <div className="vocab-study-actions">
              <button type="button" className="vocab-verify" onClick={studyNext}>
                {last ? '开始测试 · Commencer' : '下一个 · Suivant'} <span className="vocab-key">↵</span>
              </button>
              <button type="button" className="vocab-link-btn" onClick={skipStudy}>跳过预习,直接测试</button>
            </div>
          </div>
        )
      })() : null}

      {user && status === 'ready' && current ? (
        <div className="vocab-stage">
          {renderStage()}
          {renderFeedback()}
        </div>
      ) : null}

      {user && status === 'done' ? (
        <div className="vocab-done">
          <p className="vocab-prompt">Leçon terminée · 本节完成</p>
          <p className="vocab-done-score">答对 {stats.correct} / {stats.attempts} 题</p>
          <p className="vocab-done-meta">正确率 {acc} · 最高连击 ×{stats.maxCombo}</p>
          <div className="vocab-done-rule" aria-hidden="true" />
          {wrong.length ? (
            <>
              <p className="vocab-prompt-sub">需要复习 · à revoir</p>
              <div className="vocab-review">
                {wrong.map(({ word }) => (
                  <div className="vocab-review-row" key={word.id}>
                    <span lang="fr">{word.french}</span>
                    <span className="vocab-review-zh">{word.chinese}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="vocab-prompt-sub">全部答对 —— 漂亮。</p>
          )}
          <div className="vocab-done-actions">
            {wrong.length ? <button type="button" className="vocab-link-btn" onClick={retryWrong}>只练错词</button> : null}
            <button type="button" className="vocab-link-btn" onClick={load}>再来一轮</button>
          </div>
        </div>
      ) : null}

      {showControls ? renderControls() : null}
    </main>
  )
}
