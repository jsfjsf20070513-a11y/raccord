import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  CURVE_MODEL,
  FRAME_BRACES,
  FRAME_NODES,
  TRANSFORM_LIBRARY,
  TRANSFORM_TARGET_STEPS,
  clamp,
  composeTransforms,
  createCurveJoin,
  cubicDerivative,
  cubicPoint,
  curveJoinMetrics,
  isExactRaccordCalibration,
  matrixMetrics,
  rigidityMetrics,
  signedCurvature,
  snapRaccordHandle,
} from './planPrototypeMath'
import './PlanPrototypeSurface.css'

const COLORS = {
  paper: '#efede6',
  ink: '#171716',
  accent: '#2e3fbd',
  muted: '#595853',
}

function rgba(hex, alpha) {
  const normalized = hex.replace('#', '')
  const value = Number.parseInt(normalized, 16)
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`
}

function distanceToSegment(point, start, end) {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const lengthSquared = dx * dx + dy * dy || 1
  const amount = clamp(((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared)
  return Math.hypot(point.x - (start.x + dx * amount), point.y - (start.y + dy * amount))
}

function createMapper(width, height, compact) {
  const paddingX = compact ? 22 : 46
  const paddingY = compact ? 24 : 34
  const usableWidth = Math.max(1, width - paddingX * 2)
  const usableHeight = Math.max(1, height - paddingY * 2)
  const map = (point) => ({
    x: paddingX + point.x * usableWidth,
    y: paddingY + point.y * usableHeight,
  })
  const unmap = (point) => ({
    x: clamp((point.x - paddingX) / usableWidth),
    y: clamp((point.y - paddingY) / usableHeight),
  })
  return { map, unmap, usableWidth, usableHeight }
}

function drawGrid(context, width, height, compact) {
  context.fillStyle = COLORS.paper
  context.fillRect(0, 0, width, height)
  const gap = compact ? 24 : 32
  context.lineWidth = 0.6
  context.strokeStyle = rgba(COLORS.ink, 0.052)
  for (let x = 0.5; x <= width; x += gap) {
    context.beginPath()
    context.moveTo(x, 0)
    context.lineTo(x, height)
    context.stroke()
  }
  for (let y = 0.5; y <= height; y += gap) {
    context.beginPath()
    context.moveTo(0, y)
    context.lineTo(width, y)
    context.stroke()
  }
}

function strokeBezier(context, points, mapper, color, lineWidth = 1.4) {
  context.beginPath()
  for (let index = 0; index <= 90; index += 1) {
    const point = mapper(cubicPoint(points, index / 90))
    if (index === 0) context.moveTo(point.x, point.y)
    else context.lineTo(point.x, point.y)
  }
  context.strokeStyle = color
  context.lineWidth = lineWidth
  context.stroke()
}

function drawCurvatureComb(context, points, mapper, usableWidth, usableHeight, color) {
  context.strokeStyle = color
  context.lineWidth = 0.65
  for (let index = 1; index < 12; index += 1) {
    const t = index / 12
    const point = mapper(cubicPoint(points, t))
    const derivative = cubicDerivative(points, t)
    const dx = derivative.x * usableWidth
    const dy = derivative.y * usableHeight
    const speed = Math.hypot(dx, dy) || 1
    const normal = { x: -dy / speed, y: dx / speed }
    const amount = clamp(signedCurvature(points, t) * 3.4, -28, 28)
    context.beginPath()
    context.moveTo(point.x, point.y)
    context.lineTo(point.x + normal.x * amount, point.y + normal.y * amount)
    context.stroke()
  }
}

function drawCurvePrototype(context, width, height, compact, handle, construction) {
  drawGrid(context, width, height, compact)
  const { map, usableWidth, usableHeight } = createMapper(width, height, compact)
  const { left, right, targetHandle } = createCurveJoin(handle)
  const controlPoints = [...left.slice(0, 3), ...right.slice(1)]

  if (construction?.handle) {
    const archived = createCurveJoin(construction.handle)
    strokeBezier(context, archived.left, map, rgba(COLORS.accent, 0.09), compact ? 2.1 : 2.4)
    strokeBezier(context, archived.right, map, rgba(COLORS.accent, 0.09), compact ? 2.1 : 2.4)
    context.fillStyle = rgba(COLORS.accent, 0.52)
    context.font = `${compact ? 8 : 9}px "JetBrains Mono", monospace`
    context.fillText('C² / 01', width - (compact ? 60 : 76), height - (compact ? 12 : 17))
  }

  context.setLineDash([4, 5])
  context.beginPath()
  controlPoints.forEach((point, index) => {
    const mapped = map(point)
    if (index === 0) context.moveTo(mapped.x, mapped.y)
    else context.lineTo(mapped.x, mapped.y)
  })
  context.strokeStyle = rgba(COLORS.muted, 0.34)
  context.lineWidth = 0.8
  context.stroke()
  context.setLineDash([])

  drawCurvatureComb(context, left, map, usableWidth, usableHeight, rgba(COLORS.ink, 0.16))
  drawCurvatureComb(context, right, map, usableWidth, usableHeight, rgba(COLORS.accent, 0.22))
  strokeBezier(context, left, map, COLORS.ink, compact ? 1.4 : 1.6)
  strokeBezier(context, right, map, COLORS.accent, compact ? 1.5 : 1.8)

  const join = map(left[3])
  const target = map(targetHandle)
  const active = map(handle)
  context.strokeStyle = rgba(COLORS.accent, 0.28)
  context.lineWidth = 0.7
  context.beginPath()
  context.moveTo(target.x - 8, target.y)
  context.lineTo(target.x + 8, target.y)
  context.moveTo(target.x, target.y - 8)
  context.lineTo(target.x, target.y + 8)
  context.stroke()

  context.fillStyle = COLORS.ink
  context.fillRect(join.x - 3.5, join.y - 3.5, 7, 7)
  context.beginPath()
  context.arc(active.x, active.y, compact ? 7 : 8, 0, Math.PI * 2)
  context.fillStyle = COLORS.paper
  context.fill()
  context.strokeStyle = COLORS.accent
  context.lineWidth = 1.6
  context.stroke()

  context.fillStyle = COLORS.muted
  context.font = '500 10px "JetBrains Mono", monospace'
  context.fillText('RACCORD', join.x + 10, join.y - 10)
  context.fillStyle = COLORS.accent
  context.fillText('P₁', active.x + 11, active.y - 8)
}

function drawFramePrototype(context, width, height, compact, braceMask) {
  drawGrid(context, width, height, compact)
  const { map } = createMapper(width, height, compact)
  const metrics = rigidityMetrics(braceMask)

  context.lineCap = 'round'
  metrics.edges.slice(0, 4).forEach(([from, to]) => {
    const start = map(FRAME_NODES[from])
    const end = map(FRAME_NODES[to])
    context.beginPath()
    context.moveTo(start.x, start.y)
    context.lineTo(end.x, end.y)
    context.strokeStyle = COLORS.ink
    context.lineWidth = compact ? 1.5 : 1.8
    context.stroke()
  })

  FRAME_BRACES.forEach(([from, to], index) => {
    const start = map(FRAME_NODES[from])
    const end = map(FRAME_NODES[to])
    const active = Boolean(braceMask & (1 << index))
    context.setLineDash(active ? [] : [6, 7])
    context.beginPath()
    context.moveTo(start.x, start.y)
    context.lineTo(end.x, end.y)
    context.strokeStyle = active ? COLORS.accent : rgba(COLORS.accent, 0.23)
    context.lineWidth = active ? 2.2 : 0.9
    context.stroke()
  })
  context.setLineDash([])

  FRAME_NODES.forEach((node, index) => {
    const point = map(node)
    context.beginPath()
    context.arc(point.x, point.y, compact ? 5 : 6, 0, Math.PI * 2)
    context.fillStyle = COLORS.paper
    context.fill()
    context.strokeStyle = COLORS.ink
    context.lineWidth = 1.4
    context.stroke()
    context.fillStyle = COLORS.muted
    context.font = '500 10px "JetBrains Mono", monospace'
    context.fillText(`N${index + 1}`, point.x + 10, point.y - 9)
  })
}

function transformPoint(matrix, point) {
  return {
    x: matrix[0] * point.x + matrix[1] * point.y,
    y: matrix[2] * point.x + matrix[3] * point.y,
  }
}

function drawTransformedGrid(context, matrix, center, scaleAmount, color, alpha, dashed = false) {
  context.save()
  context.beginPath()
  context.rect(0, 0, center.x * 2, center.y * 2)
  context.clip()
  context.setLineDash(dashed ? [4, 6] : [])
  context.strokeStyle = rgba(color, alpha)
  context.lineWidth = dashed ? 0.7 : 1
  for (let coordinate = -3; coordinate <= 3; coordinate += 0.5) {
    const verticalStart = transformPoint(matrix, { x: coordinate, y: -3 })
    const verticalEnd = transformPoint(matrix, { x: coordinate, y: 3 })
    context.beginPath()
    context.moveTo(center.x + verticalStart.x * scaleAmount, center.y - verticalStart.y * scaleAmount)
    context.lineTo(center.x + verticalEnd.x * scaleAmount, center.y - verticalEnd.y * scaleAmount)
    context.stroke()

    const horizontalStart = transformPoint(matrix, { x: -3, y: coordinate })
    const horizontalEnd = transformPoint(matrix, { x: 3, y: coordinate })
    context.beginPath()
    context.moveTo(center.x + horizontalStart.x * scaleAmount, center.y - horizontalStart.y * scaleAmount)
    context.lineTo(center.x + horizontalEnd.x * scaleAmount, center.y - horizontalEnd.y * scaleAmount)
    context.stroke()
  }
  context.restore()
}

function drawTransformPrototype(context, width, height, compact, steps) {
  drawGrid(context, width, height, compact)
  const current = composeTransforms(steps)
  const target = composeTransforms(TRANSFORM_TARGET_STEPS)
  const center = { x: width * 0.5, y: height * (compact ? 0.48 : 0.5) }
  const scaleAmount = Math.min(width, height) * (compact ? 0.145 : 0.125)

  drawTransformedGrid(context, target, center, scaleAmount, COLORS.ink, 0.13, true)
  drawTransformedGrid(context, current, center, scaleAmount, COLORS.accent, 0.52)

  context.strokeStyle = rgba(COLORS.ink, 0.48)
  context.lineWidth = 1
  context.beginPath()
  context.moveTo(0, center.y + 0.5)
  context.lineTo(width, center.y + 0.5)
  context.moveTo(center.x + 0.5, 0)
  context.lineTo(center.x + 0.5, height)
  context.stroke()

  context.fillStyle = COLORS.muted
  context.font = '500 10px "JetBrains Mono", monospace'
  context.fillText('CIBLE', compact ? 10 : 16, compact ? 18 : 22)
  context.strokeStyle = rgba(COLORS.ink, 0.32)
  context.setLineDash([4, 4])
  context.beginPath()
  context.moveTo(compact ? 58 : 66, compact ? 15 : 19)
  context.lineTo(compact ? 94 : 112, compact ? 15 : 19)
  context.stroke()
  context.setLineDash([])
}

function metricsAnnouncement(variant, metrics) {
  if (variant === 'A') return `Continuité ${metrics.grade}; saut de courbure ${metrics.curvatureJump.toFixed(3)}`
  if (variant === 'B') return `Rang ${metrics.rank}; mobilité ${metrics.mechanisms}; auto-contrainte ${metrics.selfStress}`
  return `Déterminant ${metrics.determinant.toFixed(2)}; résidu ${metrics.residual.toFixed(2)}`
}

export default function PlanPrototypeSurface({
  variant,
  compact = false,
  artifactHandle,
  construction,
  onArtifactHandleChange,
  onConstructionComplete,
  onMetrics,
}) {
  const canvasRef = useRef(null)
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 })
  const drawRef = useRef(null)
  const draggingRef = useRef(false)
  const [internalCurveHandle, setInternalCurveHandle] = useState(CURVE_MODEL.initialHandle)
  const [braceMask, setBraceMask] = useState(0)
  const [steps, setSteps] = useState([])
  const isControlled = artifactHandle != null
  const curveHandle = isControlled ? artifactHandle : internalCurveHandle
  const curveHandleRef = useRef(curveHandle)
  curveHandleRef.current = curveHandle

  const setCurveHandle = useCallback((nextValue) => {
    const next = typeof nextValue === 'function' ? nextValue(curveHandleRef.current) : nextValue
    curveHandleRef.current = next
    if (!isControlled) setInternalCurveHandle(next)
    onArtifactHandleChange?.(next)
  }, [isControlled, onArtifactHandleChange])

  const metrics = useMemo(() => {
    if (variant === 'A') return curveJoinMetrics(curveHandle)
    if (variant === 'B') return rigidityMetrics(braceMask)
    const matrix = composeTransforms(steps)
    return { ...matrixMetrics(matrix), matrix, steps }
  }, [braceMask, curveHandle, steps, variant])

  useEffect(() => {
    onMetrics?.(metrics)
  }, [metrics, onMetrics])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    const { width, height, dpr } = sizeRef.current
    if (!canvas || !context || !width || !height) return
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    context.clearRect(0, 0, width, height)
    if (variant === 'A') drawCurvePrototype(context, width, height, compact, curveHandle, construction)
    else if (variant === 'B') drawFramePrototype(context, width, height, compact, braceMask)
    else drawTransformPrototype(context, width, height, compact, steps)
  }, [braceMask, compact, construction, curveHandle, steps, variant])
  drawRef.current = draw

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const width = Math.max(1, Math.round(rect.width))
      const height = Math.max(1, Math.round(rect.height))
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      sizeRef.current = { width, height, dpr }
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      drawRef.current?.()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()
    return () => observer.disconnect()
  }, [compact, variant])

  useLayoutEffect(() => {
    drawRef.current?.()
  }, [braceMask, construction, curveHandle, steps])

  const eventPoint = (event) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  const updateCurveHandle = (event) => {
    const point = eventPoint(event)
    const { unmap, map } = createMapper(sizeRef.current.width, sizeRef.current.height, compact)
    let next = unmap(point)
    next = { x: clamp(next.x, 0.53, 0.77), y: clamp(next.y, 0.28, 0.76) }
    const target = map(CURVE_MODEL.targetHandle)
    if (Math.hypot(point.x - target.x, point.y - target.y) < (compact ? 16 : 14)) {
      next = CURVE_MODEL.targetHandle
    }
    setCurveHandle(next)
  }

  const commitCurveCalibration = useCallback(() => {
    if (variant !== 'A') return
    const snapped = snapRaccordHandle(curveHandleRef.current)
    if (snapped.x !== curveHandleRef.current.x || snapped.y !== curveHandleRef.current.y) {
      setCurveHandle(snapped)
    }
    if (!construction && isExactRaccordCalibration(snapped)) {
      const completionMetrics = curveJoinMetrics(snapped)
      onConstructionComplete?.({
        grade: completionMetrics.grade,
        handle: snapped,
        curvatureJump: completionMetrics.curvatureJump,
      })
    }
  }, [construction, onConstructionComplete, setCurveHandle, variant])

  const handlePointerDown = (event) => {
    if (variant === 'A') {
      const point = eventPoint(event)
      const { map } = createMapper(sizeRef.current.width, sizeRef.current.height, compact)
      const handle = map(curveHandle)
      if (Math.hypot(point.x - handle.x, point.y - handle.y) > (compact ? 34 : 30)) return
      draggingRef.current = true
      event.currentTarget.setPointerCapture(event.pointerId)
      updateCurveHandle(event)
      return
    }
    if (variant === 'B') {
      const point = eventPoint(event)
      const { map } = createMapper(sizeRef.current.width, sizeRef.current.height, compact)
      const distances = FRAME_BRACES.map(([from, to]) => distanceToSegment(point, map(FRAME_NODES[from]), map(FRAME_NODES[to])))
      const preferred = distances[0] === distances[1] && (braceMask & 1) ? 1 : distances.indexOf(Math.min(...distances))
      if (distances[preferred] <= (compact ? 34 : 28)) {
        setBraceMask((current) => current ^ (1 << preferred))
      }
    }
  }

  const handlePointerMove = (event) => {
    if (variant === 'A' && draggingRef.current) updateCurveHandle(event)
  }

  const endPointer = (event, commit = false) => {
    if (!draggingRef.current) return
    draggingRef.current = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    if (commit) commitCurveCalibration()
  }

  const handleKeyDown = (event) => {
    if (variant === 'A' && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault()
      const amount = event.shiftKey ? 0.025 : 0.008
      const offset = {
        ArrowLeft: { x: -amount, y: 0 },
        ArrowRight: { x: amount, y: 0 },
        ArrowUp: { x: 0, y: -amount },
        ArrowDown: { x: 0, y: amount },
      }[event.key]
      setCurveHandle((current) => ({
        x: clamp(current.x + offset.x, 0.53, 0.77),
        y: clamp(current.y + offset.y, 0.28, 0.76),
      }))
    }
    if (variant === 'B' && (event.key === ' ' || event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
      event.preventDefault()
      setBraceMask((current) => event.key === 'ArrowLeft' ? (current + 3) % 4 : (current + 1) % 4)
    }
  }

  const handleKeyUp = (event) => {
    if (variant === 'A' && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      commitCurveCalibration()
    }
  }

  const insertTransform = (key) => {
    setSteps((current) => current.length >= 4 ? current : [...current, key])
  }

  const canvasLabel = variant === 'A'
    ? 'Courbe interactive. Faites glisser le point bleu; les flèches ajustent la poignée au clavier.'
    : 'Charpente interactive. Touchez une diagonale; espace ou flèches changent les traverses.'

  return (
    <div
      className="plan-prototype-surface"
      data-plan-prototype={variant}
      data-raccord-handle={variant === 'A' ? `${curveHandle.x.toFixed(3)},${curveHandle.y.toFixed(3)}` : undefined}
      data-construction-memory={variant === 'A' && construction ? 'present' : 'dormant'}
    >
      <canvas
        ref={canvasRef}
        tabIndex={variant === 'C' ? -1 : 0}
        role={variant === 'C' ? 'img' : 'group'}
        aria-label={variant === 'C' ? 'Grille transformée et cible' : canvasLabel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(event) => endPointer(event, true)}
        onPointerCancel={(event) => endPointer(event, false)}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
      />
      {variant === 'C' ? (
        <div className="plan-transform-console">
          <div className="plan-transform-keys" aria-label="Plaques de transformation">
            {Object.entries(TRANSFORM_LIBRARY).map(([key, transform]) => (
              <button key={key} type="button" onClick={() => insertTransform(key)} disabled={steps.length >= 4}>
                {transform.label}
              </button>
            ))}
            <button type="button" className="plan-transform-remove" onClick={() => setSteps((current) => current.slice(0, -1))} disabled={!steps.length}>
              Retirer
            </button>
          </div>
          <ol className="plan-transform-stack" aria-label="Ordre actuel">
            {steps.length ? steps.map((step, index) => <li key={`${step}-${index}`}>{String(index + 1).padStart(2, '0')} / {step}</li>) : <li>00 / identité</li>}
          </ol>
        </div>
      ) : null}
      <output className="plan-prototype-sr-only" aria-live="polite">{metricsAnnouncement(variant, metrics)}</output>
    </div>
  )
}
