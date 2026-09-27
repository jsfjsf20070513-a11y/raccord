import { Link, Outlet } from 'react-router-dom'
import { WORLD_LABELS } from '../shared/world/worlds'

export default function MobileLayout({ world, isHome }) {
  return (
    <div className={`site-shell world-site-shell site-layout-mobile has-quiet-header${isHome ? ' is-world-home' : ''}`} data-site-world={world}>
      <header className="site-header world-site-header mobile-world-header">
        <div className="mobile-world-bar">
          <Link to="/" className="site-wordmark">{WORLD_LABELS[world]}</Link>
          <div className="mobile-world-utilities">
            <Link to="/enter" className="site-world-switch" aria-label="切换视觉世界">⇄</Link>
          </div>
        </div>
      </header>
      <main className="site-main world-site-main"><Outlet /></main>
    </div>
  )
}
