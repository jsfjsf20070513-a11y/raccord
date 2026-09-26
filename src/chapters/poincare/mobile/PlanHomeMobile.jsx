import ExplorationGuide from '../ExplorationGuide.jsx'
import PoincarePlanField from '../fields/PoincarePlanField.jsx'
import './PoincareChapterMobile.css'

export default function PlanHomeMobile({
  artifact,
  onWorld,
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
      <ExplorationGuide world="plan" artifact={artifact} onWorld={onWorld} disabled={passageActive} />
      <PoincarePlanField
        compact
        artifact={artifact}
        passageActive={passageActive}
        onSeedChange={onSeedChange}
        onSeedCommit={onSeedCommit}
      />
      <footer className="poincare-mobile-passage">
        <span>01 / 03</span>
        <button type="button" onClick={onPassage} disabled={passageActive}>去找回过去 →</button>
      </footer>
    </article>
  )
}
