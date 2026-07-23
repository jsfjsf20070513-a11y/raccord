import { useEffect, useMemo, useRef, useState } from 'react'
import {
  createPoincareSignature,
  createPoincareSky,
  normalizePoincareSeed,
} from './poincareSkyMath'
import usePointerField from './usePointerField'
import './PoincareSkyFields.css'

const COBALT = '#2e3fbd'
const INK = '#171716'

function rgba(hex, alpha) {
  const value = Number.parseInt(hex.replace('#', ''), 16)
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`
}

function drawTimeline(context, signature, pin, width, height, color, alpha, dashed = false) {
  const right = width * 0.95
  const amplitude = height * 0.18
  const centerY = pin.y
  const anchors = signature.map((sample, index) => {
    const normalized = dashed ? sample.secondary : sample.primary
    return {
      x: pin.x + sample.progress * (right - pin.x),
      y: index === 0
        ? pin.y
        : centerY - normalized * amplitude * 2 + (dashed ? sample.divergence * height * 0.19 : 0),
    }
  })
  context.beginPath()
  context.moveTo(anchors[0].x, anchors[0].y)
  for (let index = 1; index < anchors.length - 1; index += 1) {
    const current = anchors[index]
    const next = anchors[index + 1]
    const midpoint = { x: (current.x + next.x) * 0.5, y: (current.y + next.y) * 0.5 }
    context.quadraticCurveTo(current.x, current.y, midpoint.x, midpoint.y)
  }
  const last = anchors.at(-1)
  context.lineTo(last.x, last.y)
  context.setLineDash(dashed ? [5, 8] : [])
  context.strokeStyle = rgba(color, alpha)
  context.lineWidth = dashed ? 0.9 : 1.3
  context.stroke()
  context.setLineDash([])
}

function signaturePoint(signature, progress) {
  const index = Math.min(signature.length - 1, Math.max(0, Math.round(progress * (signature.length - 1))))
  return signature[index] || { progress: 0, primary: 0 }
}

export default function PoincarePlanField({ compact = false, artifact, seed, onSeedChange, onSeedCommit, passageActive = false }) {
  const safeSeed = useMemo(() => normalizePoincareSeed(artifact?.seed || seed), [artifact?.seed, seed])
  const sky = useMemo(() => createPoincareSky(safeSeed), [safeSeed])
  const signature = useMemo(() => createPoincareSignature(sky, 7), [sky])
  const pointerField = usePointerField({ smoothing: compact ? 0.3 : 0.24 })
  const canvasRef = useRef(null)
  const drawRef = useRef(() => {})
  const dragRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return undefined
    let size = { width: 1, height: 1, dpr: 1 }

    const draw = (field = pointerField.getField()) => {
      const { width, height, dpr } = size
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, width, height)
      context.lineCap = 'round'
      context.lineJoin = 'round'
      if (passageActive) return

      if (field.active > 0.01) {
        const grid = compact ? 30 : 36
        const radius = Math.min(width, height) * 0.3
        for (let x = Math.floor((field.x - radius) / grid) * grid; x <= field.x + radius; x += grid) {
          for (let y = Math.floor((field.y - radius) / grid) * grid; y <= field.y + radius; y += grid) {
            const distance = Math.hypot(x - field.x, y - field.y)
            if (distance > radius) continue
            const strength = (1 - distance / radius) * field.active
            const pull = strength * (compact ? 4 : 6)
            const dx = distance ? ((field.x - x) / distance) * pull : 0
            const dy = distance ? ((field.y - y) / distance) * pull : 0
            context.strokeStyle = rgba(COBALT, 0.035 + strength * 0.18)
            context.lineWidth = 0.5
            context.beginPath()
            context.moveTo(x - grid * 0.42 + dx, y + dy)
            context.lineTo(x + grid * 0.42 + dx, y + dy)
            context.moveTo(x + dx, y - grid * 0.42 + dy)
            context.lineTo(x + dx, y + grid * 0.42 + dy)
            context.stroke()
          }
        }
      }

      const pin = { x: safeSeed.x * width, y: safeSeed.y * height }
      drawTimeline(context, signature, pin, width, height, INK, 0.34, true)
      drawTimeline(context, signature, pin, width, height, COBALT, 0.86)

      if (artifact?.scar) {
        const scar = signaturePoint(signature, artifact.scar.progress)
        const scarX = pin.x + scar.progress * (width * 0.95 - pin.x)
        const scarY = pin.y - scar.primary * height * 0.36
        context.strokeStyle = rgba(INK, 0.52)
        context.lineWidth = 0.7
        context.beginPath()
        context.moveTo(scarX - 1.8, scarY - (compact ? 18 : 25))
        context.lineTo(scarX + 2.6, scarY + (compact ? 19 : 27))
        context.stroke()
      }

      context.strokeStyle = rgba(COBALT, 0.24)
      context.lineWidth = 0.7
      context.beginPath()
      context.arc(pin.x, pin.y, compact ? 14 : 18, 0, Math.PI * 2)
      context.stroke()
      context.strokeStyle = rgba(COBALT, 0.42)
      context.beginPath()
      context.arc(pin.x, pin.y, compact ? 5 : 6, 0, Math.PI * 2)
      context.stroke()
      context.fillStyle = COBALT
      context.beginPath()
      context.arc(pin.x, pin.y, compact ? 2.8 : 3.2, 0, Math.PI * 2)
      context.fill()
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
    const unsubscribe = pointerField.subscribe(draw)
    resize()
    return () => { observer.disconnect(); unsubscribe() }
  }, [artifact?.scar, compact, passageActive, pointerField, safeSeed.x, safeSeed.y, signature, sky])

  const seedFromEvent = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    return normalizePoincareSeed({
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    })
  }

  const handlePointerDown = (event) => {
    if (event.button !== 0) return
    event.preventDefault()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    dragRef.current = event.pointerId
    setDragging(true)
    onSeedChange?.(seedFromEvent(event))
  }
  const handlePointerMove = (event) => {
    if (dragRef.current !== event.pointerId) return
    event.preventDefault()
    onSeedChange?.(seedFromEvent(event))
  }
  const finishPointer = (event) => {
    if (dragRef.current !== event.pointerId) return
    const next = seedFromEvent(event)
    dragRef.current = null
    setDragging(false)
    onSeedChange?.(next)
    onSeedCommit?.(next)
  }
  const cancelPointer = (event) => {
    if (dragRef.current !== event.pointerId) return
    dragRef.current = null
    setDragging(false)
    onSeedCommit?.(safeSeed)
  }
  const handleKeyDown = (event) => {
    const delta = compact ? 0.024 : 0.016
    const offset = {
      ArrowLeft: [-delta, 0],
      ArrowRight: [delta, 0],
      ArrowUp: [0, -delta],
      ArrowDown: [0, delta],
    }[event.key]
    if (!offset) return
    event.preventDefault()
    const next = normalizePoincareSeed({ x: safeSeed.x + offset[0], y: safeSeed.y + offset[1] })
    onSeedChange?.(next)
    onSeedCommit?.(next)
  }

  return (
    <section
      ref={pointerField.elementRef}
      className={`poincare-field poincare-plan-field${compact ? ' is-compact' : ''}${dragging ? ' is-dragging' : ''}`}
      data-seed={`${safeSeed.x.toFixed(3)},${safeSeed.y.toFixed(3)}`}
      data-scar={artifact?.scar ? 'present' : 'absent'}
      data-passage={passageActive ? 'active' : 'dormant'}
      role="application"
      tabIndex={0}
      aria-label="Déplacer la condition initiale. Les flèches ajustent le point."
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointer}
      onPointerCancel={cancelPointer}
      onKeyDown={handleKeyDown}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      <output className="poincare-coordinate">x₀ {safeSeed.x.toFixed(3)} · y₀ {safeSeed.y.toFixed(3)}</output>
    </section>
  )
}
