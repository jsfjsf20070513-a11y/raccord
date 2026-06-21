import { useMemo } from 'react'
import DailyMeditation from '../components/DailyMeditation'
import { externalLinkProps } from '../lib/safeUrl'
import { resourceCategories } from '../data/resourceCatalog'
import { useResourceCatalog } from '../hooks/useResourceCatalog'
import { getResourceLead } from '../lib/resourceText'

// 资源 Resources — design contract: BIBLIOTHÈQUE 报头 → 书架索引(I–VIII)→
// 八个编号书架(罗马数字 + 思源宋体架名 + 细线条目:标题外链 / 暗红 mono 标签 / 中文简介)。
// 数据单一来源 resourceCatalog(经 useResourceCatalog 并入审核通过的增补);Appendix 已删。
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
const toRoman = (n) => ROMAN[n] || `${n + 1}`

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
    <article className="page-column resources-page">
      <header className="biblio-masthead">
        <p className="biblio-kicker">Bibliothèque</p>
        <h1 className="biblio-title">资源与书目</h1>
        <p className="biblio-quote" lang="fr">Classer n&apos;est pas clore ; c&apos;est laisser les chemins demeurer lisibles.</p>
        <p className="biblio-quote-zh">编目不是封存,而是让路径仍可辨认。</p>
      </header>

      {shelves.length ? (
        <nav className="biblio-index" aria-label="书架索引">
          {shelves.map((shelf, index) => (
            <a key={`idx-${shelf.title}`} href={`#${shelfAnchors[shelf.title]}`} className="biblio-index-row">
              <span className="biblio-roman" aria-hidden="true">{toRoman(index)}</span>
              <span className="biblio-index-label">{shelf.title}</span>
              <span className="biblio-index-count">{shelf.items.length} 条</span>
            </a>
          ))}
        </nav>
      ) : null}

      {shelves.map((shelf, index) => (
        <section key={shelf.title} id={shelfAnchors[shelf.title]} className="biblio-shelf">
          <div className="biblio-shelf-head">
            <span className="biblio-roman" aria-hidden="true">{toRoman(index)}</span>
            <h2 className="biblio-shelf-title">{shelf.title}</h2>
          </div>
          <ol className="biblio-entries">
            {shelf.items.map((item) => {
              const lead = getResourceLead(item)
              return (
                <li key={item.id} className="biblio-entry">
                  <div className="biblio-entry-row">
                    <a {...externalLinkProps(item.url)} className="biblio-entry-title">{item.title}</a>
                    {item.tag ? <span className="biblio-entry-tag">{item.tag}</span> : null}
                  </div>
                  {lead ? <p className="biblio-entry-desc">{lead}</p> : null}
                </li>
              )
            })}
          </ol>
        </section>
      ))}

      <section className="home-meditation biblio-coda">
        <DailyMeditation offset={8} />
      </section>
    </article>
  )
}
