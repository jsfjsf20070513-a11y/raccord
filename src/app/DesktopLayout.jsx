import { Link, Outlet } from 'react-router-dom'
import { WORLD_LABELS } from '../shared/world/worlds'

export default function DesktopLayout({ world, isHome }) {
  return (
    <div className={`site-shell world-site-shell site-layout-desktop has-quiet-header${isHome ? ' is-world-home' : ''}`} data-site-world={world}>
      <header className="site-header world-site-header">
        <div className="site-header-inner world-site-header-inner">
          <div className="site-brand-lockup">
            <Link to="/" className="site-wordmark">Raccord</Link>
            <span className="site-world-label">{WORLD_LABELS[world]}</span>
          </div>
          <span className="world-site-breathing-room" aria-hidden="true" />
          <div className="site-header-actions world-site-actions">
            <Link to="/enter" className="site-world-switch" aria-label="切换视觉世界">⇄ <span>changer</span></Link>
          </div>
        </div>
      </header>
      <main className="site-main world-site-main"><Outlet /></main>
    </div>
  )
}
