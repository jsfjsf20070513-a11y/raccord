import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/useAuth'
import { usePublishedContent } from '../hooks/usePublishedContent'
import { useUserRole } from '../hooks/useUserRole'
import { createDraft, deleteDraft, loadDrafts } from '../lib/draftStorage'
import { normalizeGalleryPayload, removeOpsSubmission, submitOpsSubmission } from '../lib/opsQueue'
import { buildPublishedDestinationMap, getSubmissionDestination } from '../lib/publicRoutes'
import { getSubmissionStateLabel } from '../lib/submissionWorkspace'
import { useOpsSubmissions } from '../hooks/useOpsSubmissions'

const initialForm = { title: '', date: '', location: '', cover: '', description: '', photos: [] }
const initialRevealState = {
  showDateField: false,
  showLocationField: false,
  showPhotosField: false,
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

function normalizePhotoList(value = [], cover = '') {
  const photos = Array.isArray(value)
    ? value.filter(Boolean)
    : `${value}`.split('\n').map((item) => item.trim()).filter(Boolean)

  if (photos.length) {
    return photos
  }

  return cover ? [cover] : []
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error || new Error('读取图片失败'))
    reader.readAsDataURL(file)
  })
}

async function compressImageFile(file) {
  const source = await fileToDataUrl(file)

  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const maxEdge = 1800
      const scale = Math.min(1, maxEdge / Math.max(image.width, image.height))
      const width = Math.max(1, Math.round(image.width * scale))
      const height = Math.max(1, Math.round(image.height * scale))
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')

      if (!context) {
        resolve(source)
        return
      }

      context.drawImage(image, 0, 0, width, height)
      const preferredType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      resolve(canvas.toDataURL(preferredType, preferredType === 'image/png' ? undefined : 0.82))
    }
    image.onerror = () => reject(new Error('图片处理失败'))
    image.src = source
  })
}

function buildRevealState(form) {
  const showDateField = hasValue(form.title)
  const showLocationField = showDateField && Boolean(form.date)
  const showPhotosField = showLocationField && hasValue(form.location)
  const showOptionalFields = showPhotosField && form.photos.length > 0

  return {
    showDateField,
    showLocationField,
    showPhotosField,
    showOptionalFields,
  }
}

