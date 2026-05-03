import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/useAuth'
import { usePublishedContent } from '../hooks/usePublishedContent'
import { useUserRole } from '../hooks/useUserRole'
import { resourceCategories } from '../data/resourceCatalog'
import { createDraft, deleteDraft, loadDrafts } from '../lib/draftStorage'
import { normalizeResourcePayload, removeOpsSubmission, submitOpsSubmission } from '../lib/opsQueue'
import { buildPublishedDestinationMap, getSubmissionDestination } from '../lib/publicRoutes'
import { getSubmissionStateLabel } from '../lib/submissionWorkspace'
import { useOpsSubmissions } from '../hooks/useOpsSubmissions'

const initialForm = { category: '', title: '', url: '', tag: '', description: '' }
const initialRevealState = {
  showTitleField: false,
  showUrlField: false,
  showDescriptionField: false,
  showOptionalFields: false,
}

function getSortValue(item) {
  return `${item?.createdAt || item?.savedAt || item?.updatedAt || item?.date || ''}`
}

function hasValue(value = '') {
  return `${value}`.trim().length > 0
}

function focusSoon(element) {
  if (typeof window === 'undefined' || !element) {
    return
  }

  window.requestAnimationFrame(() => {
    element.focus()
  })
}

function buildRevealState(form) {
  const showTitleField = hasValue(form.category)
  const showUrlField = showTitleField && hasValue(form.title)
  const showDescriptionField = showUrlField && hasValue(form.url)
  const showOptionalFields = showDescriptionField && hasValue(form.description)

  return {
    showTitleField,
    showUrlField,
    showDescriptionField,
    showOptionalFields,
  }
}

