import PoincarePlanField from '../../../components/material/PoincarePlanField'
import '../PoincareChapterDesktop.css'

export default function PlanHomeDesktop({
  artifact,
  onSeedChange,
  onSeedCommit,
  onPassage,
  passageActive,
}) {
  return (
    <article className="world-home poincare-chapter-desktop poincare-plan-desktop">
      <header className="poincare-chapter-heading">
        <span>PLAN ℝ</span>
        <h1 lang="fr">Le ciel de Poincaré</h1>
        <span>t = 0</span>
      </header>
      <PoincarePlanField
        artifact={artifact}
        passageActive={passageActive}
        onSeedChange={onSeedChange}
        onSeedCommit={onSeedCommit}
      />
      <footer className="poincare-chapter-passage">
        <span>01 / 03</span>
        <button type="button" onClick={onPassage}>LE CARNET</button>
      </footer>
    </article>
  )
}
