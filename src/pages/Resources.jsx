import { Fragment, useMemo } from 'react'
import { Link } from 'react-router-dom'
import DailyMeditation from '../components/DailyMeditation'
import PageHeader from '../components/PageHeader'
import { resourceArticles, resourceCategories } from '../data/resourceCatalog'
import { useResourceCatalog } from '../hooks/useResourceCatalog'
import { getResourceLead } from '../lib/resourceText'

function buildShelfOrder(catalogItems) {
  const preferred = resourceCategories.map((category) => category.label)
  const extras = Array.from(
    new Set(
      catalogItems
        .map((item) => item.category)
        .filter((category) => category && !preferred.includes(category)),
    ),
  ).sort((a, b) => a.localeCompare(b, 'zh-CN'))

  return [...preferred, ...extras]
}

export default function Resources() {
  const { catalogItems } = useResourceCatalog()

  const shelves = useMemo(() => {
    const introByCategory = new Map(
      resourceCategories.map((category) => [category.label, category.intro]),
    )

    return buildShelfOrder(catalogItems)
      .map((category) => ({
        title: category,
        intro: introByCategory.get(category) || '',
        items: catalogItems.filter((item) => item.category === category),
      }))
      .filter((shelf) => shelf.items.length)
  }, [catalogItems])

  const shelfAnchors = useMemo(
    () => Object.fromEntries(shelves.map((shelf, index) => [shelf.title, `shelf-${index + 1}`])),
    [shelves],
  )

  return (
    <article className="page-column">
      <PageHeader
        kicker="Bibliotheque"
        title="Resources &amp; bibliography · 资源与书目"
        note="Classer n'est pas clore; c'est laisser les chemins demeurer lisibles. 编目不是封存，而是让路径仍可辨认。"
        backTo="/"
        backLabel="Back to title page · 返回扉页"
      />

      {shelves.length ? (
        <section className="page-section resource-directory-section">
          <h2 className="section-title">Shelf index · 书架索引</h2>
          <ol className="resource-directory-list">
            {shelves.map((shelf) => (
              <li key={`directory-${shelf.title}`} className="resource-directory-entry">
                <a href={`#${shelfAnchors[shelf.title]}`}>{shelf.title}</a>
                <span>{shelf.items.length} {shelf.items.length === 1 ? 'entry' : 'entries'} · {shelf.items.length} 条</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {shelves.map((shelf, index) => (
        <Fragment key={shelf.title}>
          <section className="page-section" id={shelfAnchors[shelf.title]}>
            <h2 className="section-title">{shelf.title}</h2>
            {shelf.intro ? <p className="resource-shelf-intro">{shelf.intro}</p> : null}
            <ol className="record-list">
              {shelf.items.map((item) => (
                <li key={item.id} className="record-entry">
                  <h3>
                    <a href={item.url} target="_blank" rel="noreferrer">{item.title}</a>
                  </h3>
                  {item.tag ? <p className="record-meta">{item.tag}</p> : null}
                  {getResourceLead(item) ? <p className="resource-entry-note">{getResourceLead(item)}</p> : null}
                  <p className="resource-entry-links">
                    <a href={item.url} target="_blank" rel="noreferrer">Open original · 直达原网站</a>
                    <span> · </span>
                    <Link to={`/resources/${encodeURIComponent(item.id)}`}>In-site note · 查看站内条目</Link>
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {index < shelves.length - 1 ? (
            <div className="resource-breath">
              <DailyMeditation offset={8 + index} className="is-breath" />
            </div>
          ) : null}
        </Fragment>
      ))}

      <section className="page-section">
        <h2 className="section-title">Appendix · 附录</h2>
        <ol className="record-list compact appendix-list">
          {resourceArticles.map((article) => (
            <li key={article.title} className="record-entry">
              <h3>
                <a href={article.url} target="_blank" rel="noreferrer">{article.title}</a>
              </h3>
              <p className="record-meta">
                {[article.author, article.date, article.tag].filter(Boolean).join(' · ')}
              </p>
            </li>
          ))}
        </ol>
        <DailyMeditation offset={16} className="is-breath" />
      </section>
    </article>
  )
}
