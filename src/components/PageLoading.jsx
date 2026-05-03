import { useEffect, useMemo, useState } from 'react'
import { getDailyPhraseIndex, getLoadingTheme } from '../data/loadingPhrases'

export default function PageLoading({ fullscreen = false, isLeaving = false, pathname = '' }) {
  const resolvedPathname = pathname || (typeof window !== 'undefined' ? window.location.pathname : '/')
  const theme = useMemo(() => getLoadingTheme(resolvedPathname), [resolvedPathname])
  const phrases = theme.phrases || []
  const dailyIndex = useMemo(
    () => getDailyPhraseIndex(phrases.length, theme.id),
    [phrases.length, theme.id],
  )
  const [index, setIndex] = useState(dailyIndex)
  const entry = phrases[index] || phrases[0]

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

  const themeStyle = useMemo(() => ({
    '--loading-accent': theme.palette.accent,
    '--loading-muted': theme.palette.muted,
    '--loading-ink': theme.palette.ink,
    '--loading-overlay-start': theme.palette.overlayStart,
    '--loading-overlay-end': theme.palette.overlayEnd,
    '--loading-background-top': theme.palette.backgroundTop,
    '--loading-background-bottom': theme.palette.backgroundBottom,
    '--loading-glow-primary': theme.palette.glowPrimary,
    '--loading-glow-secondary': theme.palette.glowSecondary,
    '--loading-border': theme.palette.border,
    '--loading-rule': theme.palette.rule,
  }), [theme])

  const shellClassName = ['page-column', 'page-loading-shell', fullscreen ? 'is-fullscreen' : '']
    .concat(`theme-${theme.id}`)
    .filter(Boolean)
    .join(' ')

  const cardClassName = ['page-loading-card', fullscreen ? 'is-immersive' : '']
    .concat(`theme-${theme.id}`)
    .filter(Boolean)
    .join(' ')

  const content = (
    <article className={shellClassName} aria-live="polite" aria-busy="true" style={!fullscreen ? themeStyle : undefined}>
      <section className={cardClassName} role="status">
        <div className="page-loading-atmosphere" aria-hidden="true">
          <span className="page-loading-orb is-primary" />
          <span className="page-loading-orb is-secondary" />
        </div>

        <div className="page-loading-theme-meta">
          <span className="page-loading-badge" aria-hidden="true">{theme.badge}</span>
          <p className="page-loading-motto">{theme.motto}</p>
        </div>
        <p className="page-loading-eyebrow">{theme.eyebrow}</p>
        <p className="page-loading-kicker">{theme.kicker}</p>
        <p className="page-loading-title">{theme.title}</p>

        <div className="page-loading-quote-frame">
          <p key={`quote-${index}`} className="page-loading-quote">
            {entry.text}
          </p>
        </div>

        <p key={`note-${index}`} className="page-loading-note">
          {entry.note}
        </p>

        <div className="page-loading-footer">
          <div className="page-loading-meter" aria-hidden="true">
            <span />
          </div>
          <p className="page-loading-index">
            {String(index + 1).padStart(2, '0')} / {String(phrases.length).padStart(2, '0')}
          </p>
        </div>

        <p className="page-loading-ledger">{theme.ledger}</p>
      </section>
    </article>
  )

  if (fullscreen) {
    return (
      <div
        className={['page-loading-overlay', `theme-${theme.id}`, isLeaving ? 'is-leaving' : ''].filter(Boolean).join(' ')}
        style={themeStyle}
      >
        {content}
      </div>
    )
  }

  return content
}
