import PoincareCarnetField from '../../../components/material/PoincareCarnetField'
import '../PoincareChapterMobile.css'

export default function CarnetHomeMobile({ artifact, onPassage, passageActive }) {
  return (
    <article className="world-home poincare-chapter-mobile poincare-carnet-mobile">
      <header className="poincare-mobile-heading">
        <span>LE CARNET</span>
        <h1 lang="fr">Le ciel de Poincaré</h1>
        <span>mémoire</span>
      </header>
      <PoincareCarnetField compact artifact={artifact} passageActive={passageActive} />
      <footer className="poincare-mobile-passage">
        <span>02 / 03</span>
        <button type="button" onClick={onPassage}>LIMITE</button>
      </footer>
    </article>
  )
}
