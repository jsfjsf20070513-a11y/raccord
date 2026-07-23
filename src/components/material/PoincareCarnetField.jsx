import { useEffect, useMemo, useRef } from 'react'
import { createPoincareSignature, createPoincareSky, normalizePoincareSeed } from './poincareSkyMath'
import './PoincareSkyFields.css'

const INK = '#201d1a'
const OXBLOOD = '#7f302b'

function rgba(hex, alpha) {
  const value = Number.parseInt(hex.replace('#', ''), 16)
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`
}

function strokeSignature(context, signature, width, height, padding, color, alpha, local = null, offset = 0, secondary = false) {
  context.lineCap = 'round'
  context.lineJoin = 'round'
  const usableWidth = width - padding * 2
  const amplitude = height * 0.14
  const anchors = signature.map((sample) => {
    const value = secondary ? sample.secondary + sample.divergence * 0.42 : sample.primary
    return {
      x: padding + sample.progress * usableWidth,
      y: height * 0.54 - value * amplitude + offset,
    }
  })
  anchors.slice(0, -1).forEach((start, index) => {
    const control = anchors[index + 1]
    const after = anchors[index + 2]
    const end = after
      ? { x: (control.x + after.x) * 0.5, y: (control.y + after.y) * 0.5 }
      : control
    const midpoint = { x: (start.x + end.x) * 0.5, y: (start.y + end.y) * 0.5 }
    const localStrength = local
      ? Math.max(0, 1 - Math.hypot(midpoint.x - local.x, midpoint.y - local.y) / local.radius)
      : 0
    const visible = local ? localStrength * local.progress : 1
    if (visible <= 0.002 && local) return
    context.strokeStyle = rgba(color, alpha * (local ? visible : 1))
    context.lineWidth = 0.55 + visible * 0.45
    context.beginPath()
    context.moveTo(start.x, start.y)
    context.quadraticCurveTo(control.x, control.y, end.x, end.y)
    context.stroke()
  })
}

function drawWitness(context, signature, artifact, width, height, padding, compact) {
  const first = signature[0]
  if (!first) return
  const origin = { x: padding, y: height * 0.54 - first.primary * height * 0.14 }
  context.strokeStyle = rgba(OXBLOOD, 0.34)
  context.lineWidth = 0.65
  context.beginPath()
  context.arc(origin.x, origin.y, compact ? 5 : 6, 0, Math.PI * 2)
  context.stroke()
  context.fillStyle = rgba(OXBLOOD, 0.86)
  context.beginPath()
  context.arc(origin.x, origin.y, compact ? 1.8 : 2.2, 0, Math.PI * 2)
  context.fill()

  if (!artifact?.scar) return
  const scarIndex = Math.min(signature.length - 1, Math.round(artifact.scar.progress * (signature.length - 1)))
  const scar = signature[scarIndex]
  const scarX = padding + scar.progress * (width - padding * 2)
  const scarY = height * 0.54 - scar.primary * height * 0.14
  context.strokeStyle = rgba(OXBLOOD, 0.54)
  context.lineWidth = 0.7
  context.beginPath()
  context.moveTo(scarX - 1.6, scarY - (compact ? 17 : 24))
  context.lineTo(scarX + 2.4, scarY + (compact ? 18 : 25))
  context.stroke()
}

export default function PoincareCarnetField({ compact = false, artifact, passageActive = false }) {
  const canvasRef = useRef(null)
  const hostRef = useRef(null)
  const stillTimerRef = useRef(0)
  const readingRef = useRef({ active: false, x: 0, y: 0 })
  const drawRef = useRef(() => {})
  const memory = useMemo(() => artifact?.memory || [], [artifact?.memory])
  const seed = useMemo(() => normalizePoincareSeed(artifact?.seed), [artifact?.seed])
  const currentSky = useMemo(() => createPoincareSky(seed), [seed])
  const currentSignature = useMemo(() => createPoincareSignature(currentSky, 7), [currentSky])
  const rememberedSignatures = useMemo(() => memory.map((entry) => ({
    id: entry.id,
    signature: createPoincareSignature(createPoincareSky(entry.seed), 7),
  })), [memory])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return undefined
    let size = { width: 1, height: 1, dpr: 1 }

    const draw = () => {
      const { width, height, dpr } = size
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, width, height)
      if (passageActive) return
      const padding = compact ? 26 : Math.min(92, width * 0.07)
      rememberedSignatures.forEach((entry, index) => {
        strokeSignature(context, entry.signature, width, height, padding, OXBLOOD, 0.2 + index * 0.016, {
          ...readingRef.current,
          radius: Math.min(width, height) * (compact ? 0.42 : 0.34),
          progress: readingRef.current.active ? 1 : 0,
        }, (index - rememberedSignatures.length * 0.5) * 2.4)
      })
      strokeSignature(context, currentSignature, width, height, padding, INK, compact ? 0.3 : 0.36)
      if (readingRef.current.active) {
        strokeSignature(context, currentSignature, width, height, padding, OXBLOOD, 0.5, {
          ...readingRef.current,
          radius: Math.min(width, height) * (compact ? 0.42 : 0.34),
          progress: 1,
        }, 0, true)
      }
      drawWitness(context, currentSignature, artifact, width, height, padding, compact)
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
    resize()
    return () => observer.disconnect()
  }, [artifact, compact, currentSignature, passageActive, rememberedSignatures])

  useEffect(() => () => window.clearTimeout(stillTimerRef.current), [])

  const placeReading = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    readingRef.current = {
      active: false,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
    window.clearTimeout(stillTimerRef.current)
    drawRef.current()
    stillTimerRef.current = window.setTimeout(() => {
      readingRef.current.active = true
      drawRef.current()
      hostRef.current?.setAttribute('data-reading', 'awake')
    }, 520)
  }
  const sleep = () => {
    window.clearTimeout(stillTimerRef.current)
    readingRef.current.active = false
    drawRef.current()
    hostRef.current?.setAttribute('data-reading', 'dormant')
  }
  const handleKeyDown = (event) => {
    if (!['Enter', ' '].includes(event.key)) return
    event.preventDefault()
    const rect = event.currentTarget.getBoundingClientRect()
    readingRef.current = { active: true, x: rect.width * 0.56, y: rect.height * 0.5 }
    event.currentTarget.setAttribute('data-reading', 'awake')
    drawRef.current()
  }

  return (
    <section
      ref={hostRef}
      className={`poincare-field poincare-carnet-field${compact ? ' is-compact' : ''}`}
      data-memory-count={memory.length}
      data-seed={`${seed.x.toFixed(3)},${seed.y.toFixed(3)}`}
      data-scar={artifact?.scar ? 'present' : 'absent'}
      data-passage={passageActive ? 'active' : 'dormant'}
      data-reading="dormant"
      role="group"
      tabIndex={0}
      aria-label="Mémoire du ciel. Rester immobile pour révéler les trajectoires conservées."
      onPointerMove={placeReading}
      onPointerLeave={sleep}
      onBlur={sleep}
      onKeyDown={handleKeyDown}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      <output className="poincare-memory-count">mémoire {String(memory.length).padStart(2, '0')}</output>
    </section>
  )
}
