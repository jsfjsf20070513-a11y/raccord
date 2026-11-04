import { useCallback, useState } from 'react'
import { useWorld } from '../../shared/world/useWorld.js'
import PoincarePassageDesktop from './desktop/PoincarePassageDesktop.jsx'
import CarnetHomeDesktop from './desktop/CarnetHomeDesktop.jsx'
import LimiteHomeDesktop from './desktop/LimiteHomeDesktop.jsx'
import PlanHomeDesktop from './desktop/PlanHomeDesktop.jsx'
import PoincarePassageMobile from './mobile/PoincarePassageMobile.jsx'
import CarnetHomeMobile from './mobile/CarnetHomeMobile.jsx'
import LimiteHomeMobile from './mobile/LimiteHomeMobile.jsx'
import PlanHomeMobile from './mobile/PlanHomeMobile.jsx'
import useExperienceMode from '../../shared/browser/useExperienceMode.js'

export default function PoincareChapter({ poincare }) {
  const { world, setWorld } = useWorld()
  const experienceMode = useExperienceMode()
  const isMobile = experienceMode === 'mobile'
  const [passage, setPassage] = useState(null)

  const beginPassage = useCallback((to) => {
    setPassage((current) => current || { from: world, to })
  }, [world])
  const crossPassage = useCallback(() => {
    if (passage) setWorld(passage.to)
  }, [passage, setWorld])
  const finishPassage = useCallback(() => setPassage(null), [])

  let WorldHome
  let worldProps

  if (world === 'plan') {
    WorldHome = isMobile ? PlanHomeMobile : PlanHomeDesktop
    worldProps = {
      artifact: poincare.artifact,
      onSeedChange: poincare.changeSeed,
      onSeedCommit: poincare.rememberSeed,
      onPassage: () => beginPassage('carnet'),
    }
  } else if (world === 'limite') {
    WorldHome = isMobile ? LimiteHomeMobile : LimiteHomeDesktop
    worldProps = {
      artifact: poincare.artifact,
      onThreshold: poincare.recordThreshold,
      onPassage: () => beginPassage('plan'),
    }
  } else {
    WorldHome = isMobile ? CarnetHomeMobile : CarnetHomeDesktop
    worldProps = {
      artifact: poincare.artifact,
      onPassage: () => beginPassage('limite'),
    }
  }
  worldProps.passageActive = Boolean(passage)

  const Passage = isMobile ? PoincarePassageMobile : PoincarePassageDesktop
  return (
    <>
      <WorldHome {...worldProps} />
      {passage && (
        <Passage
          artifact={poincare.artifact}
          from={passage.from}
          to={passage.to}
          onMidpoint={crossPassage}
          onComplete={finishPassage}
        />
      )}
    </>
  )
}
