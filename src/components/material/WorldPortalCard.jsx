import { useCallback } from 'react'
import WorldMaterialField from './WorldMaterialField'
import usePointerField from './usePointerField'

function PosterArtwork({ world }) {
  if (world === 'plan') {
    return (
      <span className="world-poster-art world-poster-plan" aria-hidden="true">
        <span className="poster-plan-index">01—25</span>
        <span className="poster-plan-r">ℝ</span>
        <span className="poster-plan-axis poster-plan-axis-x" />
        <span className="poster-plan-axis poster-plan-axis-y" />
        <span className="poster-plan-coordinate">x₀ / y₀</span>
      </span>
    )
  }

  if (world === 'carnet') {
    return (
      <span className="world-poster-art world-poster-carnet" aria-hidden="true">
        <span className="poster-carnet-folio">N°02 · MMXXVI</span>
        <span className="poster-carnet-c">C</span>
        <span className="poster-carnet-formula">∫ f · dμ</span>
        <span className="poster-carnet-rule" />
      </span>
    )
  }

  return (
    <span className="world-poster-art world-poster-limite" aria-hidden="true">
      <span className="poster-limite-index">03</span>
      <span className="poster-limite-epsilon">ε</span>
      <span className="poster-limite-readout">0.03125</span>
      <span className="poster-limite-threshold">0⁺</span>
    </span>
  )
}

export default function WorldPortalCard({
  world,
  onSelect,
  onActiveChange,
  isStageActive = false,
  isStageQuiet = false,
  awakenProgress = 1,
}) {
  const handleFieldActivity = useCallback((active) => {
    onActiveChange?.(world.id, active)
  }, [onActiveChange, world.id])
  const pointerField = usePointerField({
    enabled: awakenProgress > 0.04,
    onActiveChange: handleFieldActivity,
  })

  return (
    <button
      ref={pointerField.elementRef}
      type="button"
      className="world-portal-card"
      data-world-id={world.id}
      data-stage-active={isStageActive ? 'true' : 'false'}
      data-stage-quiet={isStageQuiet ? 'true' : 'false'}
      style={{ '--awaken-progress': awakenProgress }}
      onClick={() => onSelect(world.id)}
      aria-label={world.name}
    >
      <span className="world-material-frame">
        <PosterArtwork world={world.id} />
        <WorldMaterialField
          world={world.id}
          pointerField={pointerField}
          awakenProgress={awakenProgress}
        />
      </span>

      <span className="world-portal-meta">
        <span className="world-portal-number">{world.number}</span>
        <strong>{world.name}</strong>
      </span>
    </button>
  )
}
