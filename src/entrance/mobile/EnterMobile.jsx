import { useState } from 'react'
import ScrollAwaken from '../../shared/material/ScrollAwaken.jsx'
import WorldPortalCard from '../material/WorldPortalCard.jsx'
import WorldStageField from '../material/WorldStageField.jsx'
import usePointerField from '../../shared/material/usePointerField.js'
import useEnterAwakening from '../useEnterAwakening.js'
import './EnterMobile.css'

export default function EnterMobile({ worlds, onSelect }) {
  const [activeWorldId, setActiveWorldId] = useState(null)
  const stagePointer = usePointerField({ smoothing: 0.24 })
  const awakening = useEnterAwakening()
  const activeWorld = worlds.find(({ id }) => id === activeWorldId)

  const setActivity = (worldId, active) => {
    setActiveWorldId((current) => (active ? worldId : current === worldId ? null : current))
  }

  return (
    <div
      ref={stagePointer.elementRef}
      className="enter-page enter-portal enter-mobile"
      data-active-world={activeWorldId || 'idle'}
      data-enter-awakening={awakening.isAwakening}
      onPointerMoveCapture={awakening.settle}
      onPointerDownCapture={awakening.settle}
    >
      <WorldStageField mode={activeWorldId || 'idle'} pointerField={stagePointer} />
      <div className="enter-content">
        <header className="enter-header">
          <span>Raccord</span>
          <span>MMXXVI</span>
        </header>
        <main className="enter-hero" aria-live="polite">
          <p>N°00</p>
          <h1
            className={activeWorld ? 'is-active' : 'is-idle'}
            data-idle-copy={activeWorld ? undefined : 'TROIS\nMONDES'}
            aria-label="Trois mondes"
          >
            {activeWorld ? activeWorld.hero : <><span>TROIS</span><span>MONDES</span></>}
          </h1>
        </main>
        <p className="enter-invitation">移动一个起点，看看它如何穿过三个世界。<span>第一次来，可以从 PLAN 开始。</span></p>
        <nav className="enter-worlds" aria-label="Trois mondes">
          {worlds.map((entry, index) => (
            <ScrollAwaken key={entry.id} index={index}>
              <WorldPortalCard
                world={entry}
                onSelect={onSelect}
                onActiveChange={setActivity}
                isStageActive={activeWorldId === entry.id}
                isStageQuiet={Boolean(activeWorldId && activeWorldId !== entry.id)}
              />
            </ScrollAwaken>
          ))}
        </nav>
      </div>
    </div>
  )
}
