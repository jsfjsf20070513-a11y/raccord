import { useCallback, useEffect, useRef, useState } from 'react'
import {
  evidenceGrooves,
  evidencePassCount,
  normalizeAngleDeg,
  precessionDriftDeg,
} from './horizonMath'
import './FoucaultSandField.css'

const FIELD_METRICS = {
  desktop: {
    asset: '/assets/horizon/sand-bed-desktop.webp',
    pivotX: 0.5,
    pivotY: 0.562,
    selectionRadius: 0.383,
    markerRadius: 4.6,
    maxGrooves: 7,
    suspensionTopAlpha: 0.1,
    suspensionMidAlpha: 0.27,
    suspensionMidStop: 0.56,
  },
  mobile: {
    asset: '/assets/horizon/sand-bed-mobile.webp',
    pivotX: 0.5,
    pivotY: 0.589,
    selectionRadius: 0.36,
    markerRadius: 4.2,
    maxGrooves: 5,
    suspensionTopAlpha: 0.025,
    suspensionMidAlpha: 0.16,
    suspensionMidStop: 0.42,
  },
}

function pointOnDirection(pivot, angleDeg, distance) {
  const angleRad = angleDeg * (Math.PI / 180)
  return {
    x: pivot.x + Math.cos(angleRad) * distance,
    y: pivot.y + Math.sin(angleRad) * distance,
  }
}

function rayToViewport(pivot, angleDeg, width, height, reach = 1) {
  const angleRad = angleDeg * (Math.PI / 180)
  const directionX = Math.cos(angleRad)
  const directionY = Math.sin(angleRad)
  const candidates = []

  if (Math.abs(directionX) > 0.0001) {
    const edgeX = directionX > 0 ? width : 0
    const distance = (edgeX - pivot.x) / directionX
    if (distance > 0) candidates.push(distance)
  }

  if (Math.abs(directionY) > 0.0001) {
    const edgeY = directionY > 0 ? height : 0
    const distance = (edgeY - pivot.y) / directionY
    if (distance > 0) candidates.push(distance)
  }

  const distance = Math.min(...candidates) * reach
  return pointOnDirection(pivot, angleDeg, distance)
}

function strokeSandGroove(
  context,
  start,
  end,
  {
    opacity,
    width,
    highlightRatio = 0.38,
    highlightOffset = 0.52,
    fadeTail = false,
  },
) {
  const highlightStyle = fadeTail
    ? context.createLinearGradient(start.x, start.y, end.x, end.y)
    : `rgba(252, 249, 244, ${opacity * highlightRatio})`
  const shadowStyle = fadeTail
    ? context.createLinearGradient(start.x, start.y, end.x, end.y)
    : `rgba(78, 70, 62, ${opacity})`

  if (fadeTail) {
    highlightStyle.addColorStop(
      0,
      `rgba(252, 249, 244, ${opacity * highlightRatio})`,
    )
    highlightStyle.addColorStop(
      0.76,
      `rgba(252, 249, 244, ${opacity * highlightRatio})`,
    )
    highlightStyle.addColorStop(1, 'rgba(252, 249, 244, 0)')

    shadowStyle.addColorStop(0, `rgba(78, 70, 62, ${opacity})`)
    shadowStyle.addColorStop(0.76, `rgba(78, 70, 62, ${opacity})`)
    shadowStyle.addColorStop(0.93, `rgba(78, 70, 62, ${opacity * 0.46})`)
    shadowStyle.addColorStop(1, 'rgba(78, 70, 62, 0)')
  }

  context.beginPath()
  context.moveTo(start.x, start.y - highlightOffset)
  context.lineTo(end.x, end.y - highlightOffset)
  context.lineWidth = Math.max(0.38, width * 0.72)
  context.strokeStyle = highlightStyle
  context.stroke()

  context.beginPath()
  context.moveTo(start.x, start.y)
  context.lineTo(end.x, end.y)
  context.lineWidth = width
  context.strokeStyle = shadowStyle
  context.stroke()
}

