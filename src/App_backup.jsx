import { useState } from 'react'
import { Calendar, Image as ImageIcon, FileText, ChevronRight, GraduationCap } from 'lucide-react'
import classNames from 'classnames'
import './App.css'

function App() {
  const [albums] = useState([
    {
      id: 1,
      title: '苏州的秋天',
      count: 3,
      cover: 'https://images.unsplash.com/photo-1508182314998-a27960c03979?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: '这个瞬间见证了我们的故事。'
    },
    {
      id: 2,
      title: '劳动实践',
      count: 57,
      cover: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: '校区组织劳动实践活动，一起劳动。'
    },
    {
      id: 3,
      title: '军训',
      count: 7,
      cover: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: '军训期间的点点滴滴。'
    },
    {
      id: 4,
      title: '上海·班级团日活动',
      count: 5,
      cover: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: '参观中共一大与四行仓库纪念馆。'
    },
    {
      id: 5,
      title: '苏州革命博物馆',
      count: 30,
      cover: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      description: '第一次团学活动。'
    }
  ])

  const [timelineEvents] = useState([
    { date: '2026-01-07', title: '期末周结束', category: '学期', description: '在人大的第一个学期，第一个期末周就这样结束啦' },
    { date: '2025-11-29', title: '劳动实践活动', category: '活动', description: '校区组织劳动实践活动，一起劳动' },
    { date: '2025-09-20', title: '苏州革命博物馆', category: '团学', description: '第一次团学活动' },
    { date: '2025-09-07', title: '返苏', category: '活动', description: '在军训完之后返回苏州' },
    { date: '2025-08-21', title: '新生报道', category: '活动', description: '相约北京，在人大开启大学之旅' }
  ])

  const [announcements] = useState([
    {
      id: 1,
      title: '网站试运行',
      date: '2026-01-22',
      author: '金铄莑',
      content: '欢迎同学探索网站，并且提建议！',
      tags: ['通知', '活动']
    }
  ])

  return (
    <div className="app-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <GraduationCap className="nav-icon" />
            <span>2025级数学班</span>
          </div>
          <div className="nav-links">
            <a href="#gallery">班级风采</a>
            <a href="#timeline">时间轴</a>
            <a href="#announcements">通知公告</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <div className="hero-content">
          <h1>立学苏州，数通天下</h1>
          <h2>CLASSE DE MATHÉMATIQUES D'IFC</h2>
          <p className="hero-desc">在这里，我们记录思想碰撞，定格青春光影，串联成长足迹</p>
        </div>
      </header>

      <main>
        {/* Gallery Section */}
        <section id="gallery" className="section-container">
          <div className="section-header">
            <h2>光影印记 · Galerie</h2>
            <a href="#" className="view-all">查看全部 <ChevronRight size={16} /></a>
          </div>
          <div className="gallery-grid">
            {albums.map(album => (
              <div key={album.id} className="album-card">
                <div className="album-cover">
                  <img src={album.cover} alt={album.title} />
                  <div className="photo-count">
                    <ImageIcon size={14} /> {album.count} 张
                  </div>
                </div>
                <div className="album-info">
                  <h3>{album.title}</h3>
                  <p>{album.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline Section */}
        <section id="timeline" className="section-container bg-light">
          <div className="section-header">
            <h2>岁月如歌 · Timeline</h2>
            <a href="#" className="view-all">查看全部 <ChevronRight size={16} /></a>
          </div>
          <div className="timeline">
            {timelineEvents.map((event, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-date">
                  <div className="year">{event.date.split('-')[0]}</div>
                  <div className="month-day">{event.date.split('-').slice(1).join('-')}</div>
                </div>
                <div className="timeline-content">
                  <div className={classNames("timeline-tag", {
                    "tag-blue": event.category === '学期',
                    "tag-green": event.category === '活动',
                    "tag-red": event.category === '团学',
                  })}>{event.category}</div>
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Announcements Section */}
        <section id="announcements" className="section-container">
          <div className="section-header">
            <h2>最新通知 · Annonces</h2>
            <a href="#" className="view-all">查看全部 <ChevronRight size={16} /></a>
          </div>
          <div className="announcements-list">
            {announcements.map(notice => (
              <div key={notice.id} className="notice-card">
                <div className="notice-header">
                  <h3>{notice.title}</h3>
                  <span className="notice-date"><Calendar size={14} /> {notice.date}</span>
                </div>
                <div className="notice-meta">
                  <span className="author">发布人：{notice.author}</span>
                </div>
                <p className="notice-content">{notice.content}</p>
                <div className="notice-tags">
                  {notice.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-links">
            <a href="#">班级信息</a>
            <a href="#">班级相册</a>
            <a href="#">通知公告</a>
          </div>
          <p>&copy; 2026 中国人民大学（苏州校区）2025级数学班</p>
          <p className="icp">京ICP备2026003579号</p>
        </div>
      </footer>
    </div>
  )
}

export default App
