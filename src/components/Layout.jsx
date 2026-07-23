import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useWorld } from '../context/useWorld'
import DesktopWorldLayout from '../experiences/desktop/DesktopWorldLayout'
import MobileWorldLayout from '../experiences/mobile/MobileWorldLayout'
import useExperienceMode from '../experiences/shared/useExperienceMode'
import './Layout.css'

export default function Layout() {
  const location = useLocation()
  const { user, signOut, isAuthEnabled } = useAuth()
  const { world } = useWorld()
  const experienceMode = useExperienceMode()
  const isDetachedTool = location.pathname === '/vocabulary' || location.pathname === '/assistant'
  const presentationWorld = isDetachedTool ? 'limite' : world
  const displayName = user?.user_metadata?.nickname || user?.user_metadata?.real_name || user?.email || ''
  const props = {
    world: presentationWorld,
    pathname: location.pathname,
    user,
    displayName,
    isAuthEnabled,
    onSignOut: signOut,
    scope: isDetachedTool ? 'tool' : 'world',
  }
  return experienceMode === 'mobile' ? <MobileWorldLayout {...props} /> : <DesktopWorldLayout {...props} />
}
