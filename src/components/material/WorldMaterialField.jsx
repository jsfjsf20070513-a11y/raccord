import { useEffect, useRef } from 'react'
import { clamp, createProximityField } from './materialMath'

const TWO_PI = Math.PI * 2

function noise(index, seed = 1) {
  const value = Math.sin(index * 12.9898 + seed * 78.233) * 43758.5453
  return value - Math.floor(value)
}

function rgba(hex, alpha) {
  const normalized = hex.replace('#', '')
  const value = Number.parseInt(normalized, 16)
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`
}

function drawPlan(context, width, height, field, awaken) {
  const accent = '#1a23e6'
  const ink = '#121211'
  const gap = clamp(Math.round(width / 13), 22, 34)
  const segment = gap * 0.5
  const surface = createProximityField({
    width,
    height,
    field,
    radiusX: Math.min(width * 0.34, height * 0.62),
    radiusY: height * 0.46,
    inner: 0.06,
    rotation: field.signedX * 0.06,
  })

  // Underlayer: a restrained embossed registry that exists while dormant.
  context.lineWidth = 0.6
  for (let x = gap; x < width; x += gap) {
    context.beginPath()
    context.moveTo(x + 0.6, 0)
    context.lineTo(x + 0.6, height)
    context.strokeStyle = rgba('#ffffff', awaken * 0.12)
    context.stroke()
    context.beginPath()
    context.moveTo(x, 0)
    context.lineTo(x, height)
    context.strokeStyle = rgba(ink, awaken * 0.032)
    context.stroke()
  }
  for (let y = gap; y < height; y += gap) {
    context.beginPath()
    context.moveTo(0, y + 0.6)
    context.lineTo(width, y + 0.6)
    context.strokeStyle = rgba('#ffffff', awaken * 0.12)
    context.stroke()
    context.beginPath()
    context.moveTo(0, y)
    context.lineTo(width, y)
    context.strokeStyle = rgba(ink, awaken * 0.032)
    context.stroke()
  }

  // Surface layer: cobalt calibration ink is revealed only inside the field.
  context.lineWidth = 0.7

  for (let x = gap; x < width; x += gap) {
    for (let y = 0; y < height; y += segment) {
      const midpointY = y + segment * 0.5
      const local = surface.sample(x, midpointY)
      const pull = local * 0.038
      const adjustedX = x + (surface.pointerX - x) * pull
      context.beginPath()
      context.moveTo(adjustedX, y)
      context.lineTo(adjustedX, Math.min(height, y + segment + 0.8))
      context.strokeStyle = rgba(accent, awaken * local * 0.36)
      context.stroke()
    }
  }

  for (let y = gap; y < height; y += gap) {
    for (let x = 0; x < width; x += segment) {
      const midpointX = x + segment * 0.5
      const local = surface.sample(midpointX, y)
      const pull = local * 0.038
      const adjustedY = y + (surface.pointerY - y) * pull
      context.beginPath()
      context.moveTo(x, adjustedY)
      context.lineTo(Math.min(width, x + segment + 0.8), adjustedY)
      context.strokeStyle = rgba(accent, awaken * local * 0.36)
      context.stroke()
    }
  }

  for (let x = gap; x < width; x += gap) {
    for (let y = gap; y < height; y += gap) {
      const local = surface.sample(x, y)
      if (local < 0.018) continue
      const pull = local * 0.038
      const pointX = x + (surface.pointerX - x) * pull
      const pointY = y + (surface.pointerY - y) * pull
      context.beginPath()
      context.arc(pointX, pointY, 0.45 + local * 1.05, 0, TWO_PI)
      context.fillStyle = rgba(ink, awaken * local * 0.58)
      context.fill()
    }
  }

  if (field.active > 0.01) {
    const snapX = Math.round(surface.pointerX / gap) * gap
    const snapY = Math.round(surface.pointerY / gap) * gap
    const opacity = awaken * field.active * 0.68
    context.strokeStyle = rgba(accent, opacity)
    context.lineWidth = 1
    context.beginPath()
    context.moveTo(snapX - 9, snapY)
    context.lineTo(snapX + 9, snapY)
    context.moveTo(snapX, snapY - 9)
    context.lineTo(snapX, snapY + 9)
    context.stroke()

    context.beginPath()
    context.moveTo(surface.pointerX, surface.pointerY)
    context.lineTo(snapX, snapY)
    context.strokeStyle = rgba(accent, opacity * 0.32)
    context.lineWidth = 0.6
    context.stroke()
  }
}

function drawCarnet(context, width, height, field, awaken) {
  const ink = '#1a1a1a'
  const accent = '#8b0000'
  const surface = createProximityField({
    width,
    height,
    field,
    radiusX: width * 0.31,
    radiusY: height * 0.34,
    inner: 0.04,
    rotation: field.signedX * 0.12,
  })

  // Underlayer: pressed ruling and seal traces are present beneath the fibres.
  for (let y = height * 0.34; y <= height * 0.72; y += 18) {
    for (let x = 0; x < width; x += 7) {
      const local = surface.sample(x, y)
      if (local < 0.012) continue
      context.beginPath()
      context.moveTo(x, y)
      context.lineTo(Math.min(width, x + 7.4), y)
      context.strokeStyle = rgba(accent, awaken * local * 0.095)
      context.lineWidth = 0.55
      context.stroke()
    }
  }

  // Surface layer: fibres are gently pressed aside, revealing the underlayer.
  context.lineCap = 'round'
  for (let index = 0; index < 118; index += 1) {
    const x = noise(index, 2) * width
    const y = noise(index, 5) * height
    const length = 16 + noise(index, 7) * 92
    const rise = (noise(index, 11) - 0.5) * 5
    const midpointX = x + length * 0.5
    const midpointY = y + rise * 0.5
    const local = surface.sample(midpointX, midpointY)
    const direction = surface.direction(midpointX, midpointY)
    const push = local * 3.2
    const startX = x + direction.x * push
    const startY = y + direction.y * push

    context.beginPath()
    context.moveTo(startX, startY)
    context.quadraticCurveTo(
      startX + length * 0.45,
      startY + rise * (1 - local * 0.7),
      startX + length,
      startY + rise * 0.35,
    )
    context.strokeStyle = rgba(ink, awaken * (0.024 - local * 0.017))
    context.lineWidth = 0.35 + noise(index, 13) * 0.45
    context.stroke()
  }

  if (field.active > 0.01) {
    const opacity = awaken * field.active
    context.save()
    context.translate(surface.pointerX, surface.pointerY)
    context.rotate(field.signedX * 0.08)
    for (let ring = 0; ring < 3; ring += 1) {
      context.beginPath()
      context.ellipse(0, 0, 30 + ring * 15, 8 + ring * 4, 0, Math.PI * 0.1, Math.PI * 0.9)
      context.strokeStyle = rgba(accent, opacity * (0.11 - ring * 0.022))
      context.lineWidth = 0.7
      context.stroke()
    }
    context.restore()
  }
}

function drawLimite(context, width, height, field, awaken) {
  const accent = '#ff4d2e'
  const bone = '#ece7dd'
  const baseline = height * 0.64
  const step = 4
  const surface = createProximityField({
    width,
    height,
    field,
    radiusX: width * 0.27,
    radiusY: height * 0.46,
    inner: 0.05,
    rotation: -0.12 * field.signedX,
  })

  context.save()
  context.translate(surface.pointerX, surface.pointerY)
  context.rotate(-0.42 + field.signedX * 0.06)
  const reflection = context.createLinearGradient(-52, 0, 52, 0)
  reflection.addColorStop(0, rgba(bone, 0))
  reflection.addColorStop(0.48, rgba(bone, awaken * field.active * 0.045))
  reflection.addColorStop(0.52, rgba(bone, awaken * field.active * 0.11))
  reflection.addColorStop(1, rgba(bone, 0))
  context.fillStyle = reflection
  context.fillRect(-52, -height, 104, height * 2)
  context.restore()

  for (let x = 0; x < width - step; x += step) {
    const midpoint = x + step * 0.5
    const local = surface.sample(midpoint, baseline)
    const amplitude = 4 + local * 17
    const phase = (x / width) * Math.PI * 7.5
    const nextPhase = ((x + step) / width) * Math.PI * 7.5
    const y = baseline + Math.sin(phase) * amplitude + Math.sin(phase * 0.38) * 2
    const nextY = baseline + Math.sin(nextPhase) * amplitude + Math.sin(nextPhase * 0.38) * 2

    context.beginPath()
    context.moveTo(x, y)
    context.lineTo(x + step + 0.5, nextY)
    context.strokeStyle = rgba(accent, awaken * (0.14 + local * 0.76))
    context.lineWidth = 0.8 + local * 1.15
    context.stroke()
  }

  if (field.active > 0.01) {
    const opacity = awaken * field.active * 0.2
    context.strokeStyle = rgba(bone, opacity)
    context.lineWidth = 0.7
    context.beginPath()
    context.moveTo(surface.pointerX - 42, surface.pointerY + 12)
    context.bezierCurveTo(
      surface.pointerX - 18,
      surface.pointerY - 14,
      surface.pointerX + 18,
      surface.pointerY - 14,
      surface.pointerX + 42,
      surface.pointerY + 12,
    )
    context.stroke()
  }
}

const DRAWERS = {
  plan: drawPlan,
  carnet: drawCarnet,
  limite: drawLimite,
}

export default function WorldMaterialField({ world, pointerField, awakenProgress = 1 }) {
  const canvasRef = useRef(null)
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 })
  const fieldRef = useRef(pointerField.getField())
  const awakenRef = useRef(awakenProgress)
  const drawRef = useRef(null)

  awakenRef.current = awakenProgress

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return undefined

    const draw = () => {
      const { width, height, dpr } = sizeRef.current
      if (!width || !height) return

      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, width, height)
      DRAWERS[world]?.(context, width, height, fieldRef.current, awakenRef.current)
    }
    drawRef.current = draw

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const width = Math.max(1, Math.round(rect.width))
      const height = Math.max(1, Math.round(rect.height))
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      sizeRef.current = { width, height, dpr }
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      draw()
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    const unsubscribe = pointerField.subscribe((field) => {
      fieldRef.current = field
      draw()
    })
    resize()

    return () => {
      unsubscribe()
      resizeObserver.disconnect()
      drawRef.current = null
    }
  }, [pointerField, world])

  useEffect(() => {
    drawRef.current?.()
  }, [awakenProgress])

  return <canvas ref={canvasRef} className="world-material-canvas" aria-hidden="true" />
}
