import PoincareLimitField from '../../../components/material/PoincareLimitField'
import '../PoincareChapterMobile.css'

export default function LimiteHomeMobile({ artifact, onThreshold, onPassage, passageActive }) {
  return (
    <article className="world-home poincare-chapter-mobile poincare-limite-mobile">
      <header className="poincare-mobile-heading">
        <span>LIMITE</span>
        <h1 lang="fr">Le ciel de Poincaré</h1>
        <span>t → ?</span>
      </header>
      <PoincareLimitField compact artifact={artifact} onThreshold={onThreshold} passageActive={passageActive} />
      <footer className="poincare-mobile-passage">
        <span>03 / 03</span>
        <button type="button" onClick={onPassage}>PLAN ℝ</button>
      </footer>
    </article>
  )
}
