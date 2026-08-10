import { useMemo } from 'react'
import FoucaultHorizonDesktop from '../experiences/desktop/FoucaultHorizonDesktop'
import FoucaultHorizonMobile from '../experiences/mobile/FoucaultHorizonMobile'
import './Horizon.css'
import useExperienceMode from '../experiences/shared/useExperienceMode'
import {
  CHAPTER_TIME_SCALE,
  FOUCAULT_SCHEMA_VERSION,
  FOUCAULT_STORAGE_KEY,
} from '../components/material/foucaultState'

// DEV-only QA seeding: /horizon?qa=dormant|gesture|released|revealed|compare
// lets headless capture deterministic states. Stripped from production builds.
function applyQaSeed() {
  if (!import.meta.env.DEV) return
  const seed = new URLSearchParams(window.location.search).get('qa')
  if (!seed) return
  delete window.__QA_AIM__
  delete window.__QA_FREEZE_S__
  const now = Date.now()
  const write = (releasedAgoMs, timeScale = CHAPTER_TIME_SCALE, directionDeg = 338) => {
    window.localStorage.setItem(FOUCAULT_STORAGE_KEY, JSON.stringify({
      version: FOUCAULT_SCHEMA_VERSION,
      chapterTimeScale: timeScale,
      releaseDirectionDeg: directionDeg,
      releasedAt: now - releasedAgoMs,
      lastObservedAt: now,
    }))
  }
  if (seed === 'dormant') window.localStorage.removeItem(FOUCAULT_STORAGE_KEY)
  if (seed === 'gesture') {
    window.localStorage.removeItem(FOUCAULT_STORAGE_KEY)
    window.__QA_AIM__ = { angleDeg: -20, pull: 130 }
  }
  if (seed === 'released') {
    write(12_000)
    window.__QA_FREEZE_S__ = 0.55
  }
  if (seed === 'revealed') {
    write(65_000)
    window.__QA_FREEZE_S__ = 0.62
  }
  if (seed === 'compare') {
    // T + 58 real minutes with a small witnessed drift, bob crossing centre.
    write(58 * 60_000, 0.676)
    window.__QA_FREEZE_S__ = 0
  }
}

export default function Horizon() {
  const mode = useExperienceMode()
  useMemo(applyQaSeed, [])

  if (mode === 'mobile') return <FoucaultHorizonMobile />

  return <FoucaultHorizonDesktop />
}
