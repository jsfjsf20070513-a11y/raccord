import { useLocation, useNavigate } from 'react-router-dom'
import { useWorld } from '../context/useWorld'
import EnterDesktop from '../experiences/desktop/EnterDesktop'
import EnterMobile from '../experiences/mobile/EnterMobile'
import useExperienceMode from '../experiences/shared/useExperienceMode'
import { WORLDS } from '../experiences/shared/worlds'
import './Enter.css'

export default function Enter() {
  const { enterWorld } = useWorld()
  const navigate = useNavigate()
  const location = useLocation()
  const experienceMode = useExperienceMode()

  const chooseWorld = (worldId) => {
    enterWorld(worldId)
    const destination = location.state?.from
    navigate(destination && destination !== '/enter' ? destination : '/', { replace: true })
  }

  return experienceMode === 'mobile'
    ? <EnterMobile worlds={WORLDS} onSelect={chooseWorld} />
    : <EnterDesktop worlds={WORLDS} onSelect={chooseWorld} />
}
