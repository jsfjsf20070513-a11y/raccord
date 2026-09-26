import { Link } from 'react-router-dom'
import ChapterControls from '../ChapterControls.jsx'
import PoincareLimitField from '../fields/PoincareLimitField.jsx'
import './PoincareChapterDesktop.css'

export default function LimiteHomeDesktop({ artifact, onWorld, onObserve, onThreshold, passageActive }) {
  return (
    <article className="world-home poincare-chapter-desktop poincare-limite-desktop">
      <header className="poincare-chapter-heading">
        <h1><Link to="/enter" lang="fr" aria-label="Le ciel de Poincaré，返回入口">Le ciel de Poincaré</Link></h1>
      </header>
      <PoincareLimitField artifact={artifact} passageActive={passageActive} key={`${artifact.seed.x},${artifact.seed.y}`} onThreshold={onThreshold} onObserve={onObserve} />
      <ChapterControls world="limite" artifact={artifact} onWorld={onWorld} disabled={passageActive} />
    </article>
  )
}
