import { useState } from 'react'
import PlanPrototypeSurface from '../../../components/material/PlanPrototypeSurface'
import { PLAN_PROTOTYPE_META } from '../../../components/material/planPrototypeMath'
import './PlanCenterPrototypeDesktop.css'

function CurveVariant({
  onMetrics,
  metrics,
  formal = false,
  artifactHandle,
  construction,
  onArtifactHandleChange,
  onConstructionComplete,
}) {
  return (
    <div className="plan-prototype-desktop-stage plan-prototype-desktop-curve">
      <div className="plan-prototype-object-label">
        <span>{formal ? 'Bézier · objet 01' : '01 / A'}</span>
        <strong>{formal ? <>Raccord<br />→ C²</> : <>Atelier<br />de raccord</>}</strong>
        {!formal ? <small>Ajuster une poignée</small> : null}
      </div>
      <div className="plan-prototype-curve-instrument">
        <PlanPrototypeSurface
          variant="A"
          artifactHandle={artifactHandle}
          construction={construction}
          onArtifactHandleChange={onArtifactHandleChange}
          onConstructionComplete={onConstructionComplete}
          onMetrics={onMetrics}
        />
        <dl className="plan-prototype-readout" aria-label="Mesures de raccord">
          <div><dt>Classe</dt><dd>{metrics?.grade || '—'}</dd></div>
          <div><dt>Δ courbure</dt><dd>{metrics ? metrics.curvatureJump.toFixed(3) : '—'}</dd></div>
        </dl>
      </div>
    </div>
  )
}

function FrameVariant({ onMetrics, metrics }) {
  return (
    <div className="plan-prototype-desktop-stage plan-prototype-desktop-frame">
      <PlanPrototypeSurface variant="B" onMetrics={onMetrics} />
      <aside className="plan-prototype-frame-ledger">
        <div className="plan-prototype-object-label">
          <span>02 / B</span>
          <strong>Charpente<br />plane</strong>
          <small>Ajouter une traverse</small>
        </div>
        <dl className="plan-prototype-readout" aria-label="Mesures de rigidité">
          <div><dt>Rang</dt><dd>{metrics?.rank ?? '—'}</dd></div>
          <div><dt>Mobilité</dt><dd>{metrics?.mechanisms ?? '—'}</dd></div>
        </dl>
      </aside>
    </div>
  )
}

function CompositionVariant({ onMetrics, metrics }) {
  return (
    <div className="plan-prototype-desktop-stage plan-prototype-desktop-composition">
      <header className="plan-prototype-composition-heading">
        <div className="plan-prototype-object-label">
          <span>03 / C</span>
          <strong>Composition 2×2</strong>
          <small>Insérer une plaque</small>
        </div>
        <dl className="plan-prototype-readout" aria-label="Mesures de composition">
          <div><dt>Déterminant</dt><dd>{metrics ? metrics.determinant.toFixed(2) : '—'}</dd></div>
          <div><dt>Résidu</dt><dd>{metrics ? metrics.residual.toFixed(2) : '—'}</dd></div>
        </dl>
      </header>
      <PlanPrototypeSurface variant="C" onMetrics={onMetrics} />
    </div>
  )
}

export default function PlanCenterPrototypeDesktop({
  variant,
  formal = false,
  artifact,
  onArtifactHandleChange,
  onConstructionComplete,
}) {
  const [metrics, setMetrics] = useState(null)
  const meta = PLAN_PROTOTYPE_META[variant]

  return (
    <section className="plan-center-prototype-desktop" data-plan-variant={variant}>
      {!formal ? (
        <header className="plan-prototype-running">
          <span>中国人民大学 · 中法学院 · Suzhou</span>
          <span>COORD. 31.25 / 120.72</span>
        </header>
      ) : null}
      <div className="plan-prototype-masthead">
        <div><p>{meta.plate}</p><h1>PLAN <span>ℝ</span></h1></div>
        {!formal ? <p>{`Prototype réversible · ${variant}/3`}</p> : null}
      </div>
      {variant === 'A' ? (
        <CurveVariant
          onMetrics={setMetrics}
          metrics={metrics}
          formal={formal}
          artifactHandle={artifact?.handle}
          construction={artifact?.history?.construction}
          onArtifactHandleChange={onArtifactHandleChange}
          onConstructionComplete={onConstructionComplete}
        />
      ) : null}
      {variant === 'B' ? <FrameVariant onMetrics={setMetrics} metrics={metrics} /> : null}
      {variant === 'C' ? <CompositionVariant onMetrics={setMetrics} metrics={metrics} /> : null}
    </section>
  )
}
