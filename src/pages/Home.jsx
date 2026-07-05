import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useWorld } from '../context/useWorld'
import { dailyTheoremNotes } from '../data/dailyTheoremNotes.generated'
import { dailyFrenchPhrases } from '../data/siteContent'
import { explanationsCredit, theoremExplanations } from '../data/theoremExplanations.generated'

const DAY_IN_MS = 24 * 60 * 60 * 1000
const ROTATION_START_DAY = Math.floor(Date.UTC(2025, 8, 1) / DAY_IN_MS)

function getShanghaiDate(reference = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .formatToParts(reference)
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, Number(value)]),
  )
  const serial = Math.floor(Date.UTC(parts.year, parts.month - 1, parts.day) / DAY_IN_MS)

  return {
    ...parts,
    serial,
    jour: serial - ROTATION_START_DAY + 1,
    numeric: `${String(parts.day).padStart(2, '0')}.${String(parts.month).padStart(2, '0')}.${parts.year}`,
    french: new Intl.DateTimeFormat('fr-FR', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(reference),
  }
}

function rotatingIndex(serial, length) {
  if (!length) return 0
  const offset = serial - ROTATION_START_DAY
  return ((offset % length) + length) % length
}

function Formula({ theorem, className = '' }) {
  return (
    <div
      className={['daily-formula', className].filter(Boolean).join(' ')}
      dangerouslySetInnerHTML={{ __html: theorem.displayHtml || theorem.fallback }}
    />
  )
}

function Proof({ theorem, proof }) {
  if (!proof) return null

  return (
    <details className="daily-proof">
      <summary>Voir la preuve · 查看证明思路 →</summary>
      <div className="daily-proof-body">
        <div>
          <p className="daily-proof-lang">中文</p>
          <ol>
            {(Array.isArray(proof.zh) ? proof.zh : [proof.zh]).map((step, index) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: step }} />
            ))}
          </ol>
        </div>
        <div lang="fr">
          <p className="daily-proof-lang">Français</p>
          <ol>
            {(Array.isArray(proof.fr) ? proof.fr : [proof.fr]).map((step, index) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: step }} />
            ))}
          </ol>
        </div>
        <p className="daily-proof-credit">
          Bilingual reasoning by {explanationsCredit.generator} · {theorem.title}
        </p>
      </div>
    </details>
  )
}

function CarnetPage({ date, theorem, meditation, proof }) {
  return (
    <article className="daily-page daily-carnet">
      <header className="daily-running-head">
        <span>Carnet de classe · revue bilingue</span>
        <span>Édition du {date.french} · jour {date.jour}</span>
      </header>
      <div className="daily-double-rule" aria-hidden="true" />

      <section className="daily-carnet-theorem">
        <p className="daily-kicker">Page du jour · 今日一页 — rappel mathématique</p>
        <h1>{theorem.title}</h1>
        <p className="daily-statement">{theorem.prelude}</p>
        <span className="daily-short-rule" aria-hidden="true" />
        <Formula theorem={theorem} />
        <span className="daily-short-rule" aria-hidden="true" />
        <p className="daily-note">
          <i>批:</i>{theorem.note}
        </p>
        <Proof theorem={theorem} proof={proof} />
        <p className="daily-recueil-link">
          <Link to="/recueil">Recueil des théorèmes →</Link>
        </p>
      </section>

      <section className="daily-meditation">
        <p className="daily-kicker">Méditation du jour · 冥想</p>
        <blockquote lang="fr">{meditation.text}</blockquote>
        <p>{meditation.note}</p>
      </section>

      <footer className="daily-folio">
        <span>Pour la classe · MMXXVI</span>
        <span>N°02 · Le Carnet</span>
      </footer>
    </article>
  )
}

