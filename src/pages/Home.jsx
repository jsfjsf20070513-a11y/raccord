import DailyMeditation from '../components/DailyMeditation'
import TitlePageNarration from '../components/TitlePageNarration'
import { classProfile } from '../data/siteContent'
import { dailyTheoremNotes } from '../data/dailyTheoremNotes.generated'
import { explanationsCredit, theoremExplanations } from '../data/theoremExplanations.generated'

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

// 扉页 Home — design contract: 封面题署 → 每日定理(KaTeX + 折叠证明)→ 一句冥想 → 细页脚。
// 课表 / 图版 / 阅读线 / 黑客松入口都已按设计移除;每日定理与冥想接真实轮换数据。
export default function Home() {
  const dailyTheorem = dailyTheoremNotes[getRotatingTheoremIndex(dailyTheoremNotes.length)]
  const editionDateLabel = getEditionDateLabel()
  const proof = theoremExplanations[dailyTheorem.title]

  return (
    <article className="page-column home-page">
      <header className="home-cover">
        <p className="home-cover-kicker">{classProfile.campus}</p>
        <h1 className="home-cover-title">2025 级数学班</h1>
        <p className="home-cover-subtitle" lang="fr">Trente mathématiciens, une classe.</p>
        <p className="home-cover-edition">{`Édition du ${editionDateLabel}`}</p>
        <TitlePageNarration />
      </header>

      <section className="home-theorem" aria-label="每日定理">
        <p className="home-theorem-kicker">Rappel mathématique · 每日定理</p>
        <h2 className="home-theorem-title">{dailyTheorem.title}</h2>
        <p className="home-theorem-prelude">{dailyTheorem.prelude}</p>
        <div
          className="home-theorem-formula"
          dangerouslySetInnerHTML={{ __html: dailyTheorem.displayHtml || dailyTheorem.fallback }}
        />
        <p className="home-theorem-note">{dailyTheorem.note}</p>
        {proof ? (
          <details className="home-proof">
            <summary>
              <span aria-hidden="true">→</span>
              <span>Voir la preuve · 查看证明思路</span>
            </summary>
            <div className="home-proof-body">
              <div className="theorem-explanation-block">
                <p className="theorem-explanation-lang" aria-hidden="true">中文</p>
                <ol className="home-proof-steps">
                  {(Array.isArray(proof.zh) ? proof.zh : [proof.zh]).map((step, idx) => (
                    <li key={idx} dangerouslySetInnerHTML={{ __html: step }} />
                  ))}
                </ol>
              </div>
              <div className="theorem-explanation-block">
                <p className="theorem-explanation-lang" aria-hidden="true">Français</p>
                <ol className="home-proof-steps" lang="fr">
                  {(Array.isArray(proof.fr) ? proof.fr : [proof.fr]).map((step, idx) => (
                    <li key={idx} dangerouslySetInnerHTML={{ __html: step }} />
                  ))}
                </ol>
              </div>
              <p className="home-proof-credit">Bilingual reasoning by {explanationsCredit.generator}</p>
            </div>
          </details>
        ) : null}
      </section>

      <section className="home-meditation">
        <DailyMeditation offset={0} />
      </section>
    </article>
  )
}
