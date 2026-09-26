import { Link } from 'react-router-dom'
import ChapterControls from '../ChapterControls.jsx'
import PoincareCarnetField from '../fields/PoincareCarnetField.jsx'
import './PoincareChapterDesktop.css'

export default function CarnetHomeDesktop({ artifact, onWorld, onRecall, passageActive }) {
  return (
    <article className="world-home poincare-chapter-desktop poincare-carnet-desktop">
      <header className="poincare-chapter-heading">
        <h1><Link to="/enter" lang="fr" aria-label="Le ciel de Poincaré，返回入口">Le ciel de Poincaré</Link></h1>
      </header>
      <PoincareCarnetField artifact={artifact} passageActive={passageActive} onRecall={onRecall} />
      <ChapterControls world="carnet" artifact={artifact} onWorld={onWorld} disabled={passageActive} />
    </article>
  )
}
