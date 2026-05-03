import { dailyFrenchPhrases } from '../data/siteContent'

function getDailyIndex(length) {
  const shanghaiDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

  const seed = Number(shanghaiDate.replaceAll('-', ''))
  return seed % length
}

export default function DailyMeditation({ offset = 0, className = '' }) {
  const entry = dailyFrenchPhrases[(getDailyIndex(dailyFrenchPhrases.length) + offset) % dailyFrenchPhrases.length]

  return (
    <aside className={['section-coda', className].filter(Boolean).join(' ')} aria-label="每日哲思">
      <p className="section-coda-kicker">Meditation du jour</p>
      <p className="section-coda-quote" lang="fr">
        {entry.text}
      </p>
      <p className="section-coda-translation">{entry.note}</p>
    </aside>
  )
}
