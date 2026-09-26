import { useCallback } from 'react'
import WorldMaterialField from './WorldMaterialField.jsx'
import usePointerField from '../../shared/material/usePointerField.js'

const ACTIONS = { plan: '改变起点', carnet: '找回过去', limite: '推进未来' }

function PosterArtwork({ world }) {
  if (world === 'plan') {
    return (
      <span className="world-poster-art world-poster-plan" aria-hidden="true">
        <span className="poster-plan-r">ℝ</span>
        <span className="poster-plan-axis poster-plan-axis-x" />
        <span className="poster-plan-axis poster-plan-axis-y" />
      </span>
    )
  }

  if (world === 'carnet') {
    return (
      <span className="world-poster-art world-poster-carnet" aria-hidden="true">
        <span className="poster-carnet-c">C</span>
        <span className="poster-carnet-rule" />
      </span>
    )
  }

  return (
    <span className="world-poster-art world-poster-limite" aria-hidden="true">
      <span className="poster-limite-epsilon">ε</span>
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
      aria-label={`${world.name} · ${ACTIONS[world.id]}`}
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
        <strong>{world.name}</strong>
      </span>
    </button>
  )
}
