import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const navItems = [
  { to: '/', label: 'Accueil · 扉页' },
  { to: '/resources', label: 'Ressources · 资源' },
  { to: '/vocabulary', label: 'Vocabulaire · 背词' },
  { to: '/atelier', label: 'Atelier · 协作' },
]

export default function Layout() {
  const location = useLocation()
  const { user, signOut, isAuthEnabled } = useAuth()
  const displayName = user?.user_metadata?.nickname || user?.user_metadata?.real_name || user?.email || ''

  const resolvePrimaryNav = (pathname) => {
    if (pathname === '/' || pathname === '/404') {
      return navItems[0]
    }

    if (pathname.startsWith('/resources')) {
      return navItems[1]
    }

    if (pathname.startsWith('/vocabulary')) {
      return navItems[2]
    }

    // 班级寄语墙 / 链上见证迁到「协作」之下,导航不再单独暴露「黑客松/展示」。
    // hackathon/web3 旧页在删除前仍可达,但导航高亮统一落到 Atelier。
    if (
      pathname.startsWith('/atelier')
      || pathname.startsWith('/manage')
      || pathname.startsWith('/hackathon')
      || pathname.startsWith('/web3-profile')
      || pathname.startsWith('/witness')
    ) {
      return navItems[3]
    }

    return navItems[3]
  }

  const primaryNav = resolvePrimaryNav(location.pathname)

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <div className="site-head-top">
            <Link to="/" className="site-wordmark">Carnet de classe</Link>
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

          <nav className="site-nav" aria-label="全站导航 · Plan du site">
            {navItems.map((item) => {
              const active = item.to === primaryNav?.to
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
          <Link to="/witness">班级寄语墙 · 给这个班留一句话 →</Link>
        </p>
      </footer>
    </div>
  )
}
