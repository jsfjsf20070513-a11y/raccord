import { useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { PLAN_PROTOTYPE_META, PLAN_PROTOTYPE_VARIANTS } from '../material/planPrototypeMath'
import './PrototypeSwitcher.css'

export default function PrototypeSwitcher({ current }) {
  const [searchParams, setSearchParams] = useSearchParams()

  const cycle = useCallback((offset) => {
    const index = PLAN_PROTOTYPE_VARIANTS.indexOf(current)
    const nextIndex = (index + offset + PLAN_PROTOTYPE_VARIANTS.length) % PLAN_PROTOTYPE_VARIANTS.length
    const next = new URLSearchParams(searchParams)
    next.set('variant', PLAN_PROTOTYPE_VARIANTS[nextIndex])
    setSearchParams(next, { replace: true })
  }, [current, searchParams, setSearchParams])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.defaultPrevented) return
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return
      const target = event.target
      if (target instanceof Element && target.closest('a, button, canvas, input, textarea, select, [tabindex], [contenteditable="true"]')) return
      event.preventDefault()
      cycle(event.key === 'ArrowLeft' ? -1 : 1)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [cycle])

  if (!import.meta.env.DEV || !PLAN_PROTOTYPE_VARIANTS.includes(current)) return null

  return (
    <nav className="prototype-switcher" aria-label="PLAN prototype variants">
      <button type="button" onClick={() => cycle(-1)} aria-label="Prototype précédent"><ChevronLeft aria-hidden="true" /></button>
      <output>{current} — {PLAN_PROTOTYPE_META[current].name}</output>
      <button type="button" onClick={() => cycle(1)} aria-label="Prototype suivant"><ChevronRight aria-hidden="true" /></button>
    </nav>
  )
}
