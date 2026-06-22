import { Link } from 'react-router-dom'
import DailyMeditation from '../components/DailyMeditation'

// 协作 Atelier — design contract: 报头 → 两个编号细线入口(I 班级寄语墙 / II 资源增补)
// → 班级 AI 助手「即将 · 登录可用」预告 → 细页脚。旧的草稿/审核/案头/图版补录工作台已收敛掉。
const doorways = [
  {
    numeral: 'I',
    fr: 'Mur de la classe',
    zh: '班级寄语墙',
    desc: '给这个班留下一句话 —— 永久保存、公开可见、谁都改不了。',
    to: '/witness',
  },
  {
    numeral: 'II',
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
        <h1 className="atelier-title">在这本册子里留下点什么</h1>
        <p className="atelier-subtitle" lang="fr">Tenir le carnet à plusieurs mains, sans en troubler la page.</p>
        <p className="atelier-subtitle-zh">众手同修一册,而不扰其页。</p>
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

      <section className="atelier-teaser">
        <p className="atelier-teaser-kicker">Disponible · 现已上线</p>
        <div className="atelier-teaser-head">
          <h2 className="atelier-teaser-title">班级 AI 助手</h2>
          <span className="atelier-teaser-flag">登录可用</span>
        </div>
        <p className="atelier-teaser-desc">
          一个中法双语数学答疑助手,可就任意定理或法语词条提问 —— 登录后即可使用。{' '}
          <Link to="/assistant">进入助手 →</Link>
        </p>
      </section>

      <section className="home-meditation"><DailyMeditation /></section>
    </article>
  )
}
