import { Link } from 'react-router-dom'
import { WORLD_LABELS } from '../shared/world/worlds'

export default function MobileHeader({ world }) {
  return (
    <header className="site-header world-site-header mobile-world-header">
      <div className="mobile-world-bar">
        <Link to="/" className="site-wordmark">{WORLD_LABELS[world]}</Link>
        <div className="mobile-world-utilities">
          <Link to="/enter" className="site-world-switch" aria-label="切换视觉世界">⇄</Link>
        </div>
      </div>
    </header>
  )
}
