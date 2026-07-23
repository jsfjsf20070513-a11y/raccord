import { useEffect, useMemo, useRef } from 'react'
import { createProximityField } from './materialMath'
import {
  joinedCurveSamples,
  raccordInterpretationSamples,
} from './raccordWorldMath'
import usePointerField from './usePointerField'
import './WorldArtifactFields.css'

const PAPER = '#fbfaf6'
const INK = '#201d1a'
const ACCENT = '#7f302b'
const MUTED = '#6b635b'

function rgba(hex, alpha) {
  const value = Number.parseInt(hex.replace('#', ''), 16)
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`
}

function fibre(index, seed) {
  const value = Math.sin(index * 17.371 + seed * 41.913) * 18273.719
  return value - Math.floor(value)
}

function strokePolyline(context, points, project, styleAt) {
  points.slice(0, -1).forEach((point, index) => {
    const next = points[index + 1]
    const start = project(point)
    const end = project(next)
    const style = styleAt(start, end, index)
    if (!style || style.alpha <= 0.001) return
    context.beginPath()
    context.moveTo(start.x, start.y)
    context.lineTo(end.x, end.y)
    context.strokeStyle = rgba(style.color, style.alpha)
    context.lineWidth = style.lineWidth
    context.stroke()
  })
}

export default function RaccordMemoryField({ compact = false, artifact }) {
  const handle = artifact?.handle
  const construction = artifact?.history?.construction
  const scars = useMemo(() => artifact?.history?.flight?.scars || [], [artifact?.history?.flight?.scars])
  const activeTargetRef = useRef(false)
  const pointerField = usePointerField({
    smoothing: compact ? 0.24 : 0.2,
    onActiveChange: (active) => { activeTargetRef.current = active },
  })
  const canvasRef = useRef(null)
  const keyboardPositionRef = useRef({ u: 0.5, v: 0.5 })

  const handleKeyDown = (event) => {
    const offset = {
      ArrowLeft: { u: -0.08, v: 0 },
      ArrowRight: { u: 0.08, v: 0 },
      ArrowUp: { u: 0, v: -0.08 },
      ArrowDown: { u: 0, v: 0.08 },
    }[event.key]
    if (!offset) return
    event.preventDefault()
    const current = keyboardPositionRef.current
    const next = {
      u: Math.min(1, Math.max(0, current.u + offset.u)),
      v: Math.min(1, Math.max(0, current.v + offset.v)),
    }
    keyboardPositionRef.current = next
    pointerField.activateAt({ ...next, active: 0.9, pressure: 0 })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return undefined
    let size = { width: 1, height: 1, dpr: 1 }
    let frame = 0
    let lastTime = 0
    let progress = 0
    let anchor = null
    let quietSince = 0
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const draw = (field) => {
      const { width, height, dpr } = size
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, width, height)
      context.fillStyle = PAPER
      context.fillRect(0, 0, width, height)
      context.lineCap = 'round'
      context.lineJoin = 'round'

      const surface = createProximityField({
        width,
        height,
        field,
        radiusX: width * 0.31,
        radiusY: height * 0.44,
        inner: 0.06,
        rotation: field.signedX * 0.08,
      })

      for (let index = 0; index < 118; index += 1) {
        const x = fibre(index, 2) * width
        const y = fibre(index, 5) * height
        const length = 16 + fibre(index, 8) * width * 0.18
        const local = surface.sample(x + length * 0.5, y)
        context.beginPath()
        context.moveTo(x, y)
        context.quadraticCurveTo(x + length * 0.48, y - 1.2 + local, x + length, y)
        context.strokeStyle = rgba(INK, 0.026 + local * progress * 0.032)
        context.lineWidth = 0.3 + fibre(index, 11) * 0.32
        context.stroke()
      }

      const paddingX = compact ? 20 : 34
      const usableWidth = width - paddingX * 2
      const archiveHeight = height * 0.48
      const archiveOffsetY = height * 0.18
      const archiveProject = (point) => ({
        x: paddingX + point.x * usableWidth,
        y: archiveOffsetY + point.y * archiveHeight,
      })

      if (construction?.handle) {
        const archived = joinedCurveSamples({ handle: construction.handle, steps: compact ? 54 : 82 })
        strokePolyline(context, archived, archiveProject, () => ({ color: '#ffffff', alpha: 0.74, lineWidth: 1.5 }))
        strokePolyline(context, archived, (point) => {
          const projected = archiveProject(point)
          return { x: projected.x, y: projected.y + 1.1 }
        }, () => ({ color: INK, alpha: 0.16, lineWidth: 0.82 }))
      }

      const interpretationHeight = height * (compact ? 0.54 : 0.58)
      const interpretationOffsetY = height * (compact ? 0.2 : 0.18)
      const interpretationProject = (point, offset = 0) => ({
        x: paddingX + point.x * usableWidth,
        y: interpretationOffsetY + point.y * interpretationHeight + offset,
      })

      const currentTrace = raccordInterpretationSamples({ handle, steps: compact ? 58 : 86 })
      const datumY = interpretationProject({ x: 0, y: 0.5 }).y

      context.strokeStyle = rgba(INK, 0.12)
      context.lineWidth = 0.55
      context.beginPath()
      context.moveTo(paddingX, datumY)
      context.lineTo(width - paddingX, datumY)
      context.stroke()

      const ribStep = compact ? 5 : 7
      currentTrace.forEach((point, index) => {
        if (index % ribStep !== 0 || index === 0 || index === currentTrace.length - 1) return
        const projected = interpretationProject(point)
        const local = surface.sample(projected.x, projected.y)
        context.strokeStyle = rgba(
          local > 0.05 && progress > 0.02 ? ACCENT : INK,
          0.052 + local * progress * 0.16,
        )
        context.lineWidth = 0.45 + local * progress * 0.2
        context.beginPath()
        context.moveTo(projected.x, datumY)
        context.lineTo(projected.x, projected.y)
        context.stroke()
      })

      scars.forEach((scar, scarIndex) => {
        const trace = raccordInterpretationSamples({
          handle: scar.handle,
          load: scar.load,
          steps: compact ? 52 : 76,
        })
        strokePolyline(context, trace, (point) => interpretationProject(point, (scarIndex - scars.length * 0.5) * 1.8), (start, end) => {
          const local = surface.sample((start.x + end.x) * 0.5, (start.y + end.y) * 0.5)
          return {
            color: ACCENT,
            alpha: 0.11 + local * progress * 0.24,
            lineWidth: 0.62 + local * progress * 0.48,
          }
        })
      })

      strokePolyline(context, currentTrace, interpretationProject, () => ({
        color: INK,
        alpha: compact ? 0.32 : 0.28,
        lineWidth: compact ? 1.02 : 0.96,
      }))
      strokePolyline(context, currentTrace, interpretationProject, (start, end) => {
        const local = surface.sample((start.x + end.x) * 0.5, (start.y + end.y) * 0.5)
        return {
          color: ACCENT,
          alpha: local * progress * 0.66,
          lineWidth: 0.82 + local * progress * 0.72,
        }
      })

      const spineX = width * 0.5 + 0.5
      context.strokeStyle = rgba(ACCENT, 0.14 + progress * 0.07)
      context.lineWidth = 0.6
      context.beginPath(); context.moveTo(spineX, height * 0.12); context.lineTo(spineX, height * 0.88); context.stroke()

      const underlineWidth = progress * Math.min(176, width * 0.36)
      context.strokeStyle = rgba(ACCENT, 0.18 + progress * 0.48)
      context.lineWidth = 0.75
      context.beginPath()
      context.moveTo(width * 0.5 - underlineWidth * 0.5, height * 0.86)
      context.lineTo(width * 0.5 + underlineWidth * 0.5, height * 0.86)
      context.stroke()

      if (construction || scars.length) {
        context.fillStyle = rgba(MUTED, 0.62 + progress * 0.16)
        context.font = `${compact ? 8 : 9}px "JetBrains Mono", monospace`
        context.fillText(construction ? 'C² / 01' : 'TRACE / 01', paddingX, height - 14)
        if (scars.length) context.fillText(`SEUIL / ${String(scars.length).padStart(2, '0')}`, width - paddingX - 58, height - 14)
      }
    }

    const animate = (time) => {
      const field = pointerField.getField()
      const elapsed = Math.min(50, lastTime ? time - lastTime : 16)
      lastTime = time
      const active = activeTargetRef.current && field.active > 0.02
      if (active && time - quietSince >= 160) {
        progress = motionQuery.matches ? 1 : Math.min(1, progress + elapsed / 900)
      } else {
        progress = Math.max(0, progress - elapsed / 240)
      }
      canvas.closest('.raccord-memory-field')?.style.setProperty('--reading-progress', progress.toFixed(3))
      draw(field)
      const needsReveal = active && progress < 1
      const needsSleep = !active && progress > 0
      if (needsReveal || needsSleep) frame = window.requestAnimationFrame(animate)
      else { frame = 0; lastTime = 0 }
    }

    const requestFrame = () => {
      if (!frame) frame = window.requestAnimationFrame(animate)
    }

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
    const unsubscribe = pointerField.subscribe((field) => {
      const point = { x: field.x, y: field.y }
      if (!anchor || Math.hypot(point.x - anchor.x, point.y - anchor.y) > 8) {
        anchor = point
        quietSince = performance.now()
        progress = 0
      }
      draw(field)
      if (activeTargetRef.current || progress > 0) requestFrame()
    })
    resize()
    return () => {
      observer.disconnect()
      unsubscribe()
      window.cancelAnimationFrame(frame)
    }
  }, [compact, construction, handle, pointerField, scars])

  return (
    <section
      ref={pointerField.elementRef}
      className={`raccord-memory-field${compact ? ' is-compact' : ''}`}
      data-raccord-handle={handle ? `${handle.x.toFixed(3)},${handle.y.toFixed(3)}` : undefined}
      data-construction-memory={construction ? 'present' : 'dormant'}
      data-flight-memory={scars.length}
      role="group"
      tabIndex={0}
      aria-label="Trace du raccord. Rester immobile pour lire la matière; les flèches déplacent la lecture."
      onFocus={() => { keyboardPositionRef.current = { u: 0.5, v: 0.5 } }}
      onKeyDown={handleKeyDown}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
    </section>
  )
}
