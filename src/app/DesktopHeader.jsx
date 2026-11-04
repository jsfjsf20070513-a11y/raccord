import { Link } from 'react-router-dom'
import { WORLD_LABELS } from '../shared/world/worlds'

export default function DesktopHeader({ world }) {
  return (
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
  )
}
