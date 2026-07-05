import { useEffect, useMemo, useState } from 'react'
import { getDailyPhraseIndex, getLoadingTheme } from '../data/loadingPhrases'

// 加载页 PageLoading — design contract: a quiet carnet loading view — eyebrow →
// rotating phrase(法语斜体 if present + 中文)→ note → thin sweeping line + mono
// counter. The old glowing orbs / gradients / per-route palettes are removed.
export default function PageLoading({ fullscreen = false, isLeaving = false, pathname = '' }) {
  const resolvedPathname = pathname || (typeof window !== 'undefined' ? window.location.pathname : '/')
  const theme = useMemo(() => getLoadingTheme(resolvedPathname), [resolvedPathname])
  const phrases = theme.phrases || []
  const dailyIndex = useMemo(
    () => getDailyPhraseIndex(phrases.length, theme.id),
    [phrases.length, theme.id],
  )
  const [index, setIndex] = useState(dailyIndex)
  const entry = phrases[index] || phrases[0] || {}

  useEffect(() => {
    setIndex(dailyIndex)
  }, [dailyIndex, theme.id])

  useEffect(() => {
    if (phrases.length < 2) {
      return undefined
    }
    const intervalId = window.setInterval(() => {
      setIndex((current) => (current + 1) % phrases.length)
    }, 2200)
    return () => window.clearInterval(intervalId)
  }, [phrases.length])

  const plancheLabel = ['I', 'II', 'III', 'IV'][index % 4]

  const content = (
    <div className="pl-shell" role="status" aria-live="polite" aria-busy="true">
      <p className="pl-eyebrow">Planche {plancheLabel} — en cours</p>
      <div className="pl-body">
        {entry.fr ? <p key={`fr-${index}`} className="pl-fr" lang="fr">{entry.fr}</p> : null}
        <p key={`zh-${index}`} className="pl-zh">{entry.text}</p>
      </div>
      <div className="pl-foot">
        <span className="pl-track" aria-hidden="true"><span className="pl-sweep" /></span>
        <span className="pl-count">{theme.eyebrow} · Chargement</span>
      </div>
    </div>
  )

  if (fullscreen) {
    return <div className={`pl-overlay${isLeaving ? ' is-leaving' : ''}`}>{content}</div>
  }
  return <article className="page-column pl-inline">{content}</article>
}
