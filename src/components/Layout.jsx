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

          <nav className="site-header-focus" aria-label="Current location · 当前位置">
            {primaryNav ? (
              <Link to={primaryNav.to} className="is-active" aria-current="page">
                {primaryNav.label}
              </Link>
            ) : null}
          </nav>

          <div className="site-header-tools">
            <nav className="site-nav-secondary" aria-label="Secondary navigation · 其余导航">
              {secondaryNav.map((item) => (
                <Link key={item.to} to={item.to}>
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="site-auth">
              {user ? (
                <>
                  <span className="site-auth-note">Signed in · 在席：{displayName}</span>
                  <button type="button" className="text-button" onClick={() => signOut()}>
                    Sign out · 退出
                  </button>
                </>
              ) : isAuthEnabled ? (
                <Link to="/login">Sign in · 登录</Link>
              ) : (
                <span className="site-auth-note">Sign-in disabled · 登录未启用</span>
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
