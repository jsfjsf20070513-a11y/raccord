import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <article className="page-column notfound-page">
      <p className="notfound-code">404</p>
      <h1 className="notfound-title">Page introuvable · 页面未找到</h1>

      <div className="notfound-number-line" aria-hidden="true">
        <span className="notfound-axis" />
        <span className="notfound-ticks" />
        <span className="notfound-point" />
        <span className="notfound-empty">∄ x</span>
      </div>

      <p className="notfound-quote" lang="fr">Comme chercher sur la droite réelle un point qui n&apos;existe pas.</p>
      <p className="notfound-quote-zh">这就像在实数轴上寻找一个并不存在的点。</p>

      <nav className="notfound-exits" aria-label="出口">
        <Link to="/resources">书目</Link>
        <Link to="/vocabulary">背词</Link>
        <Link to="/">← 回到扉页</Link>
      </nav>
    </article>
  )
}
