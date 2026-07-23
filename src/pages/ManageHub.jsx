import { Link } from 'react-router-dom'

// Legacy collaboration route: keep the one action with a real review pipeline.
const doorways = [
  {
    numeral: 'I',
    fr: 'Curation de ressources',
    zh: '资源增补',
    desc: '推荐一条书目或课程链接,审阅后并入「资源」页的公开书架。',
    to: '/resources/curate',
  },
]

export default function ManageHub() {
  return (
    <article className="page-column atelier-page">
      <header className="atelier-masthead">
        <p className="atelier-kicker">Participer · 共建</p>
        <h1 className="atelier-title">Outils publics</h1>
        <p className="atelier-subtitle-zh">服务于网站，但不定义任何世界。</p>
      </header>

      <section className="atelier-doorways">
        {doorways.map((d) => (
          <Link key={d.numeral} to={d.to} className="atelier-doorway">
            <span className="atelier-doorway-num" aria-hidden="true">{d.numeral}</span>
            <span className="atelier-doorway-body">
              <span className="atelier-doorway-title">
                {d.fr}<span className="atelier-doorway-sub"> · {d.zh}</span>
              </span>
              <span className="atelier-doorway-desc">{d.desc}</span>
            </span>
            <span className="atelier-doorway-arrow" aria-hidden="true">→</span>
          </Link>
        ))}
      </section>

    </article>
  )
}
