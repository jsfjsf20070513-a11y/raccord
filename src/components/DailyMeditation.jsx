import { useState } from 'react'
import { dailyFrenchPhrases } from '../data/siteContent'

// Rotate the meditation on every visit (random pick on mount), so the whole
// pool's breadth shows over time rather than one date-fixed phrase per day.
// `offset` is accepted for backward compatibility but no longer used.
// eslint-disable-next-line no-unused-vars
export default function DailyMeditation({ offset = 0, className = '' }) {
  const [index] = useState(() => Math.floor(Math.random() * dailyFrenchPhrases.length))
  const entry = dailyFrenchPhrases[index]

  return (
    <aside className={['section-coda', className].filter(Boolean).join(' ')} aria-label="Daily meditation · 每日哲思">
      <p className="section-coda-kicker">Méditation du jour · 冥想</p>
      <p className="section-coda-quote" lang="fr">
        {entry.text}
      </p>
      <p className="section-coda-translation">{entry.note}</p>
    </aside>
  )
}
