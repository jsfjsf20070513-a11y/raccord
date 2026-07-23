import { useState } from 'react'
import PlanPrototypeSurface from '../../../components/material/PlanPrototypeSurface'
import { PLAN_PROTOTYPE_META } from '../../../components/material/planPrototypeMath'
import './PlanCenterPrototypeMobile.css'

function MobileReadout({ variant, metrics }) {
  if (variant === 'A') {
    return <dl className="plan-prototype-mobile-readout"><div><dt>Classe</dt><dd>{metrics?.grade || '—'}</dd></div><div><dt>Δ courbure</dt><dd>{metrics ? metrics.curvatureJump.toFixed(3) : '—'}</dd></div></dl>
  }
  if (variant === 'B') {
    return <dl className="plan-prototype-mobile-readout"><div><dt>Rang</dt><dd>{metrics?.rank ?? '—'}</dd></div><div><dt>Mobilité</dt><dd>{metrics?.mechanisms ?? '—'}</dd></div></dl>
  }
  return <dl className="plan-prototype-mobile-readout"><div><dt>Déterminant</dt><dd>{metrics ? metrics.determinant.toFixed(2) : '—'}</dd></div><div><dt>Résidu</dt><dd>{metrics ? metrics.residual.toFixed(2) : '—'}</dd></div></dl>
}

export default function PlanCenterPrototypeMobile({
  variant,
  formal = false,
  artifact,
  onArtifactHandleChange,
  onConstructionComplete,
}) {
  const [metrics, setMetrics] = useState(null)
  const meta = PLAN_PROTOTYPE_META[variant]

  return (
    <section className="plan-center-prototype-mobile" data-plan-variant={variant}>
      <p className="plan-prototype-mobile-plate">{meta.plate}</p>
      <div className="plan-prototype-mobile-masthead">
        <h1>PLAN <span>ℝ</span></h1>
        <span>{formal ? '01' : `${variant}/3`}</span>
      </div>

      {variant === 'B' ? <MobileReadout variant={variant} metrics={metrics} /> : null}

      <div className={`plan-prototype-mobile-object plan-prototype-mobile-object-${variant.toLowerCase()}`}>
        <header>
          <span>{formal ? '01' : `0${variant.charCodeAt(0) - 64}`}</span>
          <strong>{formal && variant === 'A' ? 'Raccord → C²' : meta.title}</strong>
          {!formal ? <small>{meta.action}</small> : null}
        </header>
        <PlanPrototypeSurface
          key={variant}
          variant={variant}
          compact
          artifactHandle={artifact?.handle}
          construction={artifact?.history?.construction}
          onArtifactHandleChange={onArtifactHandleChange}
          onConstructionComplete={onConstructionComplete}
          onMetrics={setMetrics}
        />
      </div>

      {variant !== 'B' ? <MobileReadout variant={variant} metrics={metrics} /> : null}
    </section>
  )
}
