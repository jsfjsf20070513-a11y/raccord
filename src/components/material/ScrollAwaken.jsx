import { cloneElement, useLayoutEffect, useRef, useState } from 'react'

function clamp(value) {
  return Math.min(1, Math.max(0, value))
}

/**
 * Converts only viewport entry into a dormant -> awakened progress value.
 * It deliberately owns no parallax, scale, rotation, or perpetual animation.
 */
export default function ScrollAwaken({ children, index = 0 }) {
  const rootRef = useRef(null)
  const frameRef = useRef(0)
  const [progress, setProgress] = useState(0)

  useLayoutEffect(() => {
    const update = () => {
      frameRef.current = 0
      const rect = rootRef.current?.getBoundingClientRect()
      if (!rect) return

      const viewportHeight = window.innerHeight || 1
      const start = viewportHeight * (0.98 + index * 0.025)
      const finish = viewportHeight * 0.62
      const next = clamp((start - rect.top) / Math.max(1, start - finish))
      setProgress((current) => (Math.abs(current - next) > 0.005 ? next : current))
    }

    const schedule = () => {
      if (!frameRef.current) frameRef.current = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    return () => {
      window.cancelAnimationFrame(frameRef.current)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [index])

  return (
    <div
      ref={rootRef}
      className="scroll-awaken"
      style={{ '--awaken-progress': progress }}
    >
      {cloneElement(children, { awakenProgress: progress })}
    </div>
  )
}