export default function ResourceCurate() {
  const { user } = useAuth()
  const { isAdmin } = useUserRole()
  const [form, setForm] = useState(initialForm)
  const [revealedSteps, setRevealedSteps] = useState(initialRevealState)
  const [drafts, setDrafts] = useState([])
  const [status, setStatus] = useState(null)
  const [submissionReceipt, setSubmissionReceipt] = useState(null)
  const [cloudSubmitting, setCloudSubmitting] = useState(false)
  const [editingDraftId, setEditingDraftId] = useState('')
  const [editingCloudId, setEditingCloudId] = useState('')
  const [busyCloudId, setBusyCloudId] = useState('')
  const categoryInputRef = useRef(null)
  const titleInputRef = useRef(null)
  const urlInputRef = useRef(null)
  const descriptionInputRef = useRef(null)
  const tagInputRef = useRef(null)
  const { mode: backendMode, resources: officialResources } = usePublishedContent()
  const publishedSubmissionIds = useMemo(
    () => new Set(officialResources.map((resource) => resource.sourceSubmissionId).filter(Boolean)),
    [officialResources],
  )
  const { submissions: cloudResources } = useOpsSubmissions({
    kind: 'resource',
    scope: 'mine',
    userId: user?.id || '',
    publishedSubmissionIds,
    publishedContentMode: backendMode,
  })

  const publishedDestinationMap = useMemo(
    () =>
      buildPublishedDestinationMap({
        resources: officialResources,
      }),
    [officialResources],
  )

  useEffect(() => {
    setDrafts(loadDrafts('resources'))
  }, [])

  const revealStep = (key, targetRef) => {
    let shouldFocus = false

    setRevealedSteps((current) => {
      if (current[key]) {
        return current
      }

      shouldFocus = true
      return {
        ...current,
        [key]: true,
      }
    })

    if (shouldFocus) {
      focusSoon(targetRef.current)
    }
  }

  const handleCategoryCommit = () => {
    if (hasValue(form.category)) {
      revealStep('showTitleField', titleInputRef)
    }
  }

  const handleTitleCommit = () => {
    if (hasValue(form.title)) {
      revealStep('showUrlField', urlInputRef)
    }
  }

  const handleDescriptionCommit = () => {
    if (hasValue(form.description)) {
      revealStep('showOptionalFields', tagInputRef)
    }
  }

  const categoryOptions = useMemo(
    () => resourceCategories.map((category) => category.label),
    [],
  )

  const tagOptions = useMemo(
    () =>
      Array.from(
        new Set(
          resourceCategories.flatMap((category) =>
            category.items.map((item) => item.tag).filter(Boolean),
          ),
        ),
      ).sort((a, b) => a.localeCompare(b, 'zh-CN')),
    [],
  )

  const handleSubmit = (event) => {
    event.preventDefault()
    const wasEditingCloud = Boolean(editingCloudId)
    if (editingDraftId) {
      deleteDraft('resources', editingDraftId)
    }
    setSubmissionReceipt(null)
    setDrafts(createDraft('resources', { ...form, curator: user?.user_metadata?.nickname || user?.email || '未登录访客' }))
    setForm(initialForm)
    setRevealedSteps(initialRevealState)
    setEditingDraftId('')
    setEditingCloudId('')
    setStatus({
      type: 'success',
      text: wasEditingCloud
        ? '已另存案头；协作稿未动。'
        : editingDraftId
          ? '案头稿已改。'
          : '案头稿已存。',
    })
  }

  const handleCloudSubmit = async (event) => {
    const formElement = event.currentTarget.form
    if (formElement && !formElement.reportValidity()) return
    setCloudSubmitting(true)
    setStatus(null)
    setSubmissionReceipt(null)
    try {
      const replacingCloudSubmission = cloudResources.find(
        (submission) => submission.id === editingCloudId
          && submission.userId === user?.id
          && !submission.published
          && !submission.receiptOnly,
      )
      const nextSubmission = await submitOpsSubmission('resource', normalizeResourcePayload(form), user)
      if (replacingCloudSubmission) {
        try {
          await removeOpsSubmission(replacingCloudSubmission.id, user)
        } catch {
          setStatus({ type: 'success', text: '新稿已送出；旧稿仍在。' })
        }
      }
      const submittedTitle = nextSubmission?.payload?.title || form.title || '未命名资源'
      setForm(initialForm)
      setRevealedSteps(initialRevealState)
      setEditingDraftId('')
      setEditingCloudId('')
      setSubmissionReceipt({
        title: submittedTitle,
        steps: ['已送入协作', '等待审核员处理', '发布后进入资源页'],
        note: backendMode !== 'official'
          ? '正式资源表还没建好，所以审核页暂时不能真的把它送进公开书架。先去 Supabase 执行建表脚本。'
          : isAdmin
          ? '你现在就可以去“审核发布”点“发布”，这条资源会直接进入公开书架。'
          : '审核员会在“审核发布”里点“发布”，这条资源随后就会进入公开书架。',
      })
    } catch (error) {
      setStatus({ type: 'error', text: error.message || '提交失败，请稍后重试。' })
    } finally {
      setCloudSubmitting(false)
    }
  }

  const loadDraftIntoForm = (draft) => {
    const nextForm = {
      category: draft.category || '',
      title: draft.title || '',
      url: draft.url || '',
      tag: draft.tag || '',
      description: draft.description || '',
    }
    setForm(nextForm)
    setRevealedSteps(buildRevealState(nextForm))
    setEditingDraftId(draft.id)
    setEditingCloudId('')
    setSubmissionReceipt(null)
    setStatus({ type: 'success', text: '案头稿已载入。' })
  }

  const loadCloudSubmissionIntoForm = (submission, mode = 'copy') => {
    const payload = submission.payload || {}
    const nextForm = {
      category: payload.category || '',
      title: payload.title || '',
      url: payload.url || '',
      tag: payload.tag || '',
      description: payload.description || '',
    }
    setForm(nextForm)
    setRevealedSteps(buildRevealState(nextForm))
    setEditingDraftId('')
    setEditingCloudId(mode === 'replace' ? submission.id : '')
    setSubmissionReceipt(null)
    setStatus({
      type: 'success',
      text:
        mode === 'replace'
          ? '协作稿已载入，可继续修改。'
          : '协作稿已载入。',
    })
  }

  const handleCloudRemoval = async (submission) => {
    if (submission.published) {
      setStatus({ type: 'error', text: '已见公开栏；先撤下，再删协作稿。' })
      return
    }

    if (!window.confirm('确定删除这份云端资源稿吗？')) {
      return
    }

    setBusyCloudId(submission.id)
    setStatus(null)
    setSubmissionReceipt(null)

    try {
      await removeOpsSubmission(submission.id, user)
      if (editingCloudId === submission.id) {
        setEditingCloudId('')
      }
      setStatus({ type: 'success', text: '协作稿已删。' })
    } catch (error) {
      setStatus({ type: 'error', text: error.message || '删除失败，请稍后重试。' })
    } finally {
      setBusyCloudId('')
    }
  }

  const myCloudResources = useMemo(() => {
    if (!user) return []

    return cloudResources
      .filter((submission) => submission.userId === user.id)
      .map((submission) => {
        const destination = getSubmissionDestination(submission, publishedDestinationMap)

        return {
          id: submission.id,
          title: submission.payload?.title || '未命名目录',
          meta: `${submission.payload?.category || '未填分类'}${submission.payload?.tag ? ` · ${submission.payload.tag}` : ''} · ${getSubmissionStateLabel(submission.state)}`,
          destination,
          canReplace: !submission.published && !submission.receiptOnly,
          submission,
          createdAt: submission.createdAt,
        }
      })
      .sort((a, b) => getSortValue(b).localeCompare(getSortValue(a)))
      .slice(0, 4)
  }, [cloudResources, publishedDestinationMap, user])

  const hasRecentItems = drafts.length || myCloudResources.length
  const surfaceStatus = cloudSubmitting
    ? { type: 'success', text: '正在送入协作……' }
    : status
  const {
    showTitleField,
    showUrlField,
    showDescriptionField,
    showOptionalFields,
  } = revealedSteps

  useEffect(() => {
    if (!hasValue(form.category) && !hasValue(form.title) && !hasValue(form.url) && !hasValue(form.description)) {
      focusSoon(categoryInputRef.current)
    }
  }, [form.category, form.title, form.url, form.description])

  return (
    <article className="page-column">
      <PageHeader
        kicker="Resource Curation"
        title="资源扩充"
        summary="把分栏、标题、链接和材料写进去即可。"
        backTo="/manage"
        backLabel="返回协作入口"
      />

      <section className="page-section">
        <h2 className="section-title entry-form-title">填写目录</h2>
        <form className="editorial-form stepped-editorial-form" onSubmit={handleSubmit}>
          <label className="stepped-field">
            <span>分栏</span>
            <input
              ref={categoryInputRef}
              list="resource-category-list"
              value={form.category}
              onBlur={handleCategoryCommit}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  handleCategoryCommit()
                }
              }}
              placeholder="例如：数学分析与证明"
              required
            />
          </label>
          {showTitleField ? (
            <label className="stepped-field">
              <span>标题</span>
              <input
                ref={titleInputRef}
                value={form.title}
                onBlur={handleTitleCommit}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    handleTitleCommit()
                  }
                }}
                placeholder="例如：MIT OCW — Real Analysis"
                required
              />
            </label>
          ) : null}
          {showUrlField ? (
            <label className="stepped-field">
              <span>链接</span>
              <input
                ref={urlInputRef}
                type="url"
                value={form.url}
                onBlur={() => {
                  if (hasValue(form.url)) {
                    revealStep('showDescriptionField', descriptionInputRef)
                  }
                }}
                onChange={(event) => setForm({ ...form, url: event.target.value })}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    if (hasValue(form.url)) {
                      revealStep('showDescriptionField', descriptionInputRef)
                    }
                  }
                }}
                placeholder="https://..."
                required
              />
            </label>
          ) : null}
          {showDescriptionField ? (
            <label className="stepped-field">
              <span>材料</span>
              <textarea
                ref={descriptionInputRef}
                rows="6"
                value={form.description}
                onBlur={handleDescriptionCommit}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="例如：讲义、习题、试题、视频"
                required
              />
            </label>
          ) : null}
          {showOptionalFields ? (
            <div className="entry-form-optional-fields">
              <label className="stepped-field">
                <span>标签</span>
                <input ref={tagInputRef} list="resource-tag-list" value={form.tag} onChange={(event) => setForm({ ...form, tag: event.target.value })} placeholder="例如：实分析" />
              </label>
              <div className="editorial-actions">
                <button type="submit" className="text-button">保存到案头</button>
                <button type="button" className="text-button" onClick={handleCloudSubmit} disabled={cloudSubmitting}>{cloudSubmitting ? '提交中' : '提交到协作'}</button>
              </div>
            </div>
          ) : null}
          <datalist id="resource-category-list">
            {categoryOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
          <datalist id="resource-tag-list">
            {tagOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
          {surfaceStatus ? <p className={`status-line ${surfaceStatus.type === 'error' ? 'is-error' : 'is-success'}`}>{surfaceStatus.text}</p> : null}
          {submissionReceipt ? (
            <div className="submission-receipt" aria-live="polite">
              <p className="submission-receipt-kicker">协作回执</p>
              <h3 className="submission-receipt-title">{submissionReceipt.title}</h3>
              <ol className="submission-receipt-steps">
                {submissionReceipt.steps.map((step, index) => (
                  <li key={`${step}-${index}`} className={index === 0 ? 'is-done' : index === 1 ? 'is-current' : ''}>
                    {step}
                  </li>
                ))}
              </ol>
              <p className="submission-receipt-note">{submissionReceipt.note}</p>
              <div className="editorial-actions">
                <Link to={isAdmin ? '/manage/review' : '/manage'}>
                  {isAdmin ? '前往审核发布' : '返回协作入口'}
                </Link>
                <Link to="/resources">查看资源总页</Link>
              </div>
            </div>
          ) : null}
        </form>
      </section>

      {hasRecentItems ? (
        <section className="page-section entry-records-section">
          <h2 className="section-title entry-records-title">最近记录</h2>
          {drafts.length ? (
            <section className="entry-record-block">
              <h3 className="entry-record-heading">案头</h3>
              <ol className="record-list compact">
                {drafts.map((draft) => (
                  <li key={draft.id} className="record-entry">
                    <div className="record-entry-head">
                      <div>
                        <h3>{draft.title}</h3>
                        <p className="record-meta">{draft.category} · {draft.tag || '未加标签'}{editingDraftId === draft.id ? ' · 正在修改' : ''}</p>
                      </div>
                      <div className="editorial-actions">
                        <button type="button" className="text-button" onClick={() => loadDraftIntoForm(draft)}>载入继续写</button>
                        <button type="button" className="text-button subtle" onClick={() => setDrafts(deleteDraft('resources', draft.id))}>删除</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
          {myCloudResources.length ? (
            <section className="entry-record-block">
              <h3 className="entry-record-heading">已送协作</h3>
              <ol className="record-list compact">
                {myCloudResources.map((item) => (
                  <li key={item.id} className="record-entry">
                    <div className="record-entry-head">
                      <div>
                        <h3>{item.title}</h3>
                        <p className="record-meta">{item.meta}</p>
                      </div>
                      <div className="editorial-actions">
                        <Link to={item.destination.href}>
                          {item.destination.published && item.destination.exact ? '查看条目' : '查看状态'}
                        </Link>
                        <button
                          type="button"
                          className="text-button"
                          disabled={busyCloudId === item.id}
                          onClick={() => loadCloudSubmissionIntoForm(item.submission, item.canReplace ? 'replace' : 'copy')}
                        >
                          {item.canReplace ? '继续修改' : '引入表单'}
                        </button>
                        {item.canReplace ? (
                          <button
                            type="button"
                            className="text-button subtle"
                            disabled={busyCloudId === item.id}
                            onClick={() => handleCloudRemoval(item.submission)}
                          >
                            {busyCloudId === item.id ? '删除中' : '删除'}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </section>
      ) : null}
    </article>
  )
}
