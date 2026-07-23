import { Link, Outlet } from 'react-router-dom'
import { isNavActive, WORLD_FOOTERS, WORLD_LABELS, WORLD_NAV } from '../shared/worldNavigation'

export default function MobileWorldLayout({ world, pathname, user, isAuthEnabled, onSignOut, scope }) {
  const isHome = pathname === '/'
  const navigation = WORLD_NAV[world]
  const footer = scope === 'tool'
    ? { label: 'Outil indépendant', to: '/', link: 'Retour au monde' }
    : WORLD_FOOTERS[world]
  return (
    <div className={`site-shell world-site-shell site-layout-mobile${isHome ? ' is-world-home' : ''}${navigation.length ? '' : ' has-quiet-header'}`} data-site-world={world} data-site-scope={scope}>
      <header className="site-header world-site-header mobile-world-header">
        <div className="mobile-world-bar">
          <Link to="/" className="site-wordmark">{scope === 'tool' ? 'Outils · Raccord' : WORLD_LABELS[world]}</Link>
          <div className="mobile-world-utilities">
            {scope !== 'tool' && !isHome ? <Link to="/vocabulary" className="site-tool-link" aria-label="打开背词工具">SRS</Link> : null}
            {!isHome ? (user ? <button type="button" className="site-auth-link" onClick={onSignOut}>退出</button> : isAuthEnabled ? <Link to="/login" className="site-auth-link">Login</Link> : null) : null}
            <Link to="/enter" state={{ from: pathname }} className="site-world-switch" aria-label="切换视觉世界">⇄</Link>
          </div>
        </div>
        {navigation.length ? <nav className="mobile-world-nav" aria-label="Navigation du monde" style={{ '--world-nav-count': navigation.length }}>
          {navigation.map((item) => {
            const active = isNavActive(item, pathname)
            return <Link key={item.to} to={item.to} className={active ? 'is-active' : ''} aria-current={active ? 'page' : undefined}>{item.label}</Link>
          })}
        </nav> : null}
      </header>
      <main className="site-main world-site-main"><Outlet /></main>
      {!isHome ? <footer className="site-footer world-site-footer"><span>{footer.label}</span><Link to={footer.to}>{footer.link} →</Link></footer> : null}
    </div>
  )
}
