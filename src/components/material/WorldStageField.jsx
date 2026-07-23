import { useEffect, useRef } from 'react'

const TAU = Math.PI * 2

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

function noise(index, seed = 1) {
  const value = Math.sin(index * 12.9898 + seed * 78.233) * 43758.5453
  return value - Math.floor(value)
}

function drawGrid(context, width, height, field, mode) {
  const gap = clamp(Math.round(width / 30), 28, 46)
  const sigma = Math.min(190, Math.max(120, width * 0.14))
  const sigmaSquared = 2 * sigma * sigma
  const active = field.active
  const strength = (mode === 'plan' ? 36 : 58) * active
  const ink = mode === 'plan' ? '26, 35, 230' : '232, 230, 223'
  const alpha = mode === 'plan' ? 0.17 : 0.14

  const displaced = (x, y) => {
    if (active < 0.001) return [x, y]
    const dx = field.x - x
    const dy = field.y - y
    const distanceSquared = dx * dx + dy * dy
    const distance = Math.sqrt(distanceSquared) || 1
    const pull = strength * Math.exp(-distanceSquared / sigmaSquared)
    return [x + (dx / distance) * pull, y + (dy / distance) * pull]
  }

  context.lineWidth = mode === 'plan' ? 0.72 : 0.78
  context.strokeStyle = `rgba(${ink}, ${alpha})`

  for (let y = 0; y <= height + gap; y += gap) {
    context.beginPath()
    for (let x = 0; x <= width + gap; x += gap) {
      const [nextX, nextY] = displaced(x, y)
      if (x === 0) context.moveTo(nextX, nextY)
      else context.lineTo(nextX, nextY)
    }
    context.stroke()
  }

  for (let x = 0; x <= width + gap; x += gap) {
    context.beginPath()
    for (let y = 0; y <= height + gap; y += gap) {
      const [nextX, nextY] = displaced(x, y)
      if (y === 0) context.moveTo(nextX, nextY)
      else context.lineTo(nextX, nextY)
    }
    context.stroke()
  }

  if (active < 0.01) return

  const ringAlpha = (mode === 'plan' ? 0.22 : 0.12) * active
  context.strokeStyle = `rgba(${ink}, ${ringAlpha})`
  context.lineWidth = 0.65
  for (let ring = 0; ring < 2; ring += 1) {
    context.beginPath()
    context.ellipse(
      field.x,
      field.y,
      sigma * (0.34 + ring * 0.23),
      sigma * (0.17 + ring * 0.12),
      field.signedX * 0.11,
      0,
      TAU,
    )
    context.stroke()
  }

  if (mode === 'plan') {
    const snapX = Math.round(field.x / gap) * gap
    const snapY = Math.round(field.y / gap) * gap
    context.strokeStyle = `rgba(${ink}, ${0.52 * active})`
    context.lineWidth = 0.9
    context.beginPath()
    context.moveTo(snapX - 10, snapY)
    context.lineTo(snapX + 10, snapY)
    context.moveTo(snapX, snapY - 10)
    context.lineTo(snapX, snapY + 10)
    context.stroke()
  }
}

function drawCarnet(context, width, height, field, trail) {
  for (let index = 0; index < 150; index += 1) {
    const x = noise(index, 3) * width
    const y = noise(index, 7) * height
    const length = 18 + noise(index, 11) * 76
    const rise = (noise(index, 13) - 0.5) * 4
    context.beginPath()
    context.moveTo(x, y)
    context.quadraticCurveTo(x + length * 0.45, y + rise, x + length, y + rise * 0.45)
    context.strokeStyle = 'rgba(52, 40, 25, 0.032)'
    context.lineWidth = 0.35 + noise(index, 17) * 0.38
    context.stroke()
  }

  if (trail.length < 2 || field.active < 0.001) return

  context.lineCap = 'round'
  context.lineJoin = 'round'
  for (let index = 1; index < trail.length; index += 1) {
    const previous = trail[index - 1]
    const point = trail[index]
    const age = index / trail.length
    context.beginPath()
    context.moveTo(previous.x, previous.y)
    context.quadraticCurveTo(
      (previous.x + point.x) * 0.5,
      previous.y + (point.y - previous.y) * 0.34,
      point.x,
      point.y,
    )
    context.strokeStyle = `rgba(139, 0, 0, ${(0.055 + age * 0.26) * field.active})`
    context.lineWidth = 0.8 + age * 1.35
    context.stroke()
  }

  if (field.active > 0.01) {
    context.beginPath()
    context.ellipse(field.x, field.y, 34, 9, field.signedX * 0.08, 0.1, Math.PI - 0.1)
    context.strokeStyle = `rgba(139, 0, 0, ${field.active * 0.14})`
    context.lineWidth = 0.75
    context.stroke()
  }
}

