import { Link } from 'react-router-dom'
import ChapterControls from '../ChapterControls.jsx'
import PoincareCarnetField from '../fields/PoincareCarnetField.jsx'
import './PoincareChapterMobile.css'

export default function CarnetHomeMobile({ artifact, onWorld, onRecall, passageActive }) {
  return (
    <article className="world-home poincare-chapter-mobile poincare-carnet-mobile">
      <header className="poincare-mobile-heading">
        <h1><Link to="/enter" lang="fr" aria-label="Le ciel de Poincaré，返回入口">Le ciel de Poincaré</Link></h1>
      </header>
      <PoincareCarnetField compact artifact={artifact} passageActive={passageActive} onRecall={onRecall} />
      <ChapterControls world="carnet" artifact={artifact} onWorld={onWorld} disabled={passageActive} />
    </article>
  )
}
