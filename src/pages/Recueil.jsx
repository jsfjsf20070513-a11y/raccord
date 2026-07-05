import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useWorld } from '../context/useWorld'
import { dailyTheoremNotes } from '../data/dailyTheoremNotes.generated'

const DAY_IN_MS = 24 * 60 * 60 * 1000
const ROTATION_START_DAY = Math.floor(Date.UTC(2025, 8, 1) / DAY_IN_MS)

const VOLUMES = [
  {
    roman: 'I',
    title: 'Analyse',
    subtitle: '分析 · 极限、连续与积分',
    indices: [0, 1, 2, 7, 8, 9, 20, 21, 22, 23],
  },
  {
    roman: 'II',
    title: 'Algèbre linéaire',
    subtitle: '线性代数 · 空间、矩阵与分解',
    indices: [3, 4, 10, 11, 12, 13, 14],
  },
  {
    roman: 'III',
    title: 'Probabilités',
    subtitle: '概率 · 期望、不等式与极限定律',
    indices: [5, 6, 15, 16, 17, 18, 19],
  },
]

function getTodayIndex() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .formatToParts(new Date())
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, Number(value)]),
  )
  const serial = Math.floor(Date.UTC(parts.year, parts.month - 1, parts.day) / DAY_IN_MS)
  const offset = serial - ROTATION_START_DAY
  return ((offset % dailyTheoremNotes.length) + dailyTheoremNotes.length) % dailyTheoremNotes.length
}

function TheoremEntry({ index, theorem, isToday }) {
  return (
    <details className="recueil-entry">
      <summary className="recueil-summary">
        <p className={`recueil-number${isToday ? ' is-today' : ''}`}>
          N°{String(index + 1).padStart(2, '0')}
          {isToday ? ' · aujourd’hui 今日' : ''}
        </p>
        <h2>{theorem.title}</h2>
        <p className="recueil-prelude">{theorem.prelude}</p>
        <p className="recueil-prompt"><span>→</span> énoncé</p>
      </summary>
      <div className="recueil-statement">
        <div
          className="recueil-formula"
          dangerouslySetInnerHTML={{ __html: theorem.displayHtml || theorem.fallback }}
        />
        <span className="recueil-short-rule" aria-hidden="true" />
        <p className="recueil-note"><i>批:</i>{theorem.note}</p>
      </div>
    </details>
  )
}

export default function Recueil() {
  const { setWorld } = useWorld()
  const todayIndex = useMemo(getTodayIndex, [])

  useEffect(() => {
    setWorld('carnet')
  }, [setWorld])

  return (
    <article className="recueil-page">
      <header className="recueil-masthead">
        <div className="recueil-running-head">
          <Link to="/">← Carnet de classe</Link>
          <span>N°02 · Le Carnet — archives</span>
        </div>
        <div className="recueil-rule" />
        <div className="recueil-title">
          <p>Recueil de théorèmes · 定理集</p>
          <h1>Vingt-quatre théorèmes</h1>
          <p>
            一天一条,循环轮换。这里是全部二十四条的合订本——每一条都曾是某一天的扉页。
            今日为第 {todayIndex + 1} 条。
          </p>
        </div>
        <div className="recueil-rule" />
      </header>

      {VOLUMES.map((volume) => (
        <section className="recueil-volume" key={volume.roman}>
          <p>{volume.roman} · {volume.title}</p>
          <p>{volume.subtitle}</p>
          <div className="recueil-list">
            {volume.indices.map((index) => (
              <TheoremEntry
                key={index}
                index={index}
                theorem={dailyTheoremNotes[index]}
                isToday={index === todayIndex}
              />
            ))}
          </div>
        </section>
      ))}

      <section className="recueil-coda">
        <blockquote lang="fr">Un théorème par jour — et l&apos;année devient un livre.</blockquote>
        <p>一天一条定理,一年攒成一本书。</p>
      </section>
    </article>
  )
}