function drawLimite(context, width, height, field) {
  const baseline = height * 0.58
  const active = field.active

  context.strokeStyle = 'rgba(236, 231, 221, 0.055)'
  context.lineWidth = 0.6
  for (let x = 0; x < width; x += 72) {
    context.beginPath()
    context.moveTo(x, baseline - 5)
    context.lineTo(x, baseline + 5)
    context.stroke()
  }

  for (let x = 0; x < width - 4; x += 4) {
    const midpoint = x + 2
    const dx = (midpoint - field.x) / Math.max(1, width * 0.22)
    const dy = (baseline - field.y) / Math.max(1, height * 0.32)
    const local = active * Math.exp(-(dx * dx + dy * dy) * 2.4)
    const phase = (x / width) * Math.PI * 11
    const nextPhase = ((x + 4) / width) * Math.PI * 11
    const amplitude = 2 + local * 24
    const y = baseline + Math.sin(phase) * amplitude
    const nextY = baseline + Math.sin(nextPhase) * amplitude
    context.beginPath()
    context.moveTo(x, y)
    context.lineTo(x + 4.5, nextY)
    context.strokeStyle = `rgba(255, 77, 46, ${0.105 + local * 0.64})`
    context.lineWidth = 0.7 + local * 1.05
    context.stroke()
  }

  if (active < 0.01) return
  const reflection = context.createLinearGradient(field.x - 90, 0, field.x + 90, 0)
  reflection.addColorStop(0, 'rgba(236, 231, 221, 0)')
  reflection.addColorStop(0.5, `rgba(236, 231, 221, ${active * 0.042})`)
  reflection.addColorStop(1, 'rgba(236, 231, 221, 0)')
  context.fillStyle = reflection
  context.fillRect(field.x - 90, 0, 180, height)
}

export default function WorldStageField({ mode = 'idle', pointerField }) {
  const canvasRef = useRef(null)
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 })
  const fieldRef = useRef(pointerField.getField())
  const modeRef = useRef(mode)
  const trailRef = useRef([])
  const drawRef = useRef(null)

  modeRef.current = mode

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return undefined

    const draw = () => {
      const { width, height, dpr } = sizeRef.current
      if (!width || !height) return
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, width, height)

      if (modeRef.current === 'idle' || modeRef.current === 'plan') {
        drawGrid(context, width, height, fieldRef.current, modeRef.current)
      } else if (modeRef.current === 'carnet') {
        drawCarnet(context, width, height, fieldRef.current, trailRef.current)
      } else if (modeRef.current === 'limite') {
        drawLimite(context, width, height, fieldRef.current)
      }
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
      if (modeRef.current === 'carnet' && field.active > 0.01) {
        const trail = trailRef.current
        const previous = trail.at(-1)
        if (!previous || Math.hypot(field.x - previous.x, field.y - previous.y) > 8) {
          trail.push({ x: field.x, y: field.y })
          if (trail.length > 88) trail.splice(0, trail.length - 88)
        }
      } else if (modeRef.current === 'carnet' && field.active <= 0.001) {
        trailRef.current = []
      }
      draw()
    })
    resize()

    return () => {
      unsubscribe()
      resizeObserver.disconnect()
      drawRef.current = null
    }
  }, [pointerField])

  useEffect(() => {
    trailRef.current = []
    drawRef.current?.()
  }, [mode])

  return <canvas ref={canvasRef} className="enter-stage-field" aria-hidden="true" />
}
