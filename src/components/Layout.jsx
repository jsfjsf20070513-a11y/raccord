import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useWorld } from '../context/useWorld'

const WORLD_NAV = {
  carnet: [
    { to: '/', label: 'Aujourd’hui · 今日' },
    { to: '/recueil', label: 'Recueil · 定理集' },
    { to: '/testimonials', label: 'Témoignages · 寄语' },
    { to: '/resources', label: 'Bibliographie · 书目' },
    { to: '/vocabulary', label: 'Vocabulaire · 背词' },
    { to: '/atelier', label: 'Atelier · 协作' },
  ],
  plan: [
    { to: '/', label: '00 Aujourd’hui' },
    { to: '/resources', label: '01 Bibliographie' },
  ],
  limite: [
    { to: '/', label: '00 Signal du jour' },
    { to: '/vocabulary', label: '01 Vocabulaire' },
    { to: '/assistant', label: '02 Assistant' },
  ],
}

const WORLD_LABELS = {
  carnet: 'N°02 · Le Carnet',
  plan: 'N°01 · PLAN ℝ',
  limite: 'N°03 · Limite',
}

export default function Layout() {
  const location = useLocation()
  const { user, signOut, isAuthEnabled } = useAuth()
  const { world, setWorld } = useWorld()
  const displayName = user?.user_metadata?.nickname || user?.user_metadata?.real_name || user?.email || ''
  const navItems = WORLD_NAV[world]

  return (
    <div className="site-shell" data-site-world={world}>
      <header className="site-header">
        <div className="site-header-inner">
          <div className="site-head-top">
            <div className="site-brand-lockup">
              <Link to="/" className="site-wordmark">Carnet de classe</Link>
              <span className="site-world-label">{WORLD_LABELS[world]}</span>
            </div>
            <div className="site-header-actions">
              <Link
                to="/enter"
                state={{ from: location.pathname }}
                className="site-world-switch"
                aria-label="切换视觉世界"
              >
                ⇄ <span>changer</span>
              </Link>
              <div className="site-auth">
                {user ? (
                  <>
                    <span className="site-auth-note">已登录 · {displayName}</span>
                    <button type="button" className="site-auth-link" onClick={() => signOut()}>退出</button>
                  </>
                ) : isAuthEnabled ? (
                  <Link to="/login" className="site-auth-link">Sign in · 登录</Link>
                ) : (
                  <span className="site-auth-note">登录未启用</span>
                )}
              </div>
            </div>
          </div>

          <nav className="site-nav" aria-label="全站导航 · Plan du site">
            {navItems.map((item) => {
              const active = item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={active ? 'is-active' : ''}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              )
            })}
            {world !== 'carnet' ? (
              <Link
                to="/"
                className="site-complete-edition"
                onClick={() => setWorld('carnet')}
              >
                Éd. complète → Le Carnet
              </Link>
            ) : null}
          </nav>
        </div>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <p className="site-footer-rule" aria-hidden="true">─────</p>
        <p className="site-footer-secondary">Pour la classe.</p>
        <p className="site-footer-link">
          <Link to="/testimonials">Registre des témoignages · 给这个班留一句话 →</Link>
        </p>
      </footer>
    </div>
  )
}
