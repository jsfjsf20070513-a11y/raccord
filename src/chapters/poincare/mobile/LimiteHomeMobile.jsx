import { Link } from 'react-router-dom'
import ChapterControls from '../ChapterControls.jsx'
import PoincareLimitField from '../fields/PoincareLimitField.jsx'
import './PoincareChapterMobile.css'

export default function LimiteHomeMobile({ artifact, onWorld, onObserve, onThreshold, passageActive }) {
  return (
    <article className="world-home poincare-chapter-mobile poincare-limite-mobile">
      <header className="poincare-mobile-heading">
        <h1><Link to="/enter" lang="fr" aria-label="Le ciel de Poincaré，返回入口">Le ciel de Poincaré</Link></h1>
      </header>
      <PoincareLimitField compact artifact={artifact} passageActive={passageActive} key={`${artifact.seed.x},${artifact.seed.y}`} onThreshold={onThreshold} onObserve={onObserve} />
      <ChapterControls world="limite" artifact={artifact} onWorld={onWorld} disabled={passageActive} />
    </article>
  )
}
