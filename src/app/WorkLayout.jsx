import { useLocation } from 'react-router-dom'
import { useWorld } from '../shared/world/useWorld'
import useExperienceMode from '../shared/browser/useExperienceMode'
import DesktopLayout from './DesktopLayout'
import MobileLayout from './MobileLayout'
import './layout.css'

export default function WorkLayout() {
  const { world } = useWorld()
  const { pathname } = useLocation()
  const mode = useExperienceMode()
  const props = { world, isHome: pathname === '/' }
  return mode === 'mobile' ? <MobileLayout {...props} /> : <DesktopLayout {...props} />
}
