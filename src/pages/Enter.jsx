import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useWorld } from '../context/useWorld'

const WORLDS = [
  {
    id: 'plan',
    number: 'N°01',
    name: 'PLAN ℝ',
    intent: 'voir · 认识我们 →',
    eyebrow: 'voir · 认识这个班 · le champ gravitationnel',
    hero: 'PLAN ℝ',
    image: '/worlds/plan.png',
  },
  {
    id: 'carnet',
    number: 'N°02',
    name: 'LE CARNET',
    intent: 'lire · 翻记录 →',
    eyebrow: 'lire · 翻班级记录 · le carnet à l’encre',
    hero: 'CARNET',
    image: '/worlds/carnet.png',
  },
  {
    id: 'limite',
    number: 'N°03',
    name: 'LIMITE',
    intent: 'faire · 去背词 →',
    eyebrow: 'faire · 去背词 · la lentille du signal',
    hero: 'LIMITE',
    image: '/worlds/limite.png',
  },
]

function hexAlpha(hex, alpha) {
  const value = hex.replace('#', '')
  const number = Number.parseInt(value.length === 3
    ? value.split('').map((letter) => `${letter}${letter}`).join('')
    : value, 16)
  return `rgba(${(number >> 16) & 255},${(number >> 8) & 255},${number & 255},${alpha})`
}

