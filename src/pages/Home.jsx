import { useCallback, useState } from 'react'
import usePoincareSky from '../components/material/usePoincareSky'
import { useWorld } from '../context/useWorld'
import PoincarePassageDesktop from '../experiences/desktop/PoincarePassageDesktop'
import CarnetHomeDesktop from '../experiences/desktop/worlds/CarnetHomeDesktop'
import LimiteHomeDesktop from '../experiences/desktop/worlds/LimiteHomeDesktop'
import PlanHomeDesktop from '../experiences/desktop/worlds/PlanHomeDesktop'
import PoincarePassageMobile from '../experiences/mobile/PoincarePassageMobile'
import CarnetHomeMobile from '../experiences/mobile/worlds/CarnetHomeMobile'
import LimiteHomeMobile from '../experiences/mobile/worlds/LimiteHomeMobile'
import PlanHomeMobile from '../experiences/mobile/worlds/PlanHomeMobile'
import useExperienceMode from '../experiences/shared/useExperienceMode'

export default function Home() {
  const { world, setWorld } = useWorld()
  const experienceMode = useExperienceMode()
  const isMobile = experienceMode === 'mobile'
  const poincare = usePoincareSky()
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
