import { Link } from 'react-router-dom'
import ChapterControls from '../ChapterControls.jsx'
import PoincarePlanField from '../fields/PoincarePlanField.jsx'
import './PoincareChapterMobile.css'

export default function PlanHomeMobile({ artifact, onWorld, onSeedChange, onSeedCommit, passageActive }) {
  return (
    <article className="world-home poincare-chapter-mobile poincare-plan-mobile">
      <header className="poincare-mobile-heading">
        <h1><Link to="/enter" lang="fr" aria-label="Le ciel de Poincaré，返回入口">Le ciel de Poincaré</Link></h1>
      </header>
      <PoincarePlanField compact artifact={artifact} passageActive={passageActive} onSeedChange={onSeedChange} onSeedCommit={onSeedCommit} />
      <ChapterControls world="plan" artifact={artifact} onWorld={onWorld} disabled={passageActive} />
    </article>
  )
}
