import PoincareCarnetField from '../../../components/material/PoincareCarnetField'
import '../PoincareChapterDesktop.css'

export default function CarnetHomeDesktop({ artifact, onPassage, passageActive }) {
  return (
    <article className="world-home poincare-chapter-desktop poincare-carnet-desktop">
      <header className="poincare-chapter-heading">
        <span>LE CARNET</span>
        <h1 lang="fr">Le ciel de Poincaré</h1>
        <span>mémoire</span>
      </header>
      <PoincareCarnetField artifact={artifact} passageActive={passageActive} />
      <footer className="poincare-chapter-passage">
        <span>02 / 03</span>
        <button type="button" onClick={onPassage}>LIMITE</button>
      </footer>
    </article>
  )
}
