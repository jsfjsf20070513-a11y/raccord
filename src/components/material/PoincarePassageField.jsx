import { useEffect, useMemo, useRef } from 'react'
import { createPoincareSignature, createPoincareSky } from './poincareSkyMath'
import './PoincarePassageField.css'

const WORLD_COLORS = Object.freeze({
  plan: '#2e3fbd',
  carnet: '#7f302b',
  limite: '#d9614d',
})

function colorChannels(hex) {
  const value = Number.parseInt(hex.replace('#', ''), 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

function mixedColor(from, to, progress, alpha) {
  const start = colorChannels(from)
  const end = colorChannels(to)
  const channels = start.map((value, index) => Math.round(value + (end[index] - value) * progress))
  return `rgba(${channels.join(', ')}, ${alpha})`
}

function drawSmoothSignature(context, signature, geometry, secondary = false) {
  const anchors = signature.map((sample, index) => ({
    x: geometry.left + sample.progress * (geometry.right - geometry.left),
    y: index === 0
      ? geometry.originY
      : geometry.centerY - (secondary ? sample.secondary : sample.primary) * geometry.amplitude
        + (secondary ? sample.divergence * geometry.divergence : 0),
  }))
  if (!anchors.length) return
  context.beginPath()
  context.moveTo(anchors[0].x, anchors[0].y)
  for (let index = 1; index < anchors.length - 1; index += 1) {
    const current = anchors[index]
    const next = anchors[index + 1]
    context.quadraticCurveTo(current.x, current.y, (current.x + next.x) * 0.5, (current.y + next.y) * 0.5)
  }
  const last = anchors.at(-1)
  context.lineTo(last.x, last.y)
  context.stroke()
}

function worldGeometry(world, width, height, compact, seed, signature) {
  const first = signature[0] || { primary: 0 }
  if (world === 'plan') {
    return {
      left: seed.x * width,
      right: width * 0.95,
      centerY: seed.y * height,
      originY: seed.y * height,
      amplitude: height * 0.36,
      divergence: height * 0.19,
    }
  }
  if (world === 'carnet') {
    const padding = compact ? 26 : Math.min(92, width * 0.07)
    return {
      left: padding,
      right: width - padding,
      centerY: height * 0.54,
      originY: height * 0.54 - first.primary * height * 0.14,
      amplitude: height * 0.14,
      divergence: height * 0.06,
    }
  }
  return {
    left: width * (compact ? 0.08 : 0.07),
    right: width * 0.94,
    centerY: height * (compact ? 0.48 : 0.5),
    originY: height * (compact ? 0.48 : 0.5) - first.primary * height * 0.06,
    amplitude: height * 0.06,
    divergence: height * (compact ? 0.22 : 0.28),
  }
}

function mixGeometry(from, to, progress) {
  return Object.fromEntries(Object.keys(from).map((key) => [
    key,
    from[key] + (to[key] - from[key]) * progress,
  ]))
}

export default function PoincarePassageField({
  artifact,
  from,
  to,
  compact = false,
  onMidpoint,
  onComplete,
}) {
  const canvasRef = useRef(null)
  const sky = useMemo(() => createPoincareSky(artifact?.seed), [artifact?.seed])
  const signature = useMemo(
    () => createPoincareSignature(sky, 9),
    [sky],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return undefined

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      onMidpoint?.()
      onComplete?.()
      return undefined
    }

    const rect = canvas.getBoundingClientRect()
    const width = Math.max(1, Math.round(rect.width))
    const height = Math.max(1, Math.round(rect.height))
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    context.lineCap = 'round'
    context.lineJoin = 'round'

    const fromGeometry = worldGeometry(from, width, height, compact, sky.seed, signature)
    const toGeometry = worldGeometry(to, width, height, compact, sky.seed, signature)
    const duration = compact ? 640 : 760
    let frame = 0
    let startedAt = 0
    let midpointSent = false

    const draw = (time) => {
      if (!startedAt) startedAt = time
      const progress = Math.min(1, (time - startedAt) / duration)
      const envelope = Math.sin(Math.PI * progress)
      const geometry = mixGeometry(fromGeometry, toGeometry, progress)
      const color = mixedColor(WORLD_COLORS[from], WORLD_COLORS[to], progress, envelope * 0.9)
      context.clearRect(0, 0, width, height)

      context.strokeStyle = mixedColor(WORLD_COLORS[from], WORLD_COLORS[to], progress, envelope * 0.34)
      context.lineWidth = 0.8
      context.setLineDash([5, 9])
      drawSmoothSignature(context, signature, geometry, true)
      context.setLineDash([])
      context.strokeStyle = color
      context.lineWidth = compact ? 1.15 : 1.3
      drawSmoothSignature(context, signature, geometry)

      context.strokeStyle = mixedColor(WORLD_COLORS[from], WORLD_COLORS[to], progress, envelope * 0.48)
      context.lineWidth = 0.7
      context.beginPath()
      context.arc(geometry.left, geometry.originY, compact ? 7 : 9, 0, Math.PI * 2)
      context.stroke()
      context.fillStyle = color
      context.beginPath()
      context.arc(geometry.left, geometry.originY, compact ? 2.2 : 2.6, 0, Math.PI * 2)
      context.fill()

      if (artifact?.scar) {
        const scarX = geometry.left + artifact.scar.progress * (geometry.right - geometry.left)
        const scarIndex = Math.min(signature.length - 1, Math.round(artifact.scar.progress * (signature.length - 1)))
        const scarY = geometry.centerY - (signature[scarIndex]?.primary || 0) * geometry.amplitude
        context.strokeStyle = mixedColor(WORLD_COLORS[from], WORLD_COLORS[to], progress, envelope * 0.7)
        context.lineWidth = 0.75
        context.beginPath()
        context.moveTo(scarX - 1.8, scarY - (compact ? 30 : 42))
        context.lineTo(scarX + 2.7, scarY + (compact ? 31 : 43))
        context.stroke()
      }

      if (!midpointSent && progress >= 0.5) {
        midpointSent = true
        onMidpoint?.()
      }
      if (progress < 1) frame = window.requestAnimationFrame(draw)
      else onComplete?.()
    }

    frame = window.requestAnimationFrame(draw)
    return () => window.cancelAnimationFrame(frame)
  }, [artifact?.scar, compact, from, onComplete, onMidpoint, signature, sky.seed, to])

  return <canvas ref={canvasRef} className="poincare-passage-field" aria-hidden="true" />
}
