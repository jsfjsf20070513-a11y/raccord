import { useEffect, useRef, useState } from 'react'
import './ChapterControls.css'

const WORLDS = [
  { id: 'plan', label: '起点' },
  { id: 'carnet', label: '记忆' },
  { id: 'limite', label: '未来' },
]

export default function ChapterControls({ world, artifact, onWorld, disabled }) {
  const dialogRef = useRef(null)
  const [helpOpen, setHelpOpen] = useState(false)
  useEffect(() => {
    if (helpOpen) dialogRef.current?.showModal()
    else dialogRef.current?.close()
  }, [helpOpen])

  return (
    <>
      {world === 'plan' && artifact.memory.length === 0 && <p className="poincare-first-action">拖动蓝点</p>}
      <nav className="poincare-controls" aria-label="三个世界">
        {WORLDS.map(({ id, label }) => (
          <button key={id} type="button" onClick={() => onWorld(id)} disabled={disabled}
            aria-current={world === id ? 'page' : undefined}>{label}</button>
        ))}
        <button type="button" className="poincare-help-button" onClick={() => setHelpOpen(true)} disabled={disabled}>玩法</button>
      </nav>
      <dialog className="poincare-help" ref={dialogRef} onClose={() => setHelpOpen(false)} aria-labelledby="poincare-help-title">
        <button type="button" className="poincare-help-close" onClick={() => setHelpOpen(false)} aria-label="关闭玩法">×</button>
        <h2 id="poincare-help-title">三个世界，一次选择</h2>
        <ol>
          <li><strong>改变起点 {artifact.discoveries.placed && '✓'}</strong><p>把蓝点放在两个不同的位置，看看曲线怎样改变。方向键也可以。</p></li>
          <li><strong>找回过去 {artifact.discoveries.recalled && '✓'}</strong><p>在「记忆」里显影，用上一笔、下一笔找回一个旧起点。</p></li>
          <li><strong>看见未来 {artifact.discoveries.observed && '✓'}</strong><p>按住画面推进，松手暂停。也可以播放、拖动时间或重放，看看曲线何时越过红线。</p></li>
        </ol>
        <p>红线是模型中间距首次达到起始的 18 倍的位置。有些起点，这一段始终不会越线。</p>
      </dialog>
    </>
  )
}