function drawField({
  canvas,
  metrics,
  directionDeg,
  released,
  elapsedMs,
}) {
  const rect = canvas.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const pixelWidth = Math.round(rect.width * dpr)
  const pixelHeight = Math.round(rect.height * dpr)

  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth
    canvas.height = pixelHeight
  }

  const context = canvas.getContext('2d')
  context.setTransform(dpr, 0, 0, dpr, 0, 0)
  context.clearRect(0, 0, rect.width, rect.height)
  context.lineCap = 'round'

  const pivot = {
    x: rect.width * metrics.pivotX,
    y: rect.height * metrics.pivotY,
  }
  const selectionDistance = rect.width * metrics.selectionRadius
  const marker = pointOnDirection(pivot, directionDeg, selectionDistance)

  const suspensionGradient = context.createLinearGradient(
    pivot.x,
    -1,
    pivot.x,
    pivot.y,
  )
  suspensionGradient.addColorStop(
    0,
    `rgba(80, 72, 62, ${metrics.suspensionTopAlpha})`,
  )
  suspensionGradient.addColorStop(
    metrics.suspensionMidStop,
    `rgba(80, 72, 62, ${metrics.suspensionMidAlpha})`,
  )
  suspensionGradient.addColorStop(1, 'rgba(80, 72, 62, 0.44)')

  context.beginPath()
  context.moveTo(pivot.x, -1)
  context.lineTo(pivot.x, pivot.y)
  context.lineWidth = 0.68
  context.strokeStyle = suspensionGradient
  context.stroke()

  strokeSandGroove(context, marker, pivot, {
    opacity: released ? 0.58 : 0.48,
    width: released ? 0.92 : 0.82,
    highlightRatio: 0.48,
    highlightOffset: 0.64,
  })

  const witnessAngleDeg = normalizeAngleDeg(directionDeg + 180)
  const witnessEnd = rayToViewport(
    pivot,
    witnessAngleDeg,
    rect.width,
    rect.height,
    0.985,
  )
  strokeSandGroove(
    context,
    { x: pivot.x + 2, y: pivot.y },
    witnessEnd,
    {
      opacity: released ? 0.21 : 0.15,
      width: 0.58,
      highlightRatio: 0.42,
      highlightOffset: 0.46,
    },
  )

  if (released) {
    evidenceGrooves(directionDeg, elapsedMs, metrics.maxGrooves)
      .forEach((groove) => {
        const end = rayToViewport(
          pivot,
          groove.angleDeg,
          rect.width,
          rect.height,
          groove.reach,
        )
        strokeSandGroove(
          context,
          { x: pivot.x + 2, y: pivot.y },
          end,
          {
            opacity: groove.opacity,
            width: groove.width,
            highlightRatio: 0.34,
            highlightOffset: 0.42,
            fadeTail: true,
          },
        )
      })
  }

  context.beginPath()
  context.arc(pivot.x, pivot.y, 2.15, 0, Math.PI * 2)
  context.fillStyle = 'rgba(93, 80, 64, 0.84)'
  context.fill()

  const markerGradient = context.createRadialGradient(
    marker.x - metrics.markerRadius * 0.34,
    marker.y - metrics.markerRadius * 0.4,
    metrics.markerRadius * 0.12,
    marker.x,
    marker.y,
    metrics.markerRadius,
  )
  markerGradient.addColorStop(0, released ? '#91a79e' : '#9aafa7')
  markerGradient.addColorStop(0.35, released ? '#668178' : '#708b81')
  markerGradient.addColorStop(1, released ? '#48655c' : '#526f65')

  context.beginPath()
  context.arc(marker.x, marker.y, metrics.markerRadius, 0, Math.PI * 2)
  context.fillStyle = markerGradient
  context.fill()
}

