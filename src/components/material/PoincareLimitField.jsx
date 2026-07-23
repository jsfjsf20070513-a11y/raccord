import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPoincareSignature, createPoincareSky, separationAtProgress } from './poincareSkyMath'
import usePointerField from './usePointerField'
import './PoincareSkyFields.css'

const BONE = '#e9e3d9'
const VERMILION = '#d9614d'

function rgba(hex, alpha) {
  const value = Number.parseInt(hex.replace('#', ''), 16)
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`
}

export default function PoincareLimitField({ compact = false, artifact, onThreshold, passageActive = false }) {
  const seed = artifact?.seed
  const sky = useMemo(() => createPoincareSky(seed), [seed])
  const signature = useMemo(() => createPoincareSignature(sky, 9), [sky])
  const pointerField = usePointerField({ smoothing: compact ? 0.3 : 0.22 })
  const canvasRef = useRef(null)
  const drawRef = useRef(() => {})
  const frameRef = useRef(0)
  const lastTimeRef = useRef(0)
  const pressingRef = useRef(false)
  const crossedRef = useRef(false)
  const progressRef = useRef(0)
  const [view, setView] = useState({ progress: 0, pressing: false })

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return undefined
    let size = { width: 1, height: 1, dpr: 1 }

    const draw = (field = pointerField.getField(), progress = progressRef.current) => {
      const { width, height, dpr } = size
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, width, height)
      context.lineCap = 'round'
      context.lineJoin = 'round'
      if (passageActive) return

      const left = width * (compact ? 0.08 : 0.07)
      const right = width * 0.94
      const baseline = height * (compact ? 0.48 : 0.5)
      const amplitude = height * (compact ? 0.22 : 0.28)

      const strokeFuture = (direction, color, alpha) => {
        const anchors = signature.map((sample) => ({
          x: left + sample.progress * (right - left),
          y: baseline - sample.primary * height * 0.06 + direction * sample.divergence * amplitude,
        }))
        context.save()
        context.beginPath()
        context.rect(left - 2, 0, Math.max(0, (right - left) * progress + 4), height)
        context.clip()
        context.beginPath()
        context.moveTo(anchors[0].x, anchors[0].y)
        for (let index = 1; index < anchors.length - 1; index += 1) {
          const current = anchors[index]
          const next = anchors[index + 1]
          context.quadraticCurveTo(current.x, current.y, (current.x + next.x) * 0.5, (current.y + next.y) * 0.5)
        }
        const last = anchors.at(-1)
        context.lineTo(last.x, last.y)
        context.strokeStyle = rgba(color, alpha)
        context.lineWidth = direction < 0 ? 1.25 : 1
        context.stroke()
        context.restore()
      }
      strokeFuture(-1, BONE, 0.88)
      strokeFuture(1, VERMILION, 0.92)

      const originY = baseline - (signature[0]?.primary || 0) * height * 0.06
      context.strokeStyle = rgba(BONE, 0.36)
      context.lineWidth = 0.65
      context.beginPath()
      context.arc(left, originY, compact ? 5 : 6, 0, Math.PI * 2)
      context.stroke()
      context.fillStyle = rgba(VERMILION, 0.88)
      context.beginPath()
      context.arc(left, originY, compact ? 1.8 : 2.2, 0, Math.PI * 2)
      context.fill()

      const thresholdProgress = artifact?.scar?.progress || sky.thresholdProgress
      const thresholdX = left + thresholdProgress * (right - left)
      context.strokeStyle = rgba(VERMILION, artifact?.scar ? 0.82 : 0.42)
      context.lineWidth = artifact?.scar ? 0.9 : 0.65
      context.beginPath()
      context.moveTo(thresholdX, height * 0.17)
      context.lineTo(thresholdX, height * 0.82)
      context.stroke()

      if (field.active > 0.02) {
        const radius = Math.min(width, height) * 0.23
        for (let index = 0; index < 7; index += 1) {
          const offset = (index - 3) * 5
          const arcRadius = Math.max(0.5, radius + offset)
          const alpha = field.active * (0.04 - Math.abs(index - 3) * 0.006)
          context.strokeStyle = rgba(BONE, Math.max(0.006, alpha))
          context.lineWidth = 0.5
          context.beginPath()
          context.arc(field.x, field.y, arcRadius, Math.PI * 1.08, Math.PI * 1.92)
          context.stroke()
        }
      }

      const railY = height * 0.89
      context.strokeStyle = rgba(BONE, 0.25)
      context.lineWidth = 0.65
      context.beginPath(); context.moveTo(left, railY); context.lineTo(right, railY); context.stroke()
      context.strokeStyle = rgba(progress >= sky.thresholdProgress ? VERMILION : BONE, 0.86)
      context.lineWidth = 1.15
      context.beginPath(); context.moveTo(left, railY); context.lineTo(left + (right - left) * progress, railY); context.stroke()
      context.fillStyle = progress >= sky.thresholdProgress ? VERMILION : BONE
      context.beginPath(); context.arc(left + (right - left) * progress, railY, compact ? 2.4 : 2.8, 0, Math.PI * 2); context.fill()
    }

    drawRef.current = draw
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const width = Math.max(1, Math.round(rect.width))
      const height = Math.max(1, Math.round(rect.height))
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      size = { width, height, dpr }
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      draw()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    const unsubscribe = pointerField.subscribe((field) => draw(field))
    resize()
    return () => { observer.disconnect(); unsubscribe() }
  }, [artifact?.scar, compact, passageActive, pointerField, signature, sky])

  const animateRef = useRef(() => {})
  animateRef.current = (time) => {
    const elapsed = Math.min(48, lastTimeRef.current ? time - lastTimeRef.current : 16)
    lastTimeRef.current = time
    if (pressingRef.current) {
      progressRef.current = Math.min(1, progressRef.current + elapsed / (compact ? 3000 : 3600))
      if (!crossedRef.current && progressRef.current >= sky.thresholdProgress) {
        crossedRef.current = true
        onThreshold?.({
          progress: sky.thresholdProgress,
          divergence: separationAtProgress(sky, sky.thresholdProgress),
          seed: sky.seed,
        })
      }
    } else {
      progressRef.current = Math.max(0, progressRef.current - elapsed / 720)
    }
    drawRef.current(pointerField.getField(), progressRef.current)
    setView({ progress: progressRef.current, pressing: pressingRef.current })
    if ((pressingRef.current && progressRef.current < 1) || (!pressingRef.current && progressRef.current > 0)) {
      frameRef.current = window.requestAnimationFrame(animateRef.current)
    } else {
      frameRef.current = 0
      lastTimeRef.current = 0
    }
  }

  const requestFrame = useCallback(() => {
    if (!frameRef.current) frameRef.current = window.requestAnimationFrame(animateRef.current)
  }, [])

  useEffect(() => () => window.cancelAnimationFrame(frameRef.current), [])

  const begin = (event) => {
    if (event?.button != null && event.button !== 0) return
    event?.preventDefault()
    if (event?.pointerId != null) event.currentTarget.setPointerCapture?.(event.pointerId)
    pressingRef.current = true
    crossedRef.current = progressRef.current >= sky.thresholdProgress
    setView((current) => ({ ...current, pressing: true }))
    requestFrame()
  }
  const release = (event) => {
    if (event?.pointerId != null && event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    pressingRef.current = false
    setView((current) => ({ ...current, pressing: false }))
    requestFrame()
  }
  const handleKeyDown = (event) => {
    if (![' ', 'Enter'].includes(event.key) || event.repeat) return
    event.preventDefault()
    if (event.key === 'Enter') {
      if (pressingRef.current) release()
      else begin()
      return
    }
    begin()
  }
  const handleKeyUp = (event) => {
    if (event.key !== ' ') return
    event.preventDefault(); release()
  }

  return (
    <section
      ref={pointerField.elementRef}
      className={`poincare-field poincare-limit-field${compact ? ' is-compact' : ''}`}
      data-phase={view.pressing ? 'loading' : view.progress > 0 ? 'unloading' : 'dormant'}
      data-scar={artifact?.scar ? 'present' : 'absent'}
      data-seed={`${sky.seed.x.toFixed(3)},${sky.seed.y.toFixed(3)}`}
      data-passage={passageActive ? 'active' : 'dormant'}
      data-threshold={sky.thresholdProgress.toFixed(3)}
      role="button"
      tabIndex={0}
      aria-pressed={view.pressing}
      aria-label={`Maintenir pour avancer le temps. Entrée verrouille la pression. t ${view.progress.toFixed(2)}`}
      onPointerDown={begin}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onBlur={release}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      <output className="poincare-time">t {view.progress < 0.01 ? '= 0' : `→ ${view.progress.toFixed(2)}`}</output>
    </section>
  )
}