function PlanPage({ date, theorem, meditation, proof }) {
  const titleParts = theorem.title.toUpperCase().split(/-(?=[A-ZÀ-ÖØ-Þ])/)

  return (
    <article className="daily-page daily-plan">
      <span className="daily-plan-watermark" aria-hidden="true">ℝ</span>
      <header className="daily-running-head">
        <span>Carnet de classe · 中国人民大学 中法学院</span>
        <span>Planche du jour · {date.numeric} · jour {date.jour}</span>
      </header>
      <div className="daily-plan-rule" aria-hidden="true" />

      <section className="daily-plan-theorem">
        <p className="daily-kicker">Page du jour — rappel mathématique · 每日定理</p>
        <h1>
          {titleParts.map((part, index) => (
            <span key={`${part}-${index}`}>{part}{index < titleParts.length - 1 ? '–' : ''}</span>
          ))}
        </h1>
        <p className="daily-statement">{theorem.prelude}</p>
        <div className="daily-plan-accent" aria-hidden="true" />
        <div className="daily-plan-formula">
          <div><span>Fig. énoncé</span><span>KaTeX</span></div>
          <Formula theorem={theorem} />
        </div>
        <Proof theorem={theorem} proof={proof} />
      </section>

      <footer className="daily-plan-footer">
        <span>N°01 · Plan ℝ — pour la classe</span>
        <div>
          <blockquote lang="fr">« {meditation.text} »</blockquote>
          <p>méditation du jour · {meditation.note}</p>
        </div>
      </footer>
    </article>
  )
}

function LimitePage({ date, theorem, meditation, proof }) {
  const [iteration, setIteration] = useState(1)
  const [typedLength, setTypedLength] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIteration((current) => (current >= 40 ? 1 : current + 1))
    }, 650)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTypedLength((current) => (current >= meditation.text.length + 45 ? 0 : current + 1))
    }, 65)
    return () => window.clearInterval(interval)
  }, [meditation.text])

  const intervalLength = 2 / (2 ** iteration)
  const displayLength = iteration <= 20
    ? intervalLength.toFixed(Math.min(12, iteration + 2))
    : intervalLength.toExponential(6)
  const barWidth = Math.max(1.5, 100 / (2 ** (iteration - 1)))
  const titleParts = theorem.title.toUpperCase().split(/-(?=[A-ZÀ-ÖØ-Þ])/)
  const typedMeditation = meditation.text.slice(0, Math.min(typedLength, meditation.text.length))
  const typingFinished = typedLength >= meditation.text.length

  return (
    <article className="daily-page daily-limite">
      <header className="daily-running-head">
        <strong>Carnet de classe</strong>
        <span>page du jour · signal {date.numeric} · jour {date.jour}</span>
      </header>
      <div className="daily-limite-rule" aria-hidden="true" />

      <div className="daily-limite-grid">
        <section className="daily-limite-theorem">
          <p className="daily-kicker">Rappel mathématique · 每日定理</p>
          <h1>
            {titleParts.map((part, index) => (
              <span key={`${part}-${index}`}>{part}{index < titleParts.length - 1 ? '–' : ''}</span>
            ))}
            <i aria-hidden="true" />
          </h1>
          <p className="daily-statement">{theorem.prelude}</p>
          <Formula theorem={theorem} />
          <Proof theorem={theorem} proof={proof} />
        </section>

        <aside className="daily-instruments">
          <section className="daily-instrument">
            <header><span>Instrument · dichotomie</span><span>ℓ<sub>n</sub> = 2M / 2<sup>n</sup></span></header>
            <div>
              <p className="daily-instrument-index"><span>n = {iteration}</span><span>→ 0</span></p>
              <output>{displayLength}</output>
              <div className="daily-convergence" aria-hidden="true">
                <span style={{ width: `${barWidth}%` }} />
              </div>
              <p>区间套每步减半,收缩向唯一一点 — 定理的引擎。</p>
            </div>
          </section>

          <section className="daily-instrument daily-typewriter">
            <p className="daily-kicker">Méditation du jour · 冥想</p>
            <p lang="fr">
              {typedMeditation}<span className="daily-caret" aria-hidden="true" />
            </p>
            <p className={typingFinished ? 'is-visible' : ''}>{meditation.note}</p>
          </section>
        </aside>
      </div>

      <footer className="daily-folio">
        <span>N°03 · Limite — l’instrument vivant</span>
        <span>xₙ → x</span>
      </footer>
    </article>
  )
}

export default function Home() {
  const { world } = useWorld()
  const date = useMemo(() => getShanghaiDate(), [])
  const theorem = dailyTheoremNotes[rotatingIndex(date.serial, dailyTheoremNotes.length)]
  const meditation = dailyFrenchPhrases[rotatingIndex(date.serial, dailyFrenchPhrases.length)]
  const proof = theoremExplanations[theorem.title]
  const props = { date, theorem, meditation, proof }

  if (world === 'plan') return <PlanPage {...props} />
  if (world === 'limite') return <LimitePage {...props} />
  return <CarnetPage {...props} />
}
