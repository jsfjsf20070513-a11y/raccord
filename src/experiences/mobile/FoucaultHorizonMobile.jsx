import { useEffect, useRef, useState } from 'react'
import FoucaultPendulumField from '../../components/material/FoucaultPendulumField'
import useFoucaultHorizon from '../../components/material/useFoucaultHorizon'
import { isReleased } from '../../components/material/foucaultState'
import './FoucaultHorizonMobile.css'

const STAGE_W = 390
const STAGE_H = 844

function useCoverScale() {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const update = () => {
      setScale(Math.max(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return scale
}

function useElapsedMinutes(state) {
  const [minutes, setMinutes] = useState(null)
  const releasedAtRef = useRef(null)
  releasedAtRef.current = state.releasedAt

  useEffect(() => {
    if (!isReleased(state)) {
      setMinutes(null)
      return undefined
    }
    const update = () => {
      setMinutes(Math.max(0, Math.floor((Date.now() - releasedAtRef.current) / 60_000)))
    }
    update()
    const interval = window.setInterval(update, 15_000)
    return () => window.clearInterval(interval)
  }, [state])

  return minutes
}

export default function FoucaultHorizonMobile() {
  const { state, release } = useFoucaultHorizon()
  const scale = useCoverScale()
  const minutes = useElapsedMinutes(state)
  const elapsedLabel = minutes == null ? '' : `T + ${minutes} MIN`

  return (
    <main className="horizon-room horizon-room-mobile" aria-label="L’horizon immobile — les deux verticales">
      <h1 className="horizon-sr-only">L’horizon immobile</h1>
      <div
        className="horizon-stage horizon-stage-mobile"
        style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        <FoucaultPendulumField
          state={state}
          onRelease={release}
          variant="mobile"
        >
          <div className="horizon-room-plane">
            <div className="horizon-plate horizon-plate-mobile" />
            <header className="horizon-title horizon-title-mobile">
              <span>L’horizon immobile</span>
              <small>Les deux verticales</small>
            </header>
            <span className="horizon-elapsed horizon-elapsed-mobile">
              {elapsedLabel}
            </span>
          </div>
        </FoucaultPendulumField>
      </div>
      <output className="horizon-sr-only" aria-live="polite">
        {elapsedLabel}
      </output>
    </main>
  )
}
