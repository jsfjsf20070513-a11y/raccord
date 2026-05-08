import { Link } from 'react-router-dom'
import DailyMeditation from '../components/DailyMeditation'
import TitlePageNarration from '../components/TitlePageNarration'
import {
  classProfile,
  courseSchedule,
} from '../data/siteContent'
import { dailyTheoremNotes } from '../data/dailyTheoremNotes.generated'
import { homeReadingPaths } from '../data/homeReadingPaths'
import { explanationsCredit, theoremExplanations } from '../data/theoremExplanations'
import { usePublicAlbums } from '../hooks/usePublicAlbums'
import { formatCourseSchedule } from '../lib/courseSchedule'
import { renderMathTextToHtml } from '../lib/mathText'

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
          <p className="title-page-subtitle">Trente mathématiciens, une classe.</p>
          <div className="title-page-copy">
            <p>Fenêtre sur le présent, miroir pour la mémoire.</p>
          </div>
          <TitlePageNarration />
          <p className="title-page-ledger">{`Édition du ${editionDateLabel}`}</p>
          <p className="title-page-track">
            Dev3pack 2026 · Solana + AI hackathon entry
          </p>
          <nav className="title-page-nav" aria-label="Showcase entry · 作品展示入口">
            <Link to="/web3-profile">→ Open Web3 Student Profile (Solana devnet)</Link>
            <Link to="/hackathon">View Hackathon Showcase</Link>
          </nav>
        </div>
      </header>

      <section className="home-fragment theorem-fragment" aria-label="Theorem review · 定理回顾">
        <article className="daily-entry theorem-entry">
          <p className="daily-entry-kicker">Rappel mathématique</p>
          <h2>{dailyTheorem.title}</h2>
          <p className="daily-entry-prelude">{dailyTheorem.prelude}</p>
          <div
            className="daily-entry-display"
            dangerouslySetInnerHTML={{ __html: dailyTheorem.displayHtml || dailyTheorem.fallback }}
          />
          <p className="daily-entry-meta">{dailyTheorem.note}</p>
          {theoremExplanations[dailyTheorem.title] ? (
            <details className="theorem-explanation">
              <summary>
                <span className="theorem-explanation-arrow" aria-hidden="true">→</span>
                <span>Voir la preuve · 查看证明思路</span>
              </summary>
              <div className="theorem-explanation-body">
                <div className="theorem-explanation-block">
                  <p className="theorem-explanation-lang" aria-hidden="true">中文</p>
                  <p
                    dangerouslySetInnerHTML={{
                      __html: renderMathTextToHtml(
                        theoremExplanations[dailyTheorem.title].zh,
                      ),
                    }}
                  />
                </div>
                <div className="theorem-explanation-block">
                  <p className="theorem-explanation-lang" aria-hidden="true">Français</p>
                  <p
                    dangerouslySetInnerHTML={{
                      __html: renderMathTextToHtml(
                        theoremExplanations[dailyTheorem.title].fr,
                      ),
                    }}
                  />
                </div>
                <p className="theorem-explanation-credit">
                  Bilingual reasoning by {explanationsCredit.generator}
                </p>
              </div>
            </details>
          ) : null}
        </article>
      </section>

      <section className="page-section" id="courses">
        <h2 className="section-title">§1 Schedule · 课程表</h2>
        <p className="schedule-context">
          The real Spring 2026 timetable for the class — six teaching days, bilingual
          mathematics + French foundation tracks, taught at the Renmin University of
          China Sino-French Institute (Suzhou campus). Course names and classroom
          codes are kept in their registered Chinese form for fidelity. ·
          中法学院 2026 春学期真实课表，完整保留课程名与教室编号。
        </p>
        <pre className="editorial-pre">{courseTable}</pre>
        <DailyMeditation offset={0} />
      </section>

      <section className="page-section" id="plates">
        <h2 className="section-title">§2 Plates · 图版</h2>
        <ol className="plate-list">
          {plates.map((album, index) => (
            <li key={album.id}>
              <Link to={`/album/${album.id}`} className="plate-link">
                <figure className="plate-thumb">
                  <picture>
                    {album.coverWebp ? <source srcSet={album.coverWebp} type="image/webp" /> : null}
                    <img
                      src={album.cover}
                      alt={album.title}
                      loading="lazy"
                      decoding="async"
                      width={album.coverWidth}
                      height={album.coverHeight}
                    />
                  </picture>
                </figure>
                <span className="plate-caption">
                  <span className="plate-roman">Plate {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][index] || `${index + 1}`}. </span>
                  <span className="plate-headline">
                    {album.titleEn ? <>{album.titleEn}<span className="plate-headline-zh"> · {album.title}</span></> : `${album.date}，${album.title}。`}
                  </span>
                  <span className="plate-description muted-copy"> {album.description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <p className="plate-overview-reference">
          <Link to="/gallery">→ Open the plate index · 进入图版总览</Link>
        </p>
        <DailyMeditation offset={1} />
      </section>

      <section className="page-section" id="books">
        <h2 className="section-title">§3 Reading lines · 阅读线</h2>
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
          <Link to="/resources">Open the full resource directory · 进入完整资源目录</Link>
        </p>
        <DailyMeditation offset={2} />
      </section>
    </article>
  )
}
