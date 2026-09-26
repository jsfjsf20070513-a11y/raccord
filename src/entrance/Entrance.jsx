import { useNavigate } from 'react-router-dom'
import { useWorld } from '../shared/world/useWorld.js'
import EnterDesktop from './desktop/EnterDesktop.jsx'
import EnterMobile from './mobile/EnterMobile.jsx'
import useExperienceMode from '../shared/browser/useExperienceMode.js'
import { WORLDS } from '../shared/world/worlds.js'
import './Entrance.css'

export default function Entrance() {
  const { enterWorld } = useWorld()
  const navigate = useNavigate()
  const experienceMode = useExperienceMode()

  const chooseWorld = (worldId) => {
    enterWorld(worldId)
    navigate('/', { replace: true })
  }

  return experienceMode === 'mobile'
    ? <EnterMobile worlds={WORLDS} onSelect={chooseWorld} />
    : <EnterDesktop worlds={WORLDS} onSelect={chooseWorld} />
}
