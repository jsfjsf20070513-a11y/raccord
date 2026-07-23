import { Link, Outlet } from 'react-router-dom'
import { isNavActive, WORLD_FOOTERS, WORLD_LABELS, WORLD_NAV } from '../shared/worldNavigation'

export default function DesktopWorldLayout({ world, pathname, user, displayName, isAuthEnabled, onSignOut, scope }) {
  const isHome = pathname === '/'
  const navigation = WORLD_NAV[world]
  const footer = scope === 'tool'
    ? { label: 'Outil indépendant', to: '/', link: 'Retour au monde' }
    : WORLD_FOOTERS[world]
  return (
    <div className={`site-shell world-site-shell site-layout-desktop${isHome ? ' is-world-home' : ''}${navigation.length ? '' : ' has-quiet-header'}`} data-site-world={world} data-site-scope={scope}>
      <header className="site-header world-site-header">
        <div className="site-header-inner world-site-header-inner">
          <div className="site-brand-lockup">
            <Link to="/" className="site-wordmark">Raccord</Link>
            <span className="site-world-label">{scope === 'tool' ? 'Outils · hors monde' : WORLD_LABELS[world]}</span>
          </div>
          {navigation.length ? <nav className="site-nav world-site-nav" aria-label="Navigation du monde">
            {navigation.map((item) => {
              const active = isNavActive(item, pathname)
              return <Link key={item.to} to={item.to} className={active ? 'is-active' : ''} aria-current={active ? 'page' : undefined}>{item.label}</Link>
            })}
          </nav> : <span className="world-site-breathing-room" aria-hidden="true" />}
          <div className="site-header-actions world-site-actions">
            {scope !== 'tool' && !isHome ? <Link to="/vocabulary" className="site-tool-link">Réviser</Link> : null}
            <Link to="/enter" state={{ from: pathname }} className="site-world-switch" aria-label="切换视觉世界">⇄ <span>changer</span></Link>
            {!isHome ? <div className="site-auth">
              {user ? <><span className="site-auth-note">{displayName}</span><button type="button" className="site-auth-link" onClick={onSignOut}>退出</button></> : isAuthEnabled ? <Link to="/login" className="site-auth-link">Connexion</Link> : null}
            </div> : null}
          </div>
        </div>
      </header>
      <main className="site-main world-site-main"><Outlet /></main>
      {!isHome ? <footer className="site-footer world-site-footer"><span>{footer.label}</span><Link to={footer.to}>{footer.link} →</Link></footer> : null}
    </div>
  )
}
