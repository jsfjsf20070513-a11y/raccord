import ExplorationGuide from '../ExplorationGuide.jsx'
import PoincareLimitField from '../fields/PoincareLimitField.jsx'
import './PoincareChapterDesktop.css'

export default function LimiteHomeDesktop({ artifact, onWorld, onObserve, onThreshold, onPassage, passageActive }) {
  return (
    <article className="world-home poincare-chapter-desktop poincare-limite-desktop">
      <header className="poincare-chapter-heading">
        <span>LIMITE</span>
        <h1 lang="fr">Le ciel de Poincaré</h1>
        <span>t → ?</span>
      </header>
      <ExplorationGuide world="limite" artifact={artifact} onWorld={onWorld} disabled={passageActive} />
      <PoincareLimitField artifact={artifact} key={`${artifact.seed.x},${artifact.seed.y}`} onThreshold={onThreshold} onObserve={onObserve} passageActive={passageActive} />
      <footer className="poincare-chapter-passage">
        <span>03 / 03</span>
        <button type="button" onClick={onPassage} disabled={passageActive}>换个起点再试 →</button>
      </footer>
    </article>
  )
}
