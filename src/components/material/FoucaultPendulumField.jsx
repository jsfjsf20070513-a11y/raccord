import { useCallback, useEffect, useRef } from 'react'
import { driftDegAt, isReleased, phaseAt } from './foucaultState'
import './FoucaultPendulumField.css'

const MAX_DPR = 2
const SWING_PERIOD_MS = 6_200
// Enough to expose the betrayal without turning the chamber into a carousel.
// The reference composition reads at roughly four degrees; beyond that the
// architecture becomes an effect instead of evidence.
const MAX_ROOM_ROTATION_DEG = 3.2

const VERDIGRIS = '#4d7d72'
const INK = '68, 58, 48'
const SOFT_INK = '119, 105, 88'

const GEOMETRY = {
  desktop: {
    width: 1440,
    height: 1024,
    anchor: { x: 720, y: -44 },
    bob: { x: 720, y: 738 },
    bobWidth: 214,
    floor: { x: 720, y: 952, rx: 374, ry: 59 },
    swingAmplitude: 138,
    gestureAmplitude: 86,
    maxPull: 210,
    minReleasePull: 30,
    hitRadius: 132,
  },
  mobile: {
    width: 390,
    height: 844,
    anchor: { x: 195, y: -30 },
    bob: { x: 195, y: 548 },
    bobWidth: 142,
    floor: { x: 195, y: 774, rx: 151, ry: 31 },
    swingAmplitude: 76,
    gestureAmplitude: 46,
    maxPull: 118,
    minReleasePull: 20,
    hitRadius: 88,
  },
}

const BOB_ASPECT = 752 / 585

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function floorPoint(floor, angleRad, radius) {
  return {
    x: floor.x + floor.rx * Math.cos(angleRad) * radius,
    y: floor.y + floor.ry * Math.sin(angleRad) * radius,
  }
}

function roomAngleDegAt(state, nowMs, reducedMotion) {
  if (!isReleased(state)) return 0
  if (reducedMotion) {
    return phaseAt(state, nowMs) === 'revealed' ? 2.8 : 1.3
  }
  const drift = driftDegAt(state, nowMs)
  return MAX_ROOM_ROTATION_DEG * Math.tanh(drift / MAX_ROOM_ROTATION_DEG)
}

function setCanvasSize(canvas, geometry) {
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
  const width = Math.round(geometry.width * dpr)
  const height = Math.round(geometry.height * dpr)
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width
    canvas.height = height
  }
  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, geometry.width, geometry.height)
  return ctx
}

function drawFloorChord(ctx, floor, angleRad, {
  alpha = 0.45,
  dash = [],
  lineWidth = 1,
} = {}) {
  const a = floorPoint(floor, angleRad, -1)
  const b = floorPoint(floor, angleRad, 1)
  const gradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y)
  gradient.addColorStop(0, `rgba(${SOFT_INK}, 0)`)
  gradient.addColorStop(0.2, `rgba(${SOFT_INK}, ${alpha})`)
  gradient.addColorStop(0.8, `rgba(${SOFT_INK}, ${alpha})`)
  gradient.addColorStop(1, `rgba(${SOFT_INK}, 0)`)
  ctx.save()
  ctx.strokeStyle = gradient
  ctx.lineWidth = lineWidth
  ctx.setLineDash(dash)
  ctx.beginPath()
  ctx.moveTo(a.x, a.y)
  ctx.lineTo(b.x, b.y)
  ctx.stroke()
  ctx.restore()
}

function pointerDirection(point, bob) {
  return Math.atan2((point.y - bob.y) * 1.45, point.x - bob.x)
}

