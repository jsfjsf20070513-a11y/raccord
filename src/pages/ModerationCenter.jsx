import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/useAuth'
import { useOpsSubmissions } from '../hooks/useOpsSubmissions'
import { usePublishedContent } from '../hooks/usePublishedContent'
import { useUserRole } from '../hooks/useUserRole'
import { deleteOpsSubmission, publishOpsSubmission, unpublishOpsSubmission } from '../lib/opsQueue'
import { buildPublishedDestinationMap, getListRoute, getSubmissionDestination } from '../lib/publicRoutes'
import {
  getModerationActionLabel,
  getModerationActionSummary,
  getSubmissionStateLabel,
} from '../lib/submissionWorkspace'

const sections = [
  { kind: 'gallery', title: '相册', buildTitle: (submission) => submission.payload?.title || '未命名相册', buildBody: (submission) => submission.payload?.description || '暂无简介' },
  { kind: 'resource', title: '资源', buildTitle: (submission) => submission.payload?.title || '未命名资源', buildBody: (submission) => submission.payload?.description || '暂无说明' },
]

function formatDateTime(value) {
  if (!value) return '待补充'
  return `${value}`.replace('T', ' ').slice(0, 16)
}

function getSortValue(item) {
  return `${item?.createdAt || item?.updatedAt || item?.date || ''}`
}

function getPublishButtonLabel(sectionTitle, state) {
  return state === 'unpublished' ? `重发到${sectionTitle}` : `发布到${sectionTitle}`
}

function getPublishSuccessText(sectionTitle, state) {
  return state === 'unpublished' ? `已重新发布到${sectionTitle}。` : `已发布到${sectionTitle}。`
}

function getUnpublishButtonLabel(sectionTitle) {
  return `从${sectionTitle}撤下`
}

function getUnpublishSuccessText(sectionTitle) {
  return `已从${sectionTitle}撤下。`
}

