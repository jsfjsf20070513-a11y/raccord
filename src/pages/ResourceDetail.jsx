import { useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { resourceCourseLinks } from '../data/resourceCatalog'
import { useResourceCatalog } from '../hooks/useResourceCatalog'
import {
  getResourceHeaderSummary,
  getResourceMaterials,
} from '../lib/resourceText'
import { externalLinkProps } from '../lib/safeUrl'

export default function ResourceDetail() {
  const params = useParams()
  const resourceId = decodeURIComponent(params.id || '')
  const { catalogItems, loading } = useResourceCatalog()
  const resource = catalogItems.find((item) => String(item.id) === resourceId)

  if (!resource && loading) {
    return (
      <article className="page-column">
        <PageHeader
          kicker="Notice bibliographique"
          title="Loading entry · 调入条目"
          summary="Loading… · 正在调入。"
          backTo="/resources"
          backLabel="Back to resources · 返回资源"
          showRule={false}
        />
      </article>
    )
  }

  if (!resource) {
    return (
      <article className="page-column">
        <PageHeader
          kicker="Notice bibliographique"
          title="Entry not found · 条目不存在"
          summary="This entry could not be loaded. · 这条目录未能调出。"
          backTo="/resources"
          backLabel="Back to resources · 返回资源"
          showRule={false}
        />
      </article>
    )
  }

  const linkedCourses = resourceCourseLinks.filter((course) => course.entryIds.includes(resource.id))
  const materials = getResourceMaterials(resource)

  return (
    <article className="page-column">
      <PageHeader
        kicker="Notice"
        title={resource.title}
        summary={getResourceHeaderSummary(resource)}
        backTo="/resources"
        backLabel="Back to resources · 返回资源"
        showRule={false}
      />

      <section className="page-section resource-slip">
        <dl className="resource-slip-list">
          <div>
            <dt>Section · 分栏</dt>
            <dd>{resource.category}</dd>
          </div>
          {linkedCourses.length ? (
            <div>
              <dt>Course · 课程</dt>
              <dd>{linkedCourses.map((course) => course.course).join(' · ')}</dd>
            </div>
          ) : null}
          {resource.tag ? (
            <div>
              <dt>Tag · 标签</dt>
              <dd>{resource.tag}</dd>
            </div>
          ) : null}
          {materials.length ? (
            <div>
              <dt>Materials · 材料</dt>
              <dd>{materials.join(' · ')}</dd>
            </div>
          ) : null}
        </dl>
        {resource.url ? (
          <p className="resource-slip-link">
            <a {...externalLinkProps(resource.url)}>
              Open original page · 打开原始页面
            </a>
          </p>
        ) : null}
      </section>
    </article>
  )
}