export default function FoucaultPendulumField({
  children,
  state,
  onRelease,
  variant = 'desktop',
}) {
  const geometry = GEOMETRY[variant] ?? GEOMETRY.desktop
  const frameRef = useRef(null)
  const roomRef = useRef(null)
  const roomCanvasRef = useRef(null)
  const inertialCanvasRef = useRef(null)
  const bobRef = useRef(null)
  const rafRef = useRef(0)
  const aimRef = useRef(null)
  const visibleRef = useRef(true)
  const stateRef = useRef(state)
  stateRef.current = state

  const reducedMotion = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const draw = useCallback((nowMs) => {
    const roomCanvas = roomCanvasRef.current
    const inertialCanvas = inertialCanvasRef.current
    const bob = bobRef.current
    const room = roomRef.current
    const frame = frameRef.current
    if (!roomCanvas || !inertialCanvas || !bob || !room || !frame) return

    const roomCtx = setCanvasSize(roomCanvas, geometry)
    const inertialCtx = setCanvasSize(inertialCanvas, geometry)
    const current = stateRef.current
    const released = isReleased(current)
    const aim = aimRef.current
    const phase = phaseAt(current, nowMs)
    const releaseAngle = released
      ? (current.releaseDirectionDeg * Math.PI) / 180
      : aim?.angleRad ?? 0

    const roomAngle = roomAngleDegAt(current, nowMs, reducedMotion)
    room.style.setProperty('--foucault-room-angle', `${roomAngle}deg`)
    frame.dataset.phase = aim && !released ? 'gesture' : phase

    // The room owns its own plumb line and release mark. Both leave the
    // visitor together with the architecture and title when the frame turns.
    if (released) {
      const plumb = roomCtx.createLinearGradient(
        geometry.anchor.x,
        geometry.anchor.y,
        geometry.floor.x,
        geometry.floor.y,
      )
      plumb.addColorStop(0, `rgba(${INK}, 0.12)`)
      plumb.addColorStop(0.28, `rgba(${INK}, ${phase === 'revealed' ? 0.54 : 0.26})`)
      plumb.addColorStop(0.86, `rgba(${INK}, ${phase === 'revealed' ? 0.72 : 0.36})`)
      plumb.addColorStop(1, `rgba(${INK}, 0.12)`)
      roomCtx.beginPath()
      roomCtx.moveTo(geometry.anchor.x, geometry.anchor.y)
      roomCtx.lineTo(geometry.floor.x, geometry.floor.y)
      roomCtx.strokeStyle = plumb
      roomCtx.lineWidth = variant === 'mobile' ? 0.82 : 1.1
      roomCtx.stroke()

      drawFloorChord(roomCtx, geometry.floor, releaseAngle, {
        alpha: phase === 'revealed' ? 0.48 : 0.27,
        dash: [2, variant === 'mobile' ? 5 : 7],
        lineWidth: variant === 'mobile' ? 0.8 : 1,
      })
    }

    roomCtx.beginPath()
    roomCtx.arc(
      geometry.floor.x,
      geometry.floor.y,
      variant === 'mobile' ? 3 : 4.2,
      0,
      Math.PI * 2,
    )
    roomCtx.fillStyle = released ? VERDIGRIS : 'rgba(77, 125, 114, 0.46)'
    roomCtx.fill()

    let travel = 0
    if (released) {
      const cycle = ((nowMs - current.releasedAt) % SWING_PERIOD_MS) / SWING_PERIOD_MS
      travel = reducedMotion ? 0.32 : Math.sin(cycle * Math.PI * 2)
      if (import.meta.env.DEV && typeof window.__QA_FREEZE_S__ === 'number') {
        travel = window.__QA_FREEZE_S__
      }
    } else if (aim) {
      travel = (clamp(aim.pull, 0, geometry.maxPull) / geometry.maxPull)
        * (geometry.gestureAmplitude / geometry.swingAmplitude)
    }

    const depth = Math.sin(releaseAngle)
    const amplitude = geometry.swingAmplitude
    const dx = amplitude * travel * Math.cos(releaseAngle)
    const dy = amplitude * travel * depth * (geometry.floor.ry / geometry.floor.rx)
    const lift = (variant === 'mobile' ? 8 : 15) * travel * travel
    const scale = 1 + 0.045 * travel * depth
    const bobX = geometry.bob.x + dx
    const bobY = geometry.bob.y + dy - lift
    const bobWidth = geometry.bobWidth
    const bobHeight = bobWidth * BOB_ASPECT

    // The inertial plane stays put on screen. Only the room witness above is
    // carried by the rotating coordinate frame.
    if (released || aim) {
      drawFloorChord(inertialCtx, geometry.floor, releaseAngle, {
        alpha: released ? 0.58 : 0.3,
        dash: aim && !released ? [1, 5] : [],
        lineWidth: variant === 'mobile' ? 0.85 : 1.25,
      })
    }

    const shadowX = geometry.floor.x + dx * 0.72
    // The visible contact shadow sits on the near side of the floor ellipse;
    // the verdigris witness remains at the geometric centre farther back.
    const shadowY = geometry.floor.y + dy - (variant === 'mobile' ? 44 : 55)
    const shadowRx = (variant === 'mobile' ? 42 : 76) * (1 - Math.min(0.26, Math.abs(travel) * 0.16))
    const shadowRy = variant === 'mobile' ? 6.5 : 10
    const shadow = inertialCtx.createRadialGradient(
      shadowX,
      shadowY,
      1,
      shadowX,
      shadowY,
      shadowRx,
    )
    shadow.addColorStop(0, 'rgba(31, 25, 20, 0.4)')
    shadow.addColorStop(0.58, 'rgba(31, 25, 20, 0.18)')
    shadow.addColorStop(1, 'rgba(31, 25, 20, 0)')
    inertialCtx.save()
    inertialCtx.translate(shadowX, shadowY)
    inertialCtx.scale(1, shadowRy / shadowRx)
    inertialCtx.translate(-shadowX, -shadowY)
    inertialCtx.beginPath()
    inertialCtx.arc(shadowX, shadowY, shadowRx, 0, Math.PI * 2)
    inertialCtx.fillStyle = shadow
    inertialCtx.fill()
    inertialCtx.restore()

    const wireEndY = bobY - bobHeight * 0.44
    const wire = inertialCtx.createLinearGradient(
      geometry.anchor.x,
      geometry.anchor.y,
      bobX,
      wireEndY,
    )
    wire.addColorStop(0, `rgba(${INK}, 0.42)`)
    wire.addColorStop(0.72, `rgba(${INK}, 0.72)`)
    wire.addColorStop(1, `rgba(${INK}, 0.88)`)
    inertialCtx.beginPath()
    inertialCtx.moveTo(geometry.anchor.x, geometry.anchor.y)
    inertialCtx.lineTo(bobX, wireEndY)
    inertialCtx.strokeStyle = wire
    inertialCtx.lineWidth = variant === 'mobile' ? 0.82 : 1.15
    inertialCtx.stroke()

    bob.style.width = `${bobWidth}px`
    bob.style.transform = `translate3d(${bobX - bobWidth / 2}px, ${bobY - bobHeight / 2}px, 0) scale(${scale})`
  }, [geometry, reducedMotion, variant])

  const shouldAnimate = useCallback(() => {
    if (reducedMotion || !visibleRef.current) return false
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return false
    return isReleased(stateRef.current) || aimRef.current != null
  }, [reducedMotion])

  const tick = useCallback(() => {
    rafRef.current = 0
    draw(Date.now())
    if (shouldAnimate()) {
      rafRef.current = window.requestAnimationFrame(tick)
    }
  }, [draw, shouldAnimate])

  const wake = useCallback(() => {
    draw(Date.now())
    if (shouldAnimate() && !rafRef.current) {
      rafRef.current = window.requestAnimationFrame(tick)
    }
  }, [draw, shouldAnimate, tick])

  useEffect(() => {
    wake()
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        window.cancelAnimationFrame(rafRef.current)
        rafRef.current = 0
      } else {
        wake()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    const observer = new IntersectionObserver((entries) => {
      visibleRef.current = entries[0]?.isIntersecting ?? true
      if (!visibleRef.current) {
        window.cancelAnimationFrame(rafRef.current)
        rafRef.current = 0
      } else {
        wake()
      }
    })
    if (frameRef.current) observer.observe(frameRef.current)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      observer.disconnect()
      window.cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }, [wake])

  useEffect(() => {
    wake()
  }, [state, wake])

  useEffect(() => {
    if (import.meta.env.DEV && window.__QA_AIM__ && !isReleased(stateRef.current)) {
      const { angleDeg = -20, pull = geometry.maxPull * 0.62 } = window.__QA_AIM__
      aimRef.current = { angleRad: (angleDeg * Math.PI) / 180, pull }
      wake()
    }
  }, [geometry.maxPull, wake])

  const toStagePoint = (event) => {
    const rect = inertialCanvasRef.current.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * geometry.width,
      y: ((event.clientY - rect.top) / rect.height) * geometry.height,
    }
  }

  const onPointerDown = (event) => {
    if (isReleased(stateRef.current)) return
    if (event.button != null && event.button !== 0) return
    const point = toStagePoint(event)
    const distance = Math.hypot(point.x - geometry.bob.x, point.y - geometry.bob.y)
    if (distance > geometry.hitRadius) return
    event.preventDefault()
    event.currentTarget.focus({ preventScroll: true })
    event.currentTarget.setPointerCapture?.(event.pointerId)
    aimRef.current = { angleRad: 0, pull: 0 }
    wake()
  }

  const onPointerMove = (event) => {
    if (isReleased(stateRef.current)) return
    const point = toStagePoint(event)
    const distance = Math.hypot(point.x - geometry.bob.x, point.y - geometry.bob.y)
    frameRef.current?.toggleAttribute('data-near', distance <= geometry.hitRadius)
    if (!aimRef.current) return
    aimRef.current = {
      angleRad: pointerDirection(point, geometry.bob),
      pull: Math.hypot(point.x - geometry.bob.x, point.y - geometry.bob.y),
    }
    if (reducedMotion) draw(Date.now())
  }

  const endGesture = (event) => {
    if (!aimRef.current) return
    if (event?.pointerId != null && event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    const { angleRad, pull } = aimRef.current
    aimRef.current = null
    if (!isReleased(stateRef.current) && pull >= geometry.minReleasePull) {
      onRelease?.((angleRad * 180) / Math.PI)
    } else {
      draw(Date.now())
    }
  }

  const onKeyDown = (event) => {
    if (isReleased(stateRef.current)) return
    const step = event.shiftKey ? 15 : 5
    const previous = aimRef.current?.angleRad ?? 0
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      const direction = event.key === 'ArrowLeft' ? 1 : -1
      aimRef.current = {
        angleRad: previous + (direction * step * Math.PI) / 180,
        pull: geometry.minReleasePull,
      }
      wake()
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
      aimRef.current = {
        angleRad: event.key === 'ArrowUp' ? -Math.PI / 2 : Math.PI / 2,
        pull: geometry.minReleasePull,
      }
      wake()
    } else if (event.key === 'Enter' && aimRef.current) {
      event.preventDefault()
      const { angleRad } = aimRef.current
      aimRef.current = null
      onRelease?.((angleRad * 180) / Math.PI)
    }
  }

  return (
    <div
      ref={frameRef}
      className="foucault-field-frame"
      data-phase={phaseAt(state, Date.now())}
      data-variant={variant}
    >
      <div ref={roomRef} className="foucault-room-coordinate" aria-hidden="true">
        {children}
        <canvas ref={roomCanvasRef} className="foucault-room-witness" />
      </div>
      <canvas
        ref={inertialCanvasRef}
        className="foucault-inertial-field"
        role="application"
        tabIndex={0}
        aria-label="Choisir une direction, puis lâcher. Flèches pour orienter, Entrée pour lâcher."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endGesture}
        onPointerCancel={endGesture}
        onLostPointerCapture={endGesture}
        onPointerLeave={() => frameRef.current?.removeAttribute('data-near')}
        onKeyDown={onKeyDown}
      />
      <img
        ref={bobRef}
        className="foucault-bob-sprite"
        src="/assets/foucault/v2/bronze-pendulum-alpha-v2.png"
        alt=""
        draggable="false"
        aria-hidden="true"
      />
    </div>
  )
}