export default function ModerationCenter() {
  const { user } = useAuth()
  const { isAdmin, loading: roleLoading } = useUserRole()
  const {
    mode: backendMode,
    albums: officialAlbums,
    resources: officialResources,
  } = usePublishedContent()
  const [status, setStatus] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [query, setQuery] = useState('')
  const [stateFilter, setStateFilter] = useState('')

  const sectionByKind = useMemo(
    () => Object.fromEntries(sections.map((section) => [section.kind, section])),
    [],
  )
  const allowedKinds = useMemo(() => new Set(sections.map((section) => section.kind)), [])

  const publishedDestinationMap = useMemo(
    () =>
      buildPublishedDestinationMap({
        albums: officialAlbums,
        resources: officialResources,
      }),
    [officialAlbums, officialResources],
  )
  const publishedSubmissionIds = useMemo(
    () => new Set(
      [...officialAlbums, ...officialResources]
        .map((item) => item.sourceSubmissionId)
        .filter(Boolean),
    ),
    [officialAlbums, officialResources],
  )
  const { submissions: moderatedSubmissions, moderationEntries: moderatedHistory } = useOpsSubmissions({
    scope: 'all',
    publishedSubmissionIds,
    publishedContentMode: backendMode,
  })

  const filteredSubmissions = useMemo(
    () =>
      moderatedSubmissions.filter((submission) => {
        const section = sectionByKind[submission.kind]
        if (!section) {
          return false
        }
        const text = [
          section?.buildTitle(submission),
          section?.buildBody(submission),
          submission.authorName,
          submission.kind,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        const matchesQuery = !query.trim() || text.includes(query.trim().toLowerCase())
        const matchesState = !stateFilter || submission.state === stateFilter
        return matchesQuery && matchesState
      }),
    [moderatedSubmissions, query, sectionByKind, stateFilter],
  )

  const contentMap = useMemo(
    () => Object.fromEntries(moderatedSubmissions.map((submission) => [submission.id, submission])),
    [moderatedSubmissions],
  )

  const pendingSubmissions = useMemo(
    () =>
      moderatedSubmissions
        .filter((submission) => allowedKinds.has(submission.kind))
        .filter((submission) => submission.state !== 'published')
        .slice()
        .sort((a, b) => `${a.createdAt}`.localeCompare(`${b.createdAt}`))
        .slice(0, 6),
    [allowedKinds, moderatedSubmissions],
  )

  const visibleSections = useMemo(
    () =>
      sections
        .map((section) => ({
          ...section,
          items: filteredSubmissions.filter((submission) => submission.kind === section.kind),
        }))
        .filter((section) => section.items.length),
    [filteredSubmissions],
  )

  const moderationHistory = useMemo(
    () =>
      moderatedHistory
        .map((entry) => {
          const targetId = entry.payload?.targetId
          const target = contentMap[targetId]
          const section = target ? sectionByKind[target.kind] : null
          const state = entry.payload?.state || 'published'
          const targetKind = target?.kind || entry.payload?.targetKind || ''
          if (!allowedKinds.has(targetKind)) {
            return null
          }
          const destination = target
            ? getSubmissionDestination(target, publishedDestinationMap)
            : targetKind
              ? { href: getListRoute(targetKind), exact: false, published: false }
              : null
          const snapshotTitle = entry.payload?.title || (target ? section?.buildTitle(target) : '未命名条目')
          const snapshotExcerpt = entry.payload?.excerpt || (target ? section?.buildBody(target) : '')

          return {
            id: entry.id,
            title: snapshotTitle || '未命名条目',
            meta: `${getModerationActionLabel(state)} · ${target ? section?.title || target.kind : entry.payload?.targetKind || '未知栏目'} · ${entry.authorName} · ${formatDateTime(entry.createdAt)}`,
            href: destination?.href || null,
            excerpt: snapshotExcerpt || getModerationActionSummary(state),
            note: getModerationActionSummary(state),
            createdAt: entry.createdAt,
          }
        })
        .filter(Boolean)
        .sort((a, b) => getSortValue(b).localeCompare(getSortValue(a)))
        .slice(0, 8),
    [allowedKinds, contentMap, moderatedHistory, publishedDestinationMap, sectionByKind],
  )

  const withAction = async (id, action, successText) => {
    setBusyId(id)
    setStatus(null)
    try {
      await action()
      setStatus({ type: 'success', text: successText })
    } catch (error) {
      setStatus({ type: 'error', text: error.message || '操作失败，请稍后再试。' })
    } finally {
      setBusyId(null)
    }
  }

  const roleLabel = roleLoading ? '识别中' : isAdmin ? '可发布' : '只读'
  const accountLabel = user?.email || '当前账号'
  const currentFocus = pendingSubmissions.length ? '先定去留' : '案头已静'
  const currentFocusNote = pendingSubmissions.length
    ? '先处置待办。'
    : '只需回看近记。'

  return (
    <article className="page-column">
      <PageHeader
        kicker="Moderation Center"
        title="Moderation &amp; publishing · 审核发布"
        summary={'Click "Publish" here — plates enter the album, resources join the public bookshelf. · 在这里点"发布"，图版会进入相册，资源会进入公开书架。'}
        backTo="/manage"
        backLabel="Back to collaboration · 返回协作入口"
        meta={[roleLabel, backendMode === 'official' ? 'Official channel · 正式栏' : 'Compat channel · 兼容栏']}
      />

      {status ? <p className={`status-line ${status.type === 'error' ? 'is-error' : 'is-success'}`}>{status.text}</p> : null}

      <section className="page-section">
        <div className="submission-receipt">
          <p className="submission-receipt-kicker">审核流程</p>
          <h2 className="submission-receipt-title">点“发布”就会进入公开栏</h2>
          <p className="submission-receipt-note">
            {backendMode === 'official'
              ? '图版点“发布到相册”，资源点“发布到资源”。如果要回退，就点“从相册撤下”或“从资源撤下”。'
              : '你现在的 Supabase 还没有正式 albums / album_photos / resources 表，所以这里暂时不能真的送进公开栏。先执行仓库里的 `setup_official_content.sql`。'}
          </p>
        </div>
      </section>

      <section className="page-section manage-focus">
        <div className="editorial-centerpiece">
          <p className="editorial-centerpiece-kicker">编务台</p>
          <h2 className="editorial-centerpiece-title">{currentFocus}</h2>
          <p className="editorial-centerpiece-summary">{currentFocusNote}</p>
        </div>
      </section>

      <section className="page-section">
        <h2 className="section-title">筛选</h2>
        <div className="filter-grid">
          <label>
            <span>关键字</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="标题、作者或栏目" />
          </label>
          <label>
            <span>状态</span>
            <select value={stateFilter} onChange={(event) => setStateFilter(event.target.value)}>
              <option value="">全部状态</option>
              <option value="pending">待审核</option>
              <option value="published">已发布</option>
              <option value="publish_blocked">未入公开栏</option>
              <option value="unpublished">已撤下</option>
            </select>
          </label>
        </div>
      </section>

      <section className="page-section">
        <h2 className="section-title">待处理</h2>
        {pendingSubmissions.length ? (
          <ol className="record-list compact">
            {pendingSubmissions.map((submission) => {
              const section = sectionByKind[submission.kind]
              const destination = getSubmissionDestination(submission, publishedDestinationMap)
              return (
                <li key={`pending-${submission.id}`} className="record-entry">
                  <div className="record-entry-head">
                    <div>
                      <h3>{section?.buildTitle(submission) || '未命名条目'}</h3>
                      <p className="record-meta">
                        {section?.title || submission.kind} · {submission.authorName} · {formatDateTime(submission.createdAt)} · {getSubmissionStateLabel(submission.state)}
                      </p>
                    </div>
                  </div>
                  <p>{section?.buildBody(submission) || '暂无内容'}</p>
                  <div className="editorial-actions">
                    <Link to={destination.href}>
                      {destination.published && destination.exact ? '前往条目' : '前往栏目'}
                    </Link>
                    {isAdmin ? (
                      <>
                        {submission.published ? (
                          <button type="button" className="text-button" disabled={busyId === submission.id} onClick={() => withAction(submission.id, () => unpublishOpsSubmission(submission, user), getUnpublishSuccessText(section?.title || submission.kind))}>
                            {getUnpublishButtonLabel(section?.title || submission.kind)}
                          </button>
                        ) : (
                          <button type="button" className="text-button" disabled={busyId === submission.id || backendMode !== 'official'} onClick={() => withAction(submission.id, () => publishOpsSubmission(submission, user), getPublishSuccessText(section?.title || submission.kind, submission.state))}>
                            {getPublishButtonLabel(section?.title || submission.kind, submission.state)}
                          </button>
                        )}
                        <button type="button" className="text-button subtle" disabled={busyId === submission.id} onClick={() => withAction(submission.id, () => deleteOpsSubmission(submission, user), '协作稿已删除。')}>
                          删除
                        </button>
                      </>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ol>
        ) : (
          <p className="muted-copy">待办已空。</p>
        )}
      </section>

      {!roleLoading && !isAdmin ? (
        <section className="page-section">
          <div className="submission-receipt submission-receipt-warning">
            <p className="submission-receipt-kicker">权限提示</p>
            <h2 className="submission-receipt-title">当前账号还不能审核发布</h2>
            <p className="submission-receipt-note">{accountLabel} 现在只能查看，不能点“发布”。如果你本应是审核员，请确认 `profiles.role` 已设为 `admin` 或 `super_admin`。</p>
          </div>
        </section>
      ) : null}

      {visibleSections.map((section) => (
          <section className="page-section" key={section.kind}>
            <h2 className="section-title">{section.title}</h2>
            <ol className="record-list">
              {section.items.map((submission) => {
                const destination = getSubmissionDestination(submission, publishedDestinationMap)

                return (
                  <li key={submission.id} className="record-entry">
                    <div className="record-entry-head">
                      <div>
                        <h3>{section.buildTitle(submission)}</h3>
                        <p className="record-meta">
                          {submission.authorName} · {formatDateTime(submission.createdAt)} · {getSubmissionStateLabel(submission.state)}
                        </p>
                      </div>
                    </div>
                    <p>{section.buildBody(submission)}</p>
                    <p className="record-meta">
                      状态：{getSubmissionStateLabel(submission.state)} · 去处：{destination.published ? destination.label : '栏目总页'}
                    </p>
                    <div className="editorial-actions">
                      <Link to={destination.href}>
                        {destination.published && destination.exact ? '前往条目' : '前往栏目'}
                      </Link>
                      {isAdmin ? (
                        <>
                          {submission.published ? (
                            <button type="button" className="text-button" disabled={busyId === submission.id} onClick={() => withAction(submission.id, () => unpublishOpsSubmission(submission, user), getUnpublishSuccessText(section.title))}>
                              {getUnpublishButtonLabel(section.title)}
                            </button>
                          ) : (
                            <button type="button" className="text-button" disabled={busyId === submission.id || backendMode !== 'official'} onClick={() => withAction(submission.id, () => publishOpsSubmission(submission, user), getPublishSuccessText(section.title, submission.state))}>
                              {getPublishButtonLabel(section.title, submission.state)}
                            </button>
                          )}
                          <button type="button" className="text-button subtle" disabled={busyId === submission.id} onClick={() => withAction(submission.id, () => deleteOpsSubmission(submission, user), '已删除。')}>
                            删除
                          </button>
                        </>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>
      ))}

      {moderationHistory.length ? (
        <section className="page-section">
          <h2 className="section-title">最近记录</h2>
          <ol className="record-list compact">
            {moderationHistory.map((item) => (
              <li key={`ledger-${item.id}`} className="record-entry">
                <div className="record-entry-head">
                  <div>
                    <h3>{item.href ? <Link to={item.href}>{item.title}</Link> : item.title}</h3>
                    <p className="record-meta">{item.meta}</p>
                  </div>
                </div>
                <p>{item.note}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </article>
  )
}
