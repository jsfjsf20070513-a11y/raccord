import PoincarePlanField from '../../../components/material/PoincarePlanField'
import '../PoincareChapterMobile.css'

export default function PlanHomeMobile({
  artifact,
  onSeedChange,
  onSeedCommit,
  onPassage,
  passageActive,
}) {
  return (
    <article className="world-home poincare-chapter-mobile poincare-plan-mobile">
      <header className="poincare-mobile-heading">
        <span>PLAN ℝ</span>
        <h1 lang="fr">Le ciel de Poincaré</h1>
        <span>t = 0</span>
      </header>
      <PoincarePlanField
        compact
        artifact={artifact}
        passageActive={passageActive}
        onSeedChange={onSeedChange}
        onSeedCommit={onSeedCommit}
      />
      <footer className="poincare-mobile-passage">
        <span>01 / 03</span>
        <button type="button" onClick={onPassage}>LE CARNET</button>
      </footer>
    </article>
  )
}
