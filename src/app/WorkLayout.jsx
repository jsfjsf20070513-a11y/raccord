import { Outlet, useLocation } from 'react-router-dom'
import { useWorld } from '../shared/world/useWorld'
import useExperienceMode from '../shared/browser/useExperienceMode'
import DesktopHeader from './DesktopHeader'
import MobileHeader from './MobileHeader'
import './layout.css'

export default function WorkLayout() {
  const { world } = useWorld()
  const { pathname } = useLocation()
  const mode = useExperienceMode()
  const Header = mode === 'mobile' ? MobileHeader : DesktopHeader
  return (
    <div className={`site-shell world-site-shell site-layout-${mode} has-quiet-header${pathname === '/' ? ' is-world-home' : ''}`} data-site-world={world}>
      <Header world={world} />
      <main className="site-main world-site-main"><Outlet /></main>
    </div>
  )
}
