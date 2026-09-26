import ExplorationGuide from '../ExplorationGuide.jsx'
import PoincarePlanField from '../fields/PoincarePlanField.jsx'
import './PoincareChapterDesktop.css'

export default function PlanHomeDesktop({
  artifact,
  onWorld,
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
      <ExplorationGuide world="plan" artifact={artifact} onWorld={onWorld} disabled={passageActive} />
      <PoincarePlanField
        artifact={artifact}
        passageActive={passageActive}
        onSeedChange={onSeedChange}
        onSeedCommit={onSeedCommit}
      />
      <footer className="poincare-chapter-passage">
        <span>01 / 03</span>
        <button type="button" onClick={onPassage} disabled={passageActive}>去找回过去 →</button>
      </footer>
    </article>
  )
}
