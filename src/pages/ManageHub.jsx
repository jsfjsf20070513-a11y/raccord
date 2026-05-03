import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/useAuth'
import { usePublishedContent } from '../hooks/usePublishedContent'
import { useUserRole } from '../hooks/useUserRole'
import { buildSubmissionTitle, getSubmissionStateLabel } from '../lib/submissionWorkspace'
import { useOpsSubmissions } from '../hooks/useOpsSubmissions'

const focusModules = [
  { key: 'gallery', kind: 'gallery', title: '图版补录', description: '补图片、日期和地点。', to: '/gallery/contribute' },
  { key: 'resources', kind: 'resource', title: '资源增补', description: '补书目与课程链接。', to: '/resources/curate' },
]
const reviewableKinds = new Set(focusModules.map((item) => item.kind))

function formatShortDate(value) {
  if (!value) return '待补日期'
  return `${value}`.replace('T', ' ').slice(0, 16)
}

function AdminReviewShortcut() {
  const { mode: backendMode } = usePublishedContent()
  const { submissions } = useOpsSubmissions({ scope: 'all', publishedContentMode: backendMode })
  const pendingCount = useMemo(
    () =>
      submissions.filter(
        (submission) => reviewableKinds.has(submission.kind) && submission.state !== 'published',
      ).length,
    [submissions],
  )

  return (
    <p className="manage-review-rail">
      <Link to="/manage/review">审核发布</Link>
      <span>
        {backendMode !== 'official'
          ? '正式相册表还没建好；现在去审核页会看到建表提示。'
          : pendingCount
          ? `现在还有 ${pendingCount} 条待处理；在这里点“发布”，图版会进入相册，资源会进入公开书架。`
          : '这里处理协作稿的发布与撤下。'}
      </span>
    </p>
  )
}

export default function ManageHub() {
  const { user } = useAuth()
  const { isAdmin, loading: roleLoading } = useUserRole()
  const { mode: backendMode, albums: officialAlbums, resources: officialResources } = usePublishedContent()
  const publishedSubmissionIds = useMemo(
    () =>
      new Set(
        [...officialAlbums, ...officialResources]
          .map((item) => item.sourceSubmissionId)
          .filter(Boolean),
      ),
    [officialAlbums, officialResources],
  )
  const { submissions } = useOpsSubmissions({
    scope: 'mine',
    userId: user?.id || '',
    publishedSubmissionIds,
    publishedContentMode: backendMode,
  })

  const displayName = user?.user_metadata?.nickname || user?.user_metadata?.real_name || user?.email || '未登录'
  const moduleByKind = Object.fromEntries(focusModules.map((item) => [item.kind, item]))

  const myEntries = useMemo(() => {
    if (!user) return []

    return submissions
      .filter((submission) => moduleByKind[submission.kind])
      .map((submission) => {
        const matchedModule = moduleByKind[submission.kind]
        return {
          id: submission.id,
          title: buildSubmissionTitle(submission, matchedModule?.title || submission.kind),
          meta: `${matchedModule?.title || submission.kind} · ${formatShortDate(submission.createdAt)} · ${getSubmissionStateLabel(submission.state)}`,
          to: matchedModule?.to || '/manage',
          createdAt: submission.createdAt || '',
        }
      })
      .sort((a, b) => `${b.createdAt}`.localeCompare(`${a.createdAt}`))
      .slice(0, 3)
  }, [moduleByKind, submissions, user])

  return (
    <article className="page-column manage-hub-page">
      <PageHeader
        kicker="Table de travail"
        title="协作"
        summary="图版补录与资源增补。"
        backTo="/"
        backLabel="返回扉页"
        meta={[displayName]}
        showRule={false}
      />

      <section className="page-section manage-focus">
        <div className="manage-focus-stage">
          <div className="manage-focus-grid">
            {focusModules.map((item) => (
              <Link key={item.key} className="manage-focus-link" to={item.to}>
                {item.title}
              </Link>
            ))}
          </div>
          {!roleLoading && isAdmin ? <AdminReviewShortcut /> : null}
        </div>
      </section>

      <section className="page-section manage-desk-section">
        <div className="manage-desk-shell">
          <p className="manage-desk-kicker">案头近记</p>
          <h2 className="manage-desk-heading">最近三条</h2>
          {user ? (
            <>
              {myEntries.length ? (
                <ol className="manage-desk-listing">
                  {myEntries.map((item) => (
                    <li key={item.id} className="manage-desk-item">
                      <h3><Link to={item.to}>{item.title}</Link></h3>
                      <p className="manage-desk-meta">{item.meta}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="manage-desk-note">案头暂空。</p>
              )}
            </>
          ) : (
            <p className="manage-desk-note">登录后可见自己的案头。</p>
          )}
        </div>
      </section>
    </article>
  )
}
