import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const navItems = [
  { to: '/', label: '扉页' },
  { to: '/resources', label: '资源' },
  { to: '/manage', label: '协作' },
]

export default function Layout() {
  const location = useLocation()
  const { user, signOut, isAuthEnabled } = useAuth()
  const displayName = user?.user_metadata?.nickname || user?.user_metadata?.real_name || user?.email || ''

  const resolvePrimaryNav = (pathname) => {
    if (pathname === '/' || pathname === '/404') {
      return navItems[0]
    }

    if (pathname === '/gallery' || pathname.startsWith('/album/')) {
      return null
    }

    if (pathname.startsWith('/resources')) {
      return navItems[1]
    }

    if (pathname.startsWith('/hackathon')) {
      return { to: '/hackathon', label: '展示' }
    }

    return navItems[2]
  }

  const primaryNav = resolvePrimaryNav(location.pathname)
  const secondaryNav = primaryNav
    ? navItems.filter((item) => item.to !== primaryNav.to)
    : navItems

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <div className="site-branding">
            <Link to="/" className="site-title">
              2025 级数学班
            </Link>
            <p className="site-branding-kicker">Carnet de classe</p>
          </div>

          <nav className="site-header-focus" aria-label="当前位置">
            {primaryNav ? (
              <Link to={primaryNav.to} className="is-active" aria-current="page">
                {primaryNav.label}
              </Link>
            ) : null}
          </nav>

          <div className="site-header-tools">
            <nav className="site-nav-secondary" aria-label="其余导航">
              {secondaryNav.map((item) => (
                <Link key={item.to} to={item.to}>
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="site-auth">
              {user ? (
                <>
                  <span className="site-auth-note">在席：{displayName}</span>
                  <button type="button" className="text-button" onClick={() => signOut()}>
                    退出
                  </button>
                </>
              ) : isAuthEnabled ? (
                <Link to="/login">登录</Link>
              ) : (
                <span className="site-auth-note">登录未启用</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <p className="site-footer-rule" aria-hidden="true">
          ─────
        </p>
        <p>
          EB Garamond · 思源宋体 · JetBrains Mono · KaTeX.
        </p>
        <p className="site-footer-attribution">
          Voice by ElevenLabs · Bilingual reasoning by Anthropic Claude · Anchored on Solana devnet.
        </p>
        <p className="site-footer-secondary">
          Pour la classe.
        </p>
      </footer>
    </div>
  )
}
