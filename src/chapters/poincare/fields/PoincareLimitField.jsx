import { useEffect, useMemo, useRef } from 'react'
import { createPoincareSignature, createPoincareSky, observePoincareSky } from '../domain/poincareSkyMath.js'
import usePointerField from '../../../shared/material/usePointerField.js'
import usePoincarePlayback from '../usePoincarePlayback.js'
import './PoincareSkyFields.css'

const BONE = '#e9e3d9'
const VERMILION = '#d9614d'

function rgba(hex, alpha) {
  const value = Number.parseInt(hex.replace('#', ''), 16)
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`
}

export default function PoincareLimitField({ compact = false, artifact, onThreshold, onObserve, passageActive = false }) {
  const seed = artifact?.seed
  const sky = useMemo(() => createPoincareSky(seed), [seed])
  const signature = useMemo(() => createPoincareSignature(sky, 9), [sky])
  const pointerField = usePointerField({ smoothing: compact ? 0.3 : 0.22 })
  const canvasRef = useRef(null)
  const drawRef = useRef(() => {})
  const playback = usePoincarePlayback({ sky, disabled: passageActive, onThreshold, onObserve })
  const progressRef = useRef(0)
  progressRef.current = playback.progress
  const observation = observePoincareSky(sky, playback.progress)

  useEffect(() => { drawRef.current(pointerField.getField(), playback.progress) }, [playback.progress, pointerField])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return undefined
    let size = { width: 1, height: 1, dpr: 1 }

    const draw = (field = pointerField.getField(), progress = progressRef.current) => {
      const { width, height, dpr } = size
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, width, height)
      context.lineCap = 'round'
      context.lineJoin = 'round'
      if (passageActive) return

      const left = width * (compact ? 0.08 : 0.07)
      const right = width * 0.94
      const baseline = height * (compact ? 0.48 : 0.5)
      const amplitude = height * (compact ? 0.22 : 0.28)

      const strokeFuture = (direction, color, alpha) => {
        const anchors = signature.map((sample) => ({
          x: left + sample.progress * (right - left),
          y: baseline - sample.primary * height * 0.06 + direction * sample.divergence * amplitude,
        }))
        context.save()
        context.beginPath()
        context.rect(left - 2, 0, Math.max(0, (right - left) * progress + 4), height)
        context.clip()
        context.beginPath()
        context.moveTo(anchors[0].x, anchors[0].y)
        for (let index = 1; index < anchors.length - 1; index += 1) {
          const current = anchors[index]
          const next = anchors[index + 1]
          context.quadraticCurveTo(current.x, current.y, (current.x + next.x) * 0.5, (current.y + next.y) * 0.5)
        }
        const last = anchors.at(-1)
        context.lineTo(last.x, last.y)
        context.strokeStyle = rgba(color, alpha)
        context.lineWidth = direction < 0 ? 1.25 : 1
        context.stroke()
        context.restore()
      }
      strokeFuture(-1, BONE, 0.88)
      strokeFuture(1, VERMILION, 0.92)

      const originY = baseline - (signature[0]?.primary || 0) * height * 0.06
      context.strokeStyle = rgba(BONE, 0.36)
      context.lineWidth = 0.65
      context.beginPath()
      context.arc(left, originY, compact ? 5 : 6, 0, Math.PI * 2)
      context.stroke()
      context.fillStyle = rgba(VERMILION, 0.88)
      context.beginPath()
      context.arc(left, originY, compact ? 1.8 : 2.2, 0, Math.PI * 2)
      context.fill()

      if (sky.thresholdProgress !== null) {
        const thresholdX = left + sky.thresholdProgress * (right - left)
        context.strokeStyle = rgba(VERMILION, progress >= sky.thresholdProgress ? 0.82 : 0.28)
        context.lineWidth = 0.8
        context.setLineDash(progress >= sky.thresholdProgress ? [] : [3, 7])
        context.beginPath()
        context.moveTo(thresholdX, height * 0.17)
        context.lineTo(thresholdX, height * 0.82)
        context.stroke()
        context.setLineDash([])
      }

      if (field.active > 0.02) {
        const radius = Math.min(width, height) * 0.23
        for (let index = 0; index < 7; index += 1) {
          const offset = (index - 3) * 5
          const arcRadius = Math.max(0.5, radius + offset)
          const alpha = field.active * (0.04 - Math.abs(index - 3) * 0.006)
          context.strokeStyle = rgba(BONE, Math.max(0.006, alpha))
          context.lineWidth = 0.5
          context.beginPath()
          context.arc(field.x, field.y, arcRadius, Math.PI * 1.08, Math.PI * 1.92)
          context.stroke()
        }
      }


    }

    drawRef.current = draw
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const width = Math.max(1, Math.round(rect.width))
      const height = Math.max(1, Math.round(rect.height))
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      size = { width, height, dpr }
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      draw()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    const unsubscribe = pointerField.subscribe((field) => draw(field))
    resize()
    return () => { observer.disconnect(); unsubscribe() }
  }, [artifact?.scar, compact, passageActive, pointerField, signature, sky])

  const begin = (event) => {
    if (event.button !== 0 || passageActive) return
    event.preventDefault()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    playback.play()
  }
  const release = () => playback.pause()
  const handleKeyDown = (event) => {
    if (![' ', 'Enter'].includes(event.key)) return
    event.preventDefault()
    if (event.repeat) return
    if (event.key === 'Enter') playback.toggle()
    else playback.play()
  }
  const handleKeyUp = (event) => {
    if (event.key !== ' ') return
    event.preventDefault()
    playback.pause()
  }
  const result = observation.crossing !== null
    ? `发现分岔：在 ${Math.round(observation.crossing * 100)}% 处，间距首次达到起始的 18 倍。`
    : observation.complete
      ? '这段轨迹走完了，间距始终没有达到起始的 18 倍。换个起点，还会这样吗？'
      : sky.thresholdProgress === null
        ? '这次没有红线。推进到末尾，看看两条轨迹会怎样。'
        : '试着停在红线附近，看看细小的差别什么时候被放大。'

  return (
    <>
    <section
      ref={pointerField.elementRef}
      className={`poincare-field poincare-limit-field${compact ? ' is-compact' : ''}`}
      data-phase={playback.playing ? 'loading' : playback.progress > 0 ? 'paused' : 'dormant'}
      data-scar={artifact?.scar ? 'present' : 'absent'}
      data-seed={`${sky.seed.x.toFixed(3)},${sky.seed.y.toFixed(3)}`}
      data-passage={passageActive ? 'active' : 'dormant'}
      data-threshold={sky.thresholdProgress?.toFixed(3) ?? 'none'}
      role="button"
      tabIndex={0}
      aria-pressed={playback.playing}
      aria-label="推进未来：按住画面或空格，松开暂停；回车切换播放"
      onPointerDown={begin}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onBlur={(event) => { if (!event.relatedTarget?.closest('.poincare-playback')) release() }}
    >
      <canvas ref={canvasRef} aria-hidden="true" />

    </section>
    <div className="poincare-playback" data-playing={playback.playing}>
      <div className="poincare-readings" aria-live="off">
        <span>进度 <strong>{Math.round(playback.progress * 100)}%</strong></span>
        <span>间距 <strong>{observation.ratio.toFixed(1)}×</strong></span>
        <span>已见最大 <strong>{observation.maxRatio.toFixed(1)}×</strong></span>
      </div>
      <input
        type="range" min="0" max="1000" step="1"
        value={Math.round(playback.progress * 1000)}
        style={{ '--playback-progress': `${playback.progress * 100}%` }}
        onChange={(event) => playback.seek(Number(event.target.value) / 1000)}
        aria-label="轨迹进度" aria-valuetext={`${Math.round(playback.progress * 100)}%`}
        disabled={passageActive}
      />
      <div className="poincare-playback-actions">
        <button type="button" onClick={playback.toggle} disabled={passageActive || playback.progress === 1}>
          {playback.playing ? '暂停' : playback.progress === 1 ? '已看完' : playback.progress > 0 ? '继续推进' : '开始推进'}
        </button>
        <button type="button" onClick={playback.restart} disabled={passageActive || playback.progress === 0}>从头重放</button>
      </div>
      <p className="poincare-result" role="status">{result}</p>
      <p className="poincare-reading-note">倍数来自模型中的距离；画面是它的另一种表达。</p>
    </div>
    </>
  )
}
