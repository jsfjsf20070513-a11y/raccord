import { useMemo } from 'react'
import { createPoincareSignature, createPoincareSky, observePoincareSky } from './domain/poincareSkyMath.js'

export default function PoincareMemory({ artifact, onRecall, onWorld, disabled }) {
  const entries = useMemo(() => artifact.memory.map((entry, index) => {
    const sky = createPoincareSky(entry.seed)
    const observation = observePoincareSky(sky, entry.observedProgress)
    const label = observation.crossing !== null
      ? `${Math.round(observation.crossing * 100)}% 时越线`
      : observation.complete ? '全程未越线' : entry.observedProgress > 0 ? `已看至 ${Math.round(entry.observedProgress * 100)}%` : '还未推进时间'
    return { ...entry, index, label, signature: createPoincareSignature(sky) }
  }), [artifact.memory])
  return (
    <div className="poincare-memory-picker">
      <p className="poincare-memory-label">最近的起点 <span>选一条，让它回到现在</span></p>
      {entries.length ? (
        <ol aria-label="起点记录">
          {entries.map((entry) => {
            const selected = entry.seed.x === artifact.seed.x && entry.seed.y === artifact.seed.y
            return (
              <li key={entry.id}>
                <button type="button" onClick={() => onRecall(entry.id)} disabled={disabled}
                  aria-pressed={selected} aria-label={`起点 ${entry.index + 1}，${entry.label}${selected ? '，当前起点' : ''}`}>
                  <span className="poincare-memory-number">{String(entry.index + 1).padStart(2, '0')}<span>{selected ? '当前' : '找回'}</span></span>
                  <svg viewBox="0 0 90 30" aria-hidden="true"><polyline points={entry.signature.map((point) => `${4 + point.progress * 82},${15 - point.primary * 22}`).join(' ')} /></svg>
                  <span className="poincare-memory-caption">{entry.label}</span>
                </button>
              </li>
            )
          })}
        </ol>
      ) : (
        <p className="poincare-memory-empty">这里还没有旧笔迹。<button type="button" onClick={() => onWorld('plan')} disabled={disabled}>先去留下一个起点 →</button></p>
      )}
    </div>
  )
}
