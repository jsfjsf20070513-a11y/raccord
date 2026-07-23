import PoincareLimitField from '../../../components/material/PoincareLimitField'
import '../PoincareChapterDesktop.css'

export default function LimiteHomeDesktop({ artifact, onThreshold, onPassage, passageActive }) {
  return (
    <article className="world-home poincare-chapter-desktop poincare-limite-desktop">
      <header className="poincare-chapter-heading">
        <span>LIMITE</span>
        <h1 lang="fr">Le ciel de Poincaré</h1>
        <span>t → ?</span>
      </header>
      <PoincareLimitField artifact={artifact} onThreshold={onThreshold} passageActive={passageActive} />
      <footer className="poincare-chapter-passage">
        <span>03 / 03</span>
        <button type="button" onClick={onPassage}>PLAN ℝ</button>
      </footer>
    </article>
  )
}
