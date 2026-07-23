import { useCallback, useEffect, useRef, useState } from 'react'
import {
  FLIGHT_SCROLL_SLOP_PX,
  FLIGHT_THRESHOLD_RESET,
  advanceFlightLoadCycle,
  beginFlightLoadCycle,
  createFlightLoadCycle,
  releaseFlightLoadCycle,
} from './flightLoadCycle'
import { createProximityField } from './materialMath'
import {
  RACCORD_LOAD_THRESHOLD,
  deformRaccordPoint,
  flightLoadMetrics,
  joinedCurveSamples,
} from './raccordWorldMath'
import usePointerField from './usePointerField'
import './WorldArtifactFields.css'

const BG = '#171411'
const BONE = '#e9e3d9'
const ACCENT = '#d9614d'
const MUTED = '#918a80'

function rgba(hex, alpha) {
  const value = Number.parseInt(hex.replace('#', ''), 16)
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`
}

function createTestId() {
  return `flight-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export default function FlightLimitInstrument({ compact = false, artifact, onFlightTest }) {
  const handle = artifact?.handle
  const flightHistory = artifact?.history?.flight
  const pointerField = usePointerField({ smoothing: compact ? 0.24 : 0.18 })
  const canvasRef = useRef(null)
  const canvasDrawRef = useRef(() => {})
  const frameRef = useRef(0)
  const lastFrameRef = useRef(0)
  const cycleRef = useRef(createFlightLoadCycle())
  const pressRef = useRef(null)
  const thresholdArmedRef = useRef(true)
  const finishPressRef = useRef(() => {})
  const onFlightTestRef = useRef(onFlightTest)
  const handleRef = useRef(handle)
  const [cycleView, setCycleView] = useState(cycleRef.current)
  const lastAnnouncedRegimeRef = useRef('stable')
  onFlightTestRef.current = onFlightTest
  handleRef.current = handle

  const publish = useCallback((force = false) => {
    const cycle = cycleRef.current
    canvasDrawRef.current(pointerField.getField(), cycle.load)
    setCycleView((current) => {
      const regimeChanged = flightLoadMetrics(current.load).regime !== flightLoadMetrics(cycle.load).regime
      return force || regimeChanged || Math.abs(current.load - cycle.load) >= 0.008 || current.phase !== cycle.phase
        ? { ...cycle }
        : current
    })
  }, [pointerField])

  const animateRef = useRef(() => {})
  animateRef.current = (time) => {
    const previous = cycleRef.current
    const elapsed = lastFrameRef.current ? time - lastFrameRef.current : 16
    lastFrameRef.current = time
    const next = advanceFlightLoadCycle(previous, elapsed)
    cycleRef.current = next

    const press = pressRef.current
    if (
      press
      && !press.crossed
      && thresholdArmedRef.current
      && previous.load < RACCORD_LOAD_THRESHOLD
      && next.load >= RACCORD_LOAD_THRESHOLD
    ) {
      press.crossed = true
      thresholdArmedRef.current = false
      onFlightTestRef.current?.({
        testId: press.testId,
        maxLoad: next.load,
        crossedThreshold: true,
        handle: press.handle,
      })
    }
    if (next.phase === 'unloading' && next.load <= FLIGHT_THRESHOLD_RESET) {
      thresholdArmedRef.current = true
    }

    publish()
    if (next.phase === 'arming' || next.phase === 'loading' || next.phase === 'unloading') {
      frameRef.current = window.requestAnimationFrame(animateRef.current)
    } else {
      frameRef.current = 0
      lastFrameRef.current = 0
    }
  }

  const requestFrame = useCallback(() => {
    if (frameRef.current) return
    lastFrameRef.current = performance.now()
    frameRef.current = window.requestAnimationFrame(animateRef.current)
  }, [])

  const beginPress = useCallback((source, event) => {
    if (pressRef.current || ['arming', 'loading', 'loaded'].includes(cycleRef.current.phase)) return
    const start = event ? { x: event.clientX, y: event.clientY } : null
    pressRef.current = {
      source,
      pointerId: event?.pointerId ?? null,
      start,
      testId: createTestId(),
      handle: { ...handleRef.current },
      crossed: false,
    }
    cycleRef.current = beginFlightLoadCycle(cycleRef.current)
    publish(true)
    requestFrame()
  }, [publish, requestFrame])

  const finishPress = useCallback(({ record = true } = {}) => {
    const press = pressRef.current
    if (!press) return
    const cycle = cycleRef.current
    if (record && cycle.peakLoad > 0.02) {
      onFlightTestRef.current?.({
        testId: press.testId,
        maxLoad: cycle.peakLoad,
        crossedThreshold: press.crossed,
        handle: press.handle,
      })
    }
    pressRef.current = null
    cycleRef.current = releaseFlightLoadCycle(cycle)
    publish(true)
    if (cycleRef.current.phase === 'unloading') requestFrame()
  }, [publish, requestFrame])
  finishPressRef.current = finishPress

  useEffect(() => {
    const handleInterruption = () => finishPressRef.current({ record: true })
    const handleVisibility = () => {
      if (document.hidden) handleInterruption()
    }
    window.addEventListener('blur', handleInterruption)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
      window.removeEventListener('blur', handleInterruption)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return undefined
    let size = { width: 1, height: 1, dpr: 1 }

    const draw = (field, loadValue = cycleRef.current.load) => {
      const { width, height, dpr } = size
      const metrics = flightLoadMetrics(loadValue)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, width, height)
      context.fillStyle = BG
      context.fillRect(0, 0, width, height)

      const surface = createProximityField({
        width,
        height,
        field,
        radiusX: width * 0.28,
        radiusY: height * 0.5,
        inner: 0.06,
        rotation: -field.signedX * 0.08,
      })

      const gap = compact ? 30 : 38
      context.lineWidth = 0.6
      context.strokeStyle = rgba(BONE, 0.048)
      for (let x = 0.5; x <= width; x += gap) {
        context.beginPath(); context.moveTo(x, 0); context.lineTo(x, height); context.stroke()
      }
      for (let y = 0.5; y <= height; y += gap) {
        context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke()
      }

      if (field.active > 0.01) {
        const reflection = context.createLinearGradient(field.x - 64, 0, field.x + 64, 0)
        reflection.addColorStop(0, rgba(BONE, 0))
        reflection.addColorStop(0.5, rgba(BONE, field.active * 0.07))
        reflection.addColorStop(1, rgba(BONE, 0))
        context.fillStyle = reflection
        context.fillRect(field.x - 64, 0, 128, height)
      }

      const paddingX = compact ? 20 : 44
      const usableWidth = width - paddingX * 2
      const usableHeight = height * (compact ? 0.7 : 0.72)
      const offsetY = height * (compact ? 0.1 : 0.09)
      const calmPoints = joinedCurveSamples({ handle, steps: compact ? 58 : 88 })
      const stressedPoints = calmPoints.map((point) => deformRaccordPoint(point, metrics.load))

      const strokeCurve = (points, color, alpha, lineWidth, localize = false) => {
        points.slice(0, -1).forEach((point, index) => {
          const next = points[index + 1]
          const x = paddingX + point.x * usableWidth
          const y = offsetY + point.y * usableHeight
          const nextX = paddingX + next.x * usableWidth
          const nextY = offsetY + next.y * usableHeight
          const local = localize ? surface.sample((x + nextX) * 0.5, (y + nextY) * 0.5) : 0
          context.beginPath()
          context.moveTo(x, y)
          context.lineTo(nextX, nextY)
          context.strokeStyle = rgba(color, alpha + local * 0.58)
          context.lineWidth = lineWidth + local * 0.8
          context.stroke()
        })
      }

      strokeCurve(calmPoints, MUTED, 0.18, 0.65)
      strokeCurve(stressedPoints, metrics.load > 0.7 ? ACCENT : BONE, 0.3, 1.05, true)

      const thresholdX = paddingX + usableWidth * RACCORD_LOAD_THRESHOLD
      context.setLineDash([4, 7])
      context.strokeStyle = rgba(ACCENT, 0.24 + metrics.instability * 0.42)
      context.lineWidth = 0.7
      context.beginPath(); context.moveTo(thresholdX, 0); context.lineTo(thresholdX, height); context.stroke()
      context.setLineDash([])

      const scars = flightHistory?.scars || []
      scars.forEach((_, index) => {
        const y = 16 + index * 7
        context.strokeStyle = rgba(ACCENT, 0.28 + index * 0.045)
        context.lineWidth = 0.65
        context.beginPath()
        context.moveTo(thresholdX - 5 - (index % 2), y)
        context.lineTo(thresholdX + 4, y + 2)
        context.stroke()
      })

      const maxLoad = flightHistory?.maxLoad || 0
      if (maxLoad > 0.02) {
        const maxX = paddingX + usableWidth * maxLoad
        context.strokeStyle = rgba(ACCENT, 0.48)
        context.beginPath(); context.moveTo(maxX, height - 13); context.lineTo(maxX, height - 5); context.stroke()
        context.fillStyle = rgba(MUTED, 0.66)
        context.font = `${compact ? 8 : 9}px "JetBrains Mono", monospace`
        context.fillText('MAX', Math.min(width - 26, maxX + 4), height - 6)
      }

      context.fillStyle = rgba(MUTED, 0.76)
      context.font = `${compact ? 9 : 10}px "JetBrains Mono", monospace`
      context.fillText('STABLE', paddingX, height - 18)
      context.fillStyle = rgba(ACCENT, 0.82)
      context.fillText('SEUIL', Math.max(paddingX, thresholdX - 34), height - 18)
    }

    canvasDrawRef.current = draw
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const width = Math.max(1, Math.round(rect.width))
      const height = Math.max(1, Math.round(rect.height))
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      size = { width, height, dpr }
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      draw(pointerField.getField())
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    const unsubscribe = pointerField.subscribe((field) => draw(field))
    resize()
    return () => { observer.disconnect(); unsubscribe() }
  }, [compact, flightHistory, handle, pointerField])

  const metrics = flightLoadMetrics(cycleView.load)
  if (metrics.regime !== lastAnnouncedRegimeRef.current) lastAnnouncedRegimeRef.current = metrics.regime
  const pressing = ['arming', 'loading', 'loaded'].includes(cycleView.phase)

  const handlePointerDown = (event) => {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    beginPress('pointer', event)
  }
  const handlePointerMove = (event) => {
    const press = pressRef.current
    if (!press || press.pointerId !== event.pointerId || cycleRef.current.phase !== 'arming' || !press.start) return
    if (Math.hypot(event.clientX - press.start.x, event.clientY - press.start.y) > FLIGHT_SCROLL_SLOP_PX) {
      finishPress({ record: false })
    }
  }
  const handlePointerEnd = (event, record = true) => {
    const press = pressRef.current
    if (!press || press.pointerId !== event.pointerId) return
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    finishPress({ record })
  }
  const handleKeyDown = (event) => {
    if (![' ', 'Enter'].includes(event.key) || event.repeat) return
    event.preventDefault()
    beginPress('keyboard')
  }
  const handleKeyUp = (event) => {
    if (![' ', 'Enter'].includes(event.key)) return
    event.preventDefault()
    finishPress({ record: true })
  }

  return (
    <section
      ref={pointerField.elementRef}
      className={`flight-limit-instrument${compact ? ' is-compact' : ''}`}
      data-raccord-handle={handle ? `${handle.x.toFixed(3)},${handle.y.toFixed(3)}` : undefined}
      data-load-phase={cycleView.phase}
      data-history-max-load={(flightHistory?.maxLoad || 0).toFixed(3)}
      data-threshold-crossings={flightHistory?.thresholdCrossings || 0}
      role="button"
      tabIndex={0}
      aria-label={`Maintenir pour charger le raccord. λ ${metrics.load.toFixed(2)}, marge ${metrics.margin.toFixed(2)}`}
      aria-pressed={pressing}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => handlePointerEnd(event, true)}
      onPointerCancel={(event) => handlePointerEnd(event, false)}
      onLostPointerCapture={(event) => handlePointerEnd(event, true)}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onBlur={() => finishPress({ record: true })}
    >
      <header><span>Soufflerie 01 · modèle réduit</span><span>maintenir · λ → 1</span></header>
      <canvas ref={canvasRef} aria-hidden="true" />
      <footer>
        <span>λ {metrics.load.toFixed(2)}</span>
        <output>marge {metrics.margin.toFixed(2)} · {metrics.regime}</output>
      </footer>
      <span className="material-sr-only" aria-live="polite">{lastAnnouncedRegimeRef.current}</span>
    </section>
  )
}