export default function FoucaultSandField({
  variant,
  released,
  releaseDirectionDeg,
  draftDirectionDeg,
  elapsedMs,
  onDraftDirectionChange,
  onRelease,
}) {
  const metrics = FIELD_METRICS[variant] || FIELD_METRICS.desktop
  const canvasRef = useRef(null)
  const controlRef = useRef(null)
  const pressedRef = useRef(false)
  const activePointerIdRef = useRef(null)
  const [resizeVersion, setResizeVersion] = useState(0)
  const directionDeg = released ? releaseDirectionDeg : draftDirectionDeg
  const roundedDirectionDeg = Math.round(normalizeAngleDeg(directionDeg)) % 360
  const passCount = evidencePassCount(elapsedMs)
  const realDriftDeg = precessionDriftDeg(elapsedMs)
  const statusText = released
    ? `已释放于 ${roundedDirectionDeg} 度。摆球已经过中心 ${passCount} 次，摆平面相对释放时刻真实进动 ${realDriftDeg.toFixed(2)} 度。`
    : `当前方向 ${roundedDirectionDeg} 度。方向键可微调，回车键或空格键释放。`

  const directionFromPointer = useCallback((event) => {
    const rect = controlRef.current?.getBoundingClientRect()
    if (!rect) return directionDeg

    const pivotX = rect.left + rect.width * metrics.pivotX
    const pivotY = rect.top + rect.height * metrics.pivotY
    const deltaX = event.clientX - pivotX
    const deltaY = event.clientY - pivotY

    if (Math.hypot(deltaX, deltaY) < 12) return directionDeg
    return normalizeAngleDeg(Math.atan2(deltaY, deltaX) * (180 / Math.PI))
  }, [directionDeg, metrics.pivotX, metrics.pivotY])

  const handlePointerDown = useCallback((event) => {
    if (
      released
      || pressedRef.current
      || event.button !== 0
      || !event.isPrimary
    ) {
      return
    }

    pressedRef.current = true
    activePointerIdRef.current = event.pointerId
    event.currentTarget.setPointerCapture?.(event.pointerId)
    onDraftDirectionChange(directionFromPointer(event))
  }, [directionFromPointer, onDraftDirectionChange, released])

  const handlePointerMove = useCallback((event) => {
    if (
      released
      || !pressedRef.current
      || event.pointerId !== activePointerIdRef.current
    ) {
      return
    }

    onDraftDirectionChange(directionFromPointer(event))
  }, [directionFromPointer, onDraftDirectionChange, released])

  const handlePointerUp = useCallback((event) => {
    if (
      released
      || !pressedRef.current
      || event.pointerId !== activePointerIdRef.current
    ) {
      return
    }

    const nextDirectionDeg = directionFromPointer(event)
    pressedRef.current = false
    activePointerIdRef.current = null
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    onDraftDirectionChange(nextDirectionDeg)
    onRelease(nextDirectionDeg)
  }, [
    directionFromPointer,
    onDraftDirectionChange,
    onRelease,
    released,
  ])

  const handlePointerCancel = useCallback((event) => {
    if (event.pointerId !== activePointerIdRef.current) return
    pressedRef.current = false
    activePointerIdRef.current = null
  }, [])

  const handleLostPointerCapture = useCallback((event) => {
    if (event.pointerId !== activePointerIdRef.current) return
    pressedRef.current = false
    activePointerIdRef.current = null
  }, [])

  const handleKeyDown = useCallback((event) => {
    if (released) return

    if (['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].includes(event.key)) {
      event.preventDefault()
      const step = event.shiftKey ? 5 : 1
      const sign = ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1
      onDraftDirectionChange(normalizeAngleDeg(directionDeg + sign * step))
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onRelease(directionDeg)
    }
  }, [
    directionDeg,
    onDraftDirectionChange,
    onRelease,
    released,
  ])

  const handleClick = useCallback((event) => {
    if (!released && event.detail === 0) {
      onRelease(directionDeg)
    }
  }, [directionDeg, onRelease, released])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    drawField({
      canvas,
      metrics,
      directionDeg,
      released,
      elapsedMs,
    })
  }, [directionDeg, elapsedMs, metrics, released, resizeVersion])

  useEffect(() => {
    const control = controlRef.current
    if (!control) return undefined

    const resizeObserver = new ResizeObserver(() => {
      setResizeVersion((version) => version + 1)
    })
    resizeObserver.observe(control)
    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div
      className={`foucault-sand-field foucault-sand-field--${variant}`}
      data-released={released ? 'true' : 'false'}
    >
      <img
        className="foucault-sand-field__material"
        src={metrics.asset}
        alt=""
        draggable="false"
      />
      <canvas
        ref={canvasRef}
        className="foucault-sand-field__canvas"
        aria-hidden="true"
      />
      <button
        ref={controlRef}
        className="foucault-sand-field__control"
        type="button"
        role="slider"
        aria-disabled={released}
        aria-describedby={`horizon-field-status-${variant}`}
        aria-label="释放方向"
        aria-valuemin="0"
        aria-valuemax="359"
        aria-valuenow={roundedDirectionDeg}
        aria-valuetext={statusText}
        aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Enter Space"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onLostPointerCapture={handleLostPointerCapture}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
      />
      <p
        id={`horizon-field-status-${variant}`}
        className="horizon-visually-hidden"
        aria-live="polite"
      >
        {statusText}
      </p>
    </div>
  )
}
