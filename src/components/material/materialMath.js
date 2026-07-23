export function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

export function smoothstep(edge0, edge1, value) {
  if (edge0 === edge1) return value < edge0 ? 0 : 1
  const normalized = clamp((value - edge0) / (edge1 - edge0))
  return normalized * normalized * (3 - 2 * normalized)
}

/**
 * A small 2D surface field: pointer coordinates are projected into the local
 * material plane, then sampled through an optional rotated ellipse. The field
 * returns 0 outside the influence boundary and eases continuously to `active`
 * near the contact point.
 */
export function createProximityField({
  width,
  height,
  field,
  radiusX,
  radiusY,
  inner = 0.08,
  rotation = 0,
}) {
  const pointerX = field.u * width
  const pointerY = field.v * height
  const safeRadiusX = Math.max(1, radiusX)
  const safeRadiusY = Math.max(1, radiusY)
  const active = clamp(field.active)
  const cosine = Math.cos(rotation)
  const sine = Math.sin(rotation)

  const project = (x, y) => {
    const dx = x - pointerX
    const dy = y - pointerY
    return {
      x: dx * cosine + dy * sine,
      y: -dx * sine + dy * cosine,
    }
  }

  const sample = (x, y) => {
    if (!active) return 0
    const local = project(x, y)
    const distance = Math.hypot(local.x / safeRadiusX, local.y / safeRadiusY)
    return active * (1 - smoothstep(inner, 1, distance))
  }

  const direction = (x, y) => {
    const dx = x - pointerX
    const dy = y - pointerY
    const length = Math.hypot(dx, dy) || 1
    return { x: dx / length, y: dy / length }
  }

  return { pointerX, pointerY, sample, direction }
}