export default function GalleryContribute() {
  const { user } = useAuth()
  const { isAdmin } = useUserRole()
  const [form, setForm] = useState(initialForm)
  const [revealedSteps, setRevealedSteps] = useState(initialRevealState)
  const [drafts, setDrafts] = useState([])
  const [status, setStatus] = useState(null)
  const [submissionReceipt, setSubmissionReceipt] = useState(null)
  const [cloudSubmitting, setCloudSubmitting] = useState(false)
  const [processingPhotos, setProcessingPhotos] = useState(false)
  const [editingDraftId, setEditingDraftId] = useState('')
  const [editingCloudId, setEditingCloudId] = useState('')
  const [busyCloudId, setBusyCloudId] = useState('')
  const titleInputRef = useRef(null)
  const dateInputRef = useRef(null)
  const locationInputRef = useRef(null)
  const photosInputRef = useRef(null)
  const descriptionInputRef = useRef(null)
  const { mode: backendMode, albums: officialAlbums } = usePublishedContent()
  const publishedSubmissionIds = useMemo(
    () => new Set(officialAlbums.map((album) => album.sourceSubmissionId).filter(Boolean)),
    [officialAlbums],
  )
  const { submissions: cloudAlbums } = useOpsSubmissions({
    kind: 'gallery',
    scope: 'mine',
    userId: user?.id || '',
    publishedSubmissionIds,
    publishedContentMode: backendMode,
  })

  const publishedDestinationMap = useMemo(
    () =>
      buildPublishedDestinationMap({
        albums: officialAlbums,
      }),
    [officialAlbums],
  )

  useEffect(() => {
    setDrafts(loadDrafts('gallery'))
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

  const handleTitleCommit = () => {
    if (hasValue(form.title)) {
      revealStep('showDateField', dateInputRef)
    }
  }

  const handleLocationCommit = () => {
    if (hasValue(form.location)) {
      revealStep('showPhotosField', photosInputRef)
    }
  }

  const handlePhotoSelection = async (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) {
      return
    }

    setProcessingPhotos(true)
    setStatus(null)
    setSubmissionReceipt(null)

    try {
      const nextPhotos = await Promise.all(files.map((file) => compressImageFile(file)))
      setForm((current) => {
        const mergedPhotos = [...current.photos, ...nextPhotos]
        return {
          ...current,
          photos: mergedPhotos,
          cover: mergedPhotos[0] || current.cover || '',
        }
      })
      revealStep('showOptionalFields', descriptionInputRef)
    } catch (error) {
      setStatus({ type: 'error', text: error.message || '图片处理失败，请重试。' })
    } finally {
      event.target.value = ''
      setProcessingPhotos(false)
    }
  }

  const handlePhotoRemoval = (index) => {
    setSubmissionReceipt(null)
    setForm((current) => {
      const nextPhotos = current.photos.filter((_, currentIndex) => currentIndex !== index)
      return {
        ...current,
        photos: nextPhotos,
        cover: nextPhotos[0] || '',
      }
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const wasEditingCloud = Boolean(editingCloudId)
    if (editingDraftId) {
      deleteDraft('gallery', editingDraftId)
    }
    setSubmissionReceipt(null)
    setDrafts(createDraft('gallery', { ...form, author: user?.user_metadata?.nickname || user?.email || '未登录访客' }))
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
      const replacingCloudSubmission = cloudAlbums.find(
        (submission) => submission.id === editingCloudId
          && submission.userId === user?.id
          && !submission.published
          && !submission.receiptOnly,
      )
      const nextSubmission = await submitOpsSubmission('gallery', normalizeGalleryPayload(form), user)
      if (replacingCloudSubmission) {
        try {
          await removeOpsSubmission(replacingCloudSubmission.id, user)
        } catch {
          setStatus({ type: 'success', text: '新稿已送出；旧稿仍在。' })
        }
      }
      const submittedTitle = nextSubmission?.payload?.title || form.title || '未命名图版'
      setForm(initialForm)
      setRevealedSteps(initialRevealState)
      setEditingDraftId('')
      setEditingCloudId('')
      setSubmissionReceipt({
        title: submittedTitle,
        steps: ['已送入协作', '等待审核员处理', '发布后进入相册'],
        note: backendMode !== 'official'
          ? '正式相册表还没建好，所以审核页暂时不能真的把它送进相册。先去 Supabase 执行建表脚本。'
          : isAdmin
          ? '你现在就可以去“审核发布”点“发布”，这册图版会直接进入相册。'
          : '审核员会在“审核发布”里点“发布”，这册图版随后就会进入相册。',
      })
    } catch (error) {
      setStatus({ type: 'error', text: error.message || '提交失败，请稍后重试。' })
    } finally {
      setCloudSubmitting(false)
    }
  }

  const loadDraftIntoForm = (draft) => {
    const nextForm = {
      title: draft.title || '',
      date: draft.date || '',
      location: draft.location || '',
      cover: draft.cover || '',
      description: draft.description || '',
      photos: normalizePhotoList(draft.photos, draft.cover || ''),
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
      title: payload.title || '',
      date: payload.date || '',
      location: payload.location || '',
      cover: payload.cover || '',
      description: payload.description || '',
      photos: normalizePhotoList(payload.photos, payload.cover || ''),
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

    if (!window.confirm('确定删除这份云端相册稿吗？')) {
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

  const myCloudAlbums = useMemo(() => {
    if (!user) return []

    return cloudAlbums
      .filter((submission) => submission.userId === user.id)
      .map((submission) => {
        const destination = getSubmissionDestination(submission, publishedDestinationMap)

        return {
          id: submission.id,
          title: submission.payload?.title || '未命名图版',
          meta: `${submission.payload?.date || '未填日期'} · ${submission.payload?.location || '未填地点'} · ${getSubmissionStateLabel(submission.state)}`,
          destination,
          canReplace: !submission.published && !submission.receiptOnly,
          submission,
          createdAt: submission.createdAt,
        }
      })
      .sort((a, b) => getSortValue(b).localeCompare(getSortValue(a)))
      .slice(0, 4)
  }, [cloudAlbums, publishedDestinationMap, user])

  const hasRecentItems = drafts.length || myCloudAlbums.length
  const surfaceStatus = cloudSubmitting
    ? { type: 'success', text: '正在送入协作……' }
    : status
  const {
    showDateField,
    showLocationField,
    showPhotosField,
    showOptionalFields,
  } = revealedSteps

  useEffect(() => {
    if (!hasValue(form.title) && !form.date && !hasValue(form.location) && form.photos.length === 0) {
      focusSoon(titleInputRef.current)
    }
  }, [form.title, form.date, form.location, form.photos])

  return (
    <article className="page-column">
      <PageHeader
        kicker="Gallery Contribution"
        title="图版补录"
        summary="把标题、日期、地点和图片传上来即可。"
        backTo="/manage"
        backLabel="返回协作入口"
      />

      <section className="page-section">
        <h2 className="section-title entry-form-title">填写图版</h2>
        <form className="editorial-form stepped-editorial-form" onSubmit={handleSubmit}>
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
              placeholder="例如：校园活动地点"
              required
            />
          </label>
          {showDateField ? (
            <label className="stepped-field">
              <span>日期</span>
              <input
                ref={dateInputRef}
                type="date"
                value={form.date}
                onBlur={() => {
                  if (form.date) {
                    revealStep('showLocationField', locationInputRef)
                  }
                }}
                onChange={(event) => {
                  const nextDate = event.target.value
                  setForm({ ...form, date: nextDate })
                  if (nextDate) {
                    revealStep('showLocationField', locationInputRef)
                  }
                }}
                required
              />
            </label>
          ) : null}
          {showLocationField ? (
            <label className="stepped-field">
              <span>地点</span>
              <input
                ref={locationInputRef}
                value={form.location}
                onBlur={handleLocationCommit}
                onChange={(event) => setForm({ ...form, location: event.target.value })}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    handleLocationCommit()
                  }
                }}
                placeholder="例如：苏州"
                required
              />
            </label>
          ) : null}
          {showPhotosField ? (
            <label className="stepped-field">
              <span>上传图片</span>
              <input
                ref={photosInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoSelection}
              />
              <p className="field-note">直接选图即可。可一次选多张，系统会自动压缩。</p>
              {form.photos.length ? (
                <ol className="upload-preview-list">
                  {form.photos.map((photo, index) => (
                    <li key={`photo-${index}`} className="upload-preview-item">
                      <img src={photo} alt={`已选图片 ${index + 1}`} />
                      <button type="button" className="text-button subtle" onClick={() => handlePhotoRemoval(index)}>
                        删除
                      </button>
                    </li>
                  ))}
                </ol>
              ) : null}
              {processingPhotos ? <p className="field-note">正在处理图片……</p> : null}
            </label>
          ) : null}
          {showOptionalFields ? (
            <div className="entry-form-optional-fields">
              <label className="stepped-field">
                <span>简介</span>
                <textarea ref={descriptionInputRef} rows="4" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="一句话简介，可先留空" />
              </label>
              <div className="editorial-actions">
                <button type="submit" className="text-button">保存到案头</button>
                <button type="button" className="text-button" onClick={handleCloudSubmit} disabled={cloudSubmitting}>
                  {cloudSubmitting ? '提交中' : '提交到协作'}
                </button>
              </div>
            </div>
          ) : null}
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
                <Link to="/gallery">查看图版目录</Link>
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
                        <p className="record-meta">{draft.date} · {draft.location}{editingDraftId === draft.id ? ' · 正在修改' : ''}</p>
                      </div>
                      <div className="editorial-actions">
                        <button type="button" className="text-button" onClick={() => loadDraftIntoForm(draft)}>载入继续写</button>
                        <button type="button" className="text-button subtle" onClick={() => setDrafts(deleteDraft('gallery', draft.id))}>删除</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
          {myCloudAlbums.length ? (
            <section className="entry-record-block">
              <h3 className="entry-record-heading">已送协作</h3>
              <ol className="record-list compact">
                {myCloudAlbums.map((item) => (
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
