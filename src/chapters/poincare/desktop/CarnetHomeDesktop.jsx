import PoincareMemory from '../PoincareMemory.jsx'
import ExplorationGuide from '../ExplorationGuide.jsx'
import PoincareCarnetField from '../fields/PoincareCarnetField.jsx'
import './PoincareChapterDesktop.css'

export default function CarnetHomeDesktop({ artifact, onWorld, onRecall, onPassage, passageActive }) {
  return (
    <article className="world-home poincare-chapter-desktop poincare-carnet-desktop">
      <header className="poincare-chapter-heading">
        <span>LE CARNET</span>
        <h1 lang="fr">Le ciel de Poincaré</h1>
        <span>mémoire</span>
      </header>
      <ExplorationGuide world="carnet" artifact={artifact} onWorld={onWorld} disabled={passageActive} />
      <PoincareCarnetField artifact={artifact} passageActive={passageActive} />
      <PoincareMemory artifact={artifact} onRecall={onRecall} onWorld={onWorld} disabled={passageActive} />
      <footer className="poincare-chapter-passage">
        <span>02 / 03</span>
        <button type="button" onClick={onPassage} disabled={passageActive}>带它去看未来 →</button>
      </footer>
    </article>
  )
}
