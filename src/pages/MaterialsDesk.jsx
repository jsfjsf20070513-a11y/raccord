import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import {
  materialsLedger,
  materialsUploadChecklist,
  uploadPathNote,
} from '../data/materialsDesk'
import { usePublishedContent } from '../hooks/usePublishedContent'

export default function MaterialsDesk() {
  const { albums, resources } = usePublishedContent()
  const highestPriorityCount = materialsLedger.filter((item) => item.priority === '最高').length
  const firstItems = materialsLedger.filter((item) => item.priority === '最高')
  const laterItems = materialsLedger.filter((item) => item.priority !== '最高')

  return (
    <article className="page-column">
      <PageHeader
        kicker="Materials Desk"
        title="Materials intake · 素材入册"
        summary="Title page, plates, and resources only. · 只看扉页、图版和资源。"
        backTo="/manage"
        backLabel="Back to collaboration · 返回协作入口"
        meta={[`${highestPriorityCount} priority item${highestPriorityCount === 1 ? '' : 's'} · ${highestPriorityCount} 项先交`]}
      />

      <section className="page-section manage-focus">
        <div className="editorial-centerpiece">
          <p className="editorial-centerpiece-kicker">收件台</p>
          <h2 className="editorial-centerpiece-title">先交课表或图片</h2>
          <p className="editorial-centerpiece-summary">其余随后补入。</p>
        </div>
      </section>

      <section className="page-section">
        <h2 className="section-title">先交</h2>
        <ol className="record-list compact">
          {firstItems.map((item) => (
            <li key={item.id} className="record-entry">
              <div className="record-entry-head">
                <div>
                  <h3>{item.section}</h3>
                  <p className="record-meta">{item.accepted}</p>
                </div>
              </div>
              <p>{item.needed}</p>
            </li>
          ))}
        </ol>
        <p className="editorial-note">{uploadPathNote}</p>
      </section>

      <section className="page-section">
        <h2 className="section-title">最低限</h2>
        <ul className="stats-ledger">
          {materialsUploadChecklist.map((item) => (
            <li key={item.label}>
              <span>{item.label}</span>
              <strong>{item.detail}</strong>
            </li>
          ))}
        </ul>
      </section>

      <section className="page-section">
        <h2 className="section-title">随后</h2>
        <ol className="record-list compact">
          {laterItems.map((item) => (
            <li key={item.id} className="record-entry">
              <div className="record-entry-head">
                <div>
                  <h3>{item.section}</h3>
                  <p className="record-meta">{item.accepted}</p>
                </div>
              </div>
              <p>{item.needed}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="page-section">
        <h2 className="section-title">入册后</h2>
        <ol className="record-list compact">
          <li className="record-entry">
            <h3><Link to="/">首页扉页</Link></h3>
            <p className="record-meta">课表与图版先落在这里。</p>
          </li>
          <li className="record-entry">
            <h3><Link to="/gallery">图版目录</Link></h3>
            <p className="record-meta">{albums.length} 册已入。</p>
          </li>
          <li className="record-entry">
            <h3><Link to="/resources">资源</Link></h3>
            <p className="record-meta">{resources.length} 条在列。</p>
          </li>
        </ol>
      </section>
    </article>
  )
}
