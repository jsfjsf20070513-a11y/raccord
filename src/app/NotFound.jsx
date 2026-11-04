import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <article className="notfound-page">
      <p className="notfound-code">404</p>
      <h1 className="notfound-title"><span lang="fr">Page introuvable · </span><span>页面未找到</span></h1>
      <p className="notfound-quote-zh">这里没有这一页。</p>
      <nav className="notfound-exits" aria-label="出口"><Link to="/enter">回到入口 →</Link></nav>
    </article>
  )
}
