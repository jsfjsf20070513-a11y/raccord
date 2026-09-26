import { useCallback, useEffect, useRef, useState } from 'react'
import { separationAtProgress } from './domain/poincareSkyMath.js'

// Playback belongs to the interaction, so it still works without a canvas.
// The field is keyed by seed: each selected initial condition starts at zero.
export default function usePoincarePlayback({ sky, disabled, onThreshold, onObserve }) {
  const [view, setView] = useState({ progress: 0, playing: false })
  const progressRef = useRef(0)
  const playingRef = useRef(false)
  const crossedRef = useRef(false)
  const frameRef = useRef(0)
  const previousTimeRef = useRef(0)
  const callbacksRef = useRef({ sky, onThreshold, onObserve })
  callbacksRef.current = { sky, onThreshold, onObserve }

  const remember = useCallback(() => {
    const current = callbacksRef.current
    if (progressRef.current > 0) current.onObserve?.({ seed: current.sky.seed, progress: progressRef.current })
  }, [])

  const pause = useCallback(() => {
    playingRef.current = false
    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
    previousTimeRef.current = 0
    setView({ progress: progressRef.current, playing: false })
    remember()
  }, [remember])

  const advance = useCallback((progress) => {
    progressRef.current = Math.min(1, Math.max(0, progress))
    const current = callbacksRef.current
    if (!crossedRef.current && current.sky.thresholdProgress !== null && progressRef.current >= current.sky.thresholdProgress) {
      crossedRef.current = true
      current.onThreshold?.({
        seed: current.sky.seed,
        progress: current.sky.thresholdProgress,
        divergence: separationAtProgress(current.sky, current.sky.thresholdProgress),
      })
    }
    setView({ progress: progressRef.current, playing: playingRef.current })
  }, [])

  const animateRef = useRef(() => {})
  animateRef.current = (time) => {
    if (!playingRef.current) return
    const elapsed = previousTimeRef.current ? Math.min(48, time - previousTimeRef.current) : 0
    previousTimeRef.current = time
    advance(progressRef.current + elapsed / 6500)
    if (progressRef.current >= 1) pause()
    else frameRef.current = window.requestAnimationFrame(animateRef.current)
  }

  const play = useCallback(() => {
    if (disabled || playingRef.current || progressRef.current >= 1) return
    playingRef.current = true
    previousTimeRef.current = 0
    setView({ progress: progressRef.current, playing: true })
    frameRef.current = window.requestAnimationFrame(animateRef.current)
  }, [disabled])

  const toggle = useCallback(() => {
    if (playingRef.current) pause()
    else play()
  }, [pause, play])

  const seek = useCallback((progress) => {
    if (disabled) return
    pause()
    advance(progress)
    remember()
  }, [advance, disabled, pause, remember])

  const restart = useCallback(() => {
    if (disabled) return
    pause()
    crossedRef.current = false
    advance(0)
  }, [advance, disabled, pause])

  useEffect(() => {
    if (disabled) pause()
  }, [disabled, pause])

  useEffect(() => {
    const hide = () => { if (document.hidden) pause() }
    document.addEventListener('visibilitychange', hide)
    window.addEventListener('blur', pause)
    return () => {
      window.cancelAnimationFrame(frameRef.current)
      remember()
      document.removeEventListener('visibilitychange', hide)
      window.removeEventListener('blur', pause)
    }
  }, [pause, remember])

  return { ...view, play, pause, toggle, seek, restart }
}