export default function Enter() {
  const canvasRef = useRef(null)
  const lensRef = useRef(null)
  const modeRef = useRef('grid')
  const [hoveredWorld, setHoveredWorld] = useState(null)
  const { enterWorld } = useWorld()
  const navigate = useNavigate()
  const location = useLocation()

  const activeWorld = WORLDS.find(({ id }) => id === hoveredWorld)

  useEffect(() => {
    const canvas = canvasRef.current
    const lens = lensRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context || !lens) return undefined

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const gap = 42
    let width = 0
    let height = 0
    let columns = 0
    let rows = 0
    let baseX = []
    let baseY = []
    let nextX = new Float32Array(0)
    let nextY = new Float32Array(0)
    let targetX = -600
    let targetY = -600
    let pointerX = -600
    let pointerY = -600
    let active = false
    let pulse = 0
    let trail = []
    let lastTrail = 0
    let frame = 0

    const buildGrid = () => {
      columns = Math.ceil(width / gap) + 2
      rows = Math.ceil(height / gap) + 2
      baseX = Array.from({ length: columns }, (_, index) => index * gap)
      baseY = Array.from({ length: rows }, (_, index) => index * gap)
      nextX = new Float32Array(columns * rows)
      nextY = new Float32Array(columns * rows)
    }

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      buildGrid()
    }

    const onMove = (event) => {
      targetX = event.clientX
      targetY = event.clientY
      active = true
      const now = performance.now()

      if (modeRef.current === 'ink' && now - lastTrail > 16) {
        const previous = trail.at(-1)
        const speed = previous ? Math.hypot(event.clientX - previous.x, event.clientY - previous.y) : 0
        trail.push({
          x: event.clientX,
          y: event.clientY,
          time: now,
          radius: 10 + Math.min(speed, 40) * 0.45,
        })
        if (trail.length > 100) trail = trail.slice(-100)
        lastTrail = now
      }
    }

    const drawGrid = (ink, accent) => {
      const sigma = 150
      const sigmaSquared = 2 * sigma * sigma
      const strength = 34 * (1 + pulse * 1.4)

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const originX = baseX[column]
          const originY = baseY[row]
          const dx = pointerX - originX
          const dy = pointerY - originY
          const distanceSquared = dx * dx + dy * dy
          const pull = strength * Math.exp(-distanceSquared / sigmaSquared)
          const distance = Math.sqrt(distanceSquared) || 1
          const index = row * columns + column
          nextX[index] = originX + (dx / distance) * pull
          nextY[index] = originY + (dy / distance) * pull
        }
      }

      context.lineWidth = 1
      context.strokeStyle = hexAlpha(ink, 0.16)
      for (let row = 0; row < rows; row += 1) {
        context.beginPath()
        for (let column = 0; column < columns; column += 1) {
          const index = row * columns + column
          if (column === 0) context.moveTo(nextX[index], nextY[index])
          else context.lineTo(nextX[index], nextY[index])
        }
        context.stroke()
      }
      for (let column = 0; column < columns; column += 1) {
        context.beginPath()
        for (let row = 0; row < rows; row += 1) {
          const index = row * columns + column
          if (row === 0) context.moveTo(nextX[index], nextY[index])
          else context.lineTo(nextX[index], nextY[index])
        }
        context.stroke()
      }

      const glow = context.createRadialGradient(pointerX, pointerY, 0, pointerX, pointerY, sigma * 1.7)
      glow.addColorStop(0, hexAlpha(accent, 0.2 + pulse * 0.2))
      glow.addColorStop(0.55, hexAlpha(accent, 0.05))
      glow.addColorStop(1, hexAlpha(accent, 0))
      context.fillStyle = glow
      context.fillRect(0, 0, width, height)
    }

    const drawInk = (accent) => {
      const now = performance.now()
      trail = trail.filter((point) => now - point.time < 2600)
      trail.forEach((point) => {
        const age = (now - point.time) / 2600
        const opacity = (age < 0.14 ? age / 0.14 : 1 - (age - 0.14) / 0.86) * 0.42
        const radius = point.radius * (0.45 + Math.min(age / 0.35, 1) * 0.55)
        const bleed = context.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius)
        bleed.addColorStop(0, hexAlpha(accent, opacity))
        bleed.addColorStop(0.55, hexAlpha(accent, opacity * 0.48))
        bleed.addColorStop(1, hexAlpha(accent, 0))
        context.fillStyle = bleed
        context.beginPath()
        context.arc(point.x, point.y, radius, 0, Math.PI * 2)
        context.fill()
      })
    }

    const loop = () => {
      if (!active) targetY += (height + 300 - targetY) * 0.04
      pointerX += (targetX - pointerX) * 0.16
      pointerY += (targetY - pointerY) * 0.16
      pulse *= 0.92

      const styles = getComputedStyle(document.querySelector('.enter-page'))
      const ink = styles.getPropertyValue('--enter-ink').trim() || '#e8e6df'
      const accent = styles.getPropertyValue('--enter-accent').trim() || '#9a978f'
      context.clearRect(0, 0, width, height)

      if (modeRef.current === 'grid') drawGrid(ink, accent)
      if (modeRef.current === 'ink') drawInk(accent)
      if (modeRef.current === 'lens') {
        lens.style.transform = `translate(${pointerX}px, ${pointerY}px)`
        const size = 180 + pulse * 90
        lens.style.width = `${size}px`
        lens.style.height = `${size}px`
        lens.style.margin = `${-size / 2}px 0 0 ${-size / 2}px`
      }

      frame = window.requestAnimationFrame(loop)
    }

    const onLeave = (event) => {
      if (!event.relatedTarget) active = false
    }
    const onDown = () => {
      pulse = 1.3
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('mouseout', onLeave)
    window.addEventListener('pointerdown', onDown)
    frame = window.requestAnimationFrame(loop)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('mouseout', onLeave)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [])

  useEffect(() => {
    modeRef.current = hoveredWorld === 'carnet'
      ? 'ink'
      : hoveredWorld === 'limite'
        ? 'lens'
        : 'grid'
    if (lensRef.current) lensRef.current.hidden = modeRef.current !== 'lens'
  }, [hoveredWorld])

  const chooseWorld = (world) => {
    enterWorld(world)
    const destination = location.state?.from
    navigate(destination && destination !== '/enter' ? destination : '/', { replace: true })
  }

  return (
    <div className="enter-page" data-hover-world={hoveredWorld || 'idle'}>
      <canvas ref={canvasRef} className="enter-field" aria-hidden="true" />
      <div ref={lensRef} className="enter-lens" hidden aria-hidden="true" />

      <div className="enter-content">
        <header className="enter-header">
          <span>Carnet de classe</span>
          <span>Trois portes · 读 · 做 · 看</span>
        </header>

        <main className="enter-hero">
          <p>{activeWorld?.eyebrow || 'trois mondes · 三种用途 — lire 读 · faire 做 · voir 看'}</p>
          <h1 className={activeWorld ? '' : 'is-idle'}>
            {activeWorld ? activeWorld.hero : <>TROIS<br />MONDES</>}
          </h1>
        </main>

        <footer
          className="enter-worlds"
          onMouseLeave={() => setHoveredWorld(null)}
        >
          {WORLDS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className="enter-world"
              data-world-id={entry.id}
              onMouseEnter={() => setHoveredWorld(entry.id)}
              onFocus={() => setHoveredWorld(entry.id)}
              onBlur={() => setHoveredWorld(null)}
              onClick={() => chooseWorld(entry.id)}
            >
              <span className="enter-world-image">
                <img src={entry.image} alt="" />
              </span>
              <span className="enter-world-meta">
                <span className="enter-world-name">
                  <small>{entry.number}</small>{entry.name}
                </span>
                <span className="enter-world-intent">{entry.intent}</span>
              </span>
            </button>
          ))}
        </footer>
      </div>
    </div>
  )
}
