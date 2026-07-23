import { useCallback, useEffect, useMemo, useRef } from 'react'

const EPSILON = 0.001

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

function createField() {
  return {
    u: 0.5,
    v: 0.5,
    x: 0,
    y: 0,
    signedX: 0,
    signedY: 0,
    proximity: 0,
    active: 0,
    pressure: 0,
  }
}

function fieldDistance(a, b) {
  return Math.max(
    Math.abs(a.u - b.u),
    Math.abs(a.v - b.v),
    Math.abs(a.proximity - b.proximity),
    Math.abs(a.active - b.active),
    Math.abs(a.pressure - b.pressure),
  )
}

/**
 * One pointer field for every material card. The hook writes normalized values
 * to CSS variables and publishes the same values to Canvas subscribers.
 * It schedules frames only while the field is converging on a new pointer
 * position, so a still pointer produces a still material.
 */
export default function usePointerField({
  enabled = true,
  smoothing = 0.24,
  onActiveChange,
} = {}) {
  const elementRef = useRef(null)
  const currentRef = useRef(createField())
  const targetRef = useRef(createField())
  const listenersRef = useRef(new Set())
  const frameRef = useRef(0)
  const reducedMotionRef = useRef(false)
  const pressedPointerRef = useRef(null)
  const pointerBlockedUntilRef = useRef(0)
  const announcedActiveRef = useRef(false)
  const onActiveChangeRef = useRef(onActiveChange)
  onActiveChangeRef.current = onActiveChange

  const publish = useCallback(() => {
    const element = elementRef.current
    const field = currentRef.current

    if (element) {
      element.style.setProperty('--field-x', `${field.u * 100}%`)
      element.style.setProperty('--field-y', `${field.v * 100}%`)
      element.style.setProperty('--field-xn', field.signedX.toFixed(4))
      element.style.setProperty('--field-yn', field.signedY.toFixed(4))
      element.style.setProperty('--field-active', field.active.toFixed(4))
      element.style.setProperty('--field-proximity', field.proximity.toFixed(4))
      element.style.setProperty('--field-pressure', field.pressure.toFixed(4))
      if (!element.dataset.fieldState) element.dataset.fieldState = 'dormant'
    }

    listenersRef.current.forEach((listener) => listener(field))
  }, [])

  const animateRef = useRef(null)
  animateRef.current = () => {
    const current = currentRef.current
    const target = targetRef.current
    const amount = reducedMotionRef.current ? 1 : smoothing

    current.u += (target.u - current.u) * amount
    current.v += (target.v - current.v) * amount
    current.active += (target.active - current.active) * amount
    current.pressure += (target.pressure - current.pressure) * amount
    current.proximity += (target.proximity - current.proximity) * amount
    current.signedX = current.u * 2 - 1
    current.signedY = current.v * 2 - 1

    const rect = elementRef.current?.getBoundingClientRect()
    if (rect) {
      current.x = current.u * rect.width
      current.y = current.v * rect.height
    }

    publish()

    // Once the field has faded out, its last pointer coordinates no longer
    // affect the material. Stop immediately instead of spending frames
    // converging invisible position values after leave / scroll / resize.
    if (target.active === 0 && current.active <= EPSILON) {
      Object.assign(current, {
        active: 0,
        pressure: 0,
        proximity: 0,
      })
      publish()
      frameRef.current = 0
      if (elementRef.current) elementRef.current.dataset.fieldState = 'dormant'
      return
    }

    if (fieldDistance(current, target) > EPSILON) {
      frameRef.current = window.requestAnimationFrame(animateRef.current)
    } else {
      Object.assign(current, target, {
        signedX: target.u * 2 - 1,
        signedY: target.v * 2 - 1,
      })
      if (rect) {
        current.x = current.u * rect.width
        current.y = current.v * rect.height
      }
      publish()
      frameRef.current = 0
      if (elementRef.current) {
        elementRef.current.dataset.fieldState = current.active > EPSILON ? 'resting' : 'dormant'
      }
    }
  }

  const requestFrame = useCallback(() => {
    if (!frameRef.current) {
      if (elementRef.current) elementRef.current.dataset.fieldState = 'moving'
      frameRef.current = window.requestAnimationFrame(animateRef.current)
    }
  }, [])

  const activateAt = useCallback(({ u = 0.5, v = 0.5, active = 1, pressure = active } = {}) => {
    if (!enabled) return
    const safeU = clamp(u)
    const safeV = clamp(v)
    const signedX = safeU * 2 - 1
    const signedY = safeV * 2 - 1
    const distanceFromCenter = Math.hypot(signedX, signedY) / Math.SQRT2
    const rect = elementRef.current?.getBoundingClientRect()

    Object.assign(targetRef.current, {
      u: safeU,
      v: safeV,
      x: safeU * (rect?.width || 0),
      y: safeV * (rect?.height || 0),
      signedX,
      signedY,
      proximity: clamp(1 - distanceFromCenter),
      active: clamp(active),
      pressure: clamp(pressure),
    })
    if (!announcedActiveRef.current) {
      announcedActiveRef.current = true
      onActiveChangeRef.current?.(true)
    }
    requestFrame()
  }, [enabled, requestFrame])

  const sleep = useCallback(() => {
    targetRef.current.active = 0
    targetRef.current.pressure = 0
    targetRef.current.proximity = 0
    if (announcedActiveRef.current) {
      announcedActiveRef.current = false
      onActiveChangeRef.current?.(false)
    }
    requestFrame()
  }, [requestFrame])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return undefined

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotionRef.current = motionQuery.matches

    const setPointerTarget = (event, active = 1) => {
      if (!enabled) return
      if (performance.now() < pointerBlockedUntilRef.current) return
      const rect = element.getBoundingClientRect()
      if (!rect.width || !rect.height) return

      const u = clamp((event.clientX - rect.left) / rect.width)
      const v = clamp((event.clientY - rect.top) / rect.height)
      activateAt({
        u,
        v,
        active,
        pressure: event.pressure > 0 ? event.pressure : active,
      })
    }

    const handlePointerDown = (event) => {
      if (event.pointerType === 'mouse') return
      pressedPointerRef.current = event.pointerId
      setPointerTarget(event)
    }
    const handlePointerMove = (event) => {
      if (event.pointerType !== 'mouse' && pressedPointerRef.current !== event.pointerId) return
      setPointerTarget(event)
    }
    const handlePointerUp = (event) => {
      if (pressedPointerRef.current !== event.pointerId) return
      pressedPointerRef.current = null
      sleep()
    }
    const handlePointerLeave = () => sleep()
    const handlePointerCancel = () => {
      pressedPointerRef.current = null
      sleep()
    }
    const handleViewportChange = () => {
      pointerBlockedUntilRef.current = performance.now() + 140
      if (targetRef.current.active > 0 || currentRef.current.active > EPSILON) sleep()
    }
    const handleWindowPointerMove = (event) => {
      if (targetRef.current.active <= 0) return
      const rect = element.getBoundingClientRect()
      const outside = event.clientX < rect.left
        || event.clientX > rect.right
        || event.clientY < rect.top
        || event.clientY > rect.bottom
      if (outside) sleep()
    }
    const handleFocus = () => {
      activateAt({
        u: 0.5,
        v: 0.5,
        active: 0.72,
        pressure: 0,
      })
    }
    const handleBlur = () => sleep()
    const handleMotionPreference = (event) => {
      reducedMotionRef.current = event.matches
      requestFrame()
    }

    element.addEventListener('pointerdown', handlePointerDown)
    element.addEventListener('pointermove', handlePointerMove)
    element.addEventListener('pointerup', handlePointerUp)
    element.addEventListener('pointerleave', handlePointerLeave)
    element.addEventListener('pointercancel', handlePointerCancel)
    element.addEventListener('focus', handleFocus)
    element.addEventListener('blur', handleBlur)
    window.addEventListener('pointermove', handleWindowPointerMove, { passive: true })
    window.addEventListener('wheel', handleViewportChange, { passive: true })
    // Native panning emits pointercancel and scroll. Listening to touchmove here
    // would put the field to sleep before an intentional pressed drag can render.
    window.addEventListener('scroll', handleViewportChange, { passive: true })
    window.addEventListener('resize', handleViewportChange)
    motionQuery.addEventListener('change', handleMotionPreference)
    publish()

    return () => {
      window.cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
      element.removeEventListener('pointerdown', handlePointerDown)
      element.removeEventListener('pointermove', handlePointerMove)
      element.removeEventListener('pointerup', handlePointerUp)
      element.removeEventListener('pointerleave', handlePointerLeave)
      element.removeEventListener('pointercancel', handlePointerCancel)
      element.removeEventListener('focus', handleFocus)
      element.removeEventListener('blur', handleBlur)
      window.removeEventListener('pointermove', handleWindowPointerMove)
      window.removeEventListener('wheel', handleViewportChange)
      window.removeEventListener('scroll', handleViewportChange)
      window.removeEventListener('resize', handleViewportChange)
      motionQuery.removeEventListener('change', handleMotionPreference)
    }
  }, [activateAt, enabled, publish, requestFrame, sleep])

  useEffect(() => {
    if (!enabled) {
      if (currentRef.current.active > EPSILON || frameRef.current) sleep()
    }
  }, [enabled, sleep])

  const subscribe = useCallback((listener) => {
    listenersRef.current.add(listener)
    listener(currentRef.current)
    return () => listenersRef.current.delete(listener)
  }, [])

  const getField = useCallback(() => currentRef.current, [])

  return useMemo(
    () => ({ elementRef, getField, subscribe, activateAt, sleep }),
    [activateAt, getField, sleep, subscribe],
  )
}
