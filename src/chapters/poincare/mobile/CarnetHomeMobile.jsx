import PoincareMemory from '../PoincareMemory.jsx'
import ExplorationGuide from '../ExplorationGuide.jsx'
import PoincareCarnetField from '../fields/PoincareCarnetField.jsx'
import './PoincareChapterMobile.css'

export default function CarnetHomeMobile({ artifact, onWorld, onRecall, onPassage, passageActive }) {
  return (
    <article className="world-home poincare-chapter-mobile poincare-carnet-mobile">
      <header className="poincare-mobile-heading">
        <span>LE CARNET</span>
        <h1 lang="fr">Le ciel de Poincaré</h1>
        <span>mémoire</span>
      </header>
      <ExplorationGuide world="carnet" artifact={artifact} onWorld={onWorld} disabled={passageActive} />
      <PoincareCarnetField compact artifact={artifact} passageActive={passageActive} />
      <PoincareMemory artifact={artifact} onRecall={onRecall} onWorld={onWorld} disabled={passageActive} />
      <footer className="poincare-mobile-passage">
        <span>02 / 03</span>
        <button type="button" onClick={onPassage} disabled={passageActive}>带它去看未来 →</button>
      </footer>
    </article>
  )
}
