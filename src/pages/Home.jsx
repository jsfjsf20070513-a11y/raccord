import { Link } from 'react-router-dom'
import DailyMeditation from '../components/DailyMeditation'
import TitlePageNarration from '../components/TitlePageNarration'
import {
  classProfile,
  courseSchedule,
} from '../data/siteContent'
import { dailyTheoremNotes } from '../data/dailyTheoremNotes.generated'
import { homeReadingPaths } from '../data/homeReadingPaths'
import { usePublicAlbums } from '../hooks/usePublicAlbums'
import { formatCourseSchedule } from '../lib/courseSchedule'

const DAY_IN_MS = 24 * 60 * 60 * 1000
const THEOREM_ROTATION_START_DAY = Math.floor(Date.UTC(2025, 8, 1) / DAY_IN_MS)

function getShanghaiDaySerial(reference = new Date()) {
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

  return Math.floor(Date.UTC(parts.year, parts.month - 1, parts.day) / DAY_IN_MS)
}

function getRotatingTheoremIndex(length) {
  if (!length) {
    return 0
  }

  const dayOffset = getShanghaiDaySerial() - THEOREM_ROTATION_START_DAY
  return ((dayOffset % length) + length) % length
}

function getEditionDateLabel() {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date())
}

export default function Home() {
  const { homeAlbums } = usePublicAlbums()
  const plates = homeAlbums
  const courseTable = formatCourseSchedule(courseSchedule)
  const dailyTheorem = dailyTheoremNotes[getRotatingTheoremIndex(dailyTheoremNotes.length)]
  const editionDateLabel = getEditionDateLabel()

  return (
    <article className="page-column home-page">
      <header className="title-page">
        <div className="title-page-head">
          <p className="page-header-kicker">{classProfile.campus}</p>
          <h1>2025 级数学班</h1>
          <p className="title-page-subtitle">Trente mathematiciens, une classe.</p>
          <div className="title-page-copy">
            <p>Fenêtre sur le présent, miroir pour la mémoire.</p>
          </div>
          <TitlePageNarration />
          <p className="title-page-ledger">{`Édition du ${editionDateLabel}`}</p>
          <nav className="title-page-nav" aria-label="作品展示入口">
            <Link to="/hackathon">View Hackathon Showcase</Link>
          </nav>
        </div>
      </header>

      <section className="home-fragment theorem-fragment" aria-label="定理回顾">
        <article className="daily-entry theorem-entry">
          <p className="daily-entry-kicker">Rappel mathematique</p>
          <h2>{dailyTheorem.title}</h2>
          <p className="daily-entry-prelude">{dailyTheorem.prelude}</p>
          <div
            className="daily-entry-display"
            dangerouslySetInnerHTML={{ __html: dailyTheorem.displayHtml || dailyTheorem.fallback }}
          />
          <p className="daily-entry-meta">{dailyTheorem.note}</p>
        </article>
      </section>

      <section className="page-section" id="courses">
        <h2 className="section-title">§1 课程表</h2>
        <pre className="editorial-pre">{courseTable}</pre>
        <DailyMeditation offset={0} />
      </section>

      <section className="page-section" id="plates">
        <h2 className="section-title">§2 图版</h2>
        <ol className="plate-list">
          {plates.map((album, index) => (
            <li key={album.id}>
              <span>Plate {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][index] || `${index + 1}`}. </span>
              <Link to={`/album/${album.id}`}>{album.date}，{album.title}。</Link>
              <span className="muted-copy"> {album.description}</span>
            </li>
          ))}
        </ol>
        <p className="plate-overview-reference">
          <Link to="/gallery">→ 进入图版总览</Link>
        </p>
        <DailyMeditation offset={1} />
      </section>

      <section className="page-section" id="books">
        <h2 className="section-title">§3 阅读线</h2>
        <ol className="record-list compact">
          {homeReadingPaths.map((path) => (
            <li key={path.id} className="record-entry reading-line-entry">
              <div className="record-entry-head">
                <div>
                  <h3 className="reading-line-title">{path.title}</h3>
                </div>
              </div>
              <p>{path.summary}</p>
              <div className="editorial-actions reading-line-links">
                {path.items.map((item) => (
                  <Link key={item.id} to={`/resources/${encodeURIComponent(item.id)}`}>
                    {item.title}
                  </Link>
                ))}
              </div>
            </li>
          ))}
        </ol>
        <p className="editorial-note">
          <Link to="/resources">进入完整资源目录</Link>
        </p>
        <DailyMeditation offset={2} />
      </section>
    </article>
  )
}
