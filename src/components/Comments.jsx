import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, isSupabaseConfigured, SUPABASE_MISSING_MESSAGE } from '../lib/supabase'
import { OPS_QUEUE_ALBUM_ID } from '../lib/opsQueue'
import { useAuth } from '../context/useAuth'

function isMissingAlbumScopeError(error) {
  const message = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase()
  return message.includes('album_id') || message.includes('schema cache')
}

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function isVisibleComment(comment) {
  return Number(comment?.album_id) !== OPS_QUEUE_ALBUM_ID
}

export default function Comments({ albumId, title = '留言板' }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [useLegacyScope, setUseLegacyScope] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    setUseLegacyScope(false)
  }, [albumId])

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !user) {
      setIsAdmin(false)
      return undefined
    }

    let active = true

    const loadRole = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      if (!active) return
      if (error) {
        setIsAdmin(false)
        return
      }
      setIsAdmin(data?.role === 'admin' || data?.role === 'super_admin')
    }

    loadRole()

    return () => {
      active = false
    }
  }, [user])

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false)
      return undefined
    }

    let active = true

    const loadComments = async (scoped) => {
      let query = supabase.from('comments').select('*').order('created_at', { ascending: false })

      if (scoped && albumId) {
        query = query.eq('album_id', Number(albumId))
      }

      const { data, error } = await query
      if (error) throw error
      return (data || []).filter(isVisibleComment)
    }

    const fetchComments = async () => {
      setLoading(true)
      setErrorMsg('')

      try {
        const data = await loadComments(Boolean(albumId) && !useLegacyScope)
        if (!active) return
        setComments(data)
      } catch (error) {
        if (albumId && !useLegacyScope && isMissingAlbumScopeError(error)) {
          if (!active) return
          setUseLegacyScope(true)
          try {
            const legacyData = await loadComments(false)
            if (!active) return
            setComments(legacyData)
          } catch (legacyError) {
            if (!active) return
            setErrorMsg(`无法加载留言：${legacyError.message || '网络错误'}`)
          } finally {
            if (active) setLoading(false)
          }
          return
        }

        if (!active) return
        setErrorMsg(`无法加载留言：${error.message || '网络错误'}`)
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchComments()

    const channel = supabase
      .channel(`public:comments:${albumId || 'all'}:${useLegacyScope ? 'legacy' : 'scoped'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, (payload) => {
        const nextComment = payload.eventType === 'DELETE' ? payload.old : payload.new

        if (!nextComment) {
          return
        }

        if (!isVisibleComment(nextComment)) {
          return
        }

        if (albumId && !useLegacyScope && Number(nextComment.album_id) !== Number(albumId)) {
          return
        }

        setComments((current) => {
          if (payload.eventType === 'DELETE') {
            return current.filter((comment) => comment.id !== nextComment.id)
          }

          const withoutCurrent = current.filter((comment) => comment.id !== nextComment.id)
          return [nextComment, ...withoutCurrent]
        })
      })
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [albumId, useLegacyScope])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!isSupabaseConfigured || !supabase) {
      setErrorMsg(SUPABASE_MISSING_MESSAGE)
      return
    }

    if (!user || !newComment.trim()) {
      return
    }

    setSubmitting(true)
    setErrorMsg('')

    const buildPayload = (includeAlbumId) => ({
      content: newComment.trim(),
      user_id: user.id,
      user_email: user.email,
      user_nickname: user.user_metadata?.nickname || user.user_metadata?.real_name || '同学',
      created_at: new Date().toISOString(),
      ...(includeAlbumId ? { album_id: Number(albumId) } : {}),
    })

    try {
      let { data, error } = await supabase
        .from('comments')
        .insert([buildPayload(Boolean(albumId) && !useLegacyScope)])
        .select()

      if (error && albumId && !useLegacyScope && isMissingAlbumScopeError(error)) {
        setUseLegacyScope(true)
        const fallback = await supabase.from('comments').insert([buildPayload(false)]).select()
        data = fallback.data
        error = fallback.error
      }

      if (error) throw error

      if (data?.length) {
        setComments((current) => [data[0], ...current.filter((item) => item.id !== data[0].id)])
      }

      setNewComment('')
    } catch (error) {
      setErrorMsg(
        `Submit failed: ${error.message || 'check Supabase config or network'} · 发送失败：${error.message || '请检查 Supabase 配置或网络'}`,
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId) => {
    if (!isSupabaseConfigured || !supabase) {
      setErrorMsg(SUPABASE_MISSING_MESSAGE)
      return
    }

    if (!user) {
      setErrorMsg('Sign in before deleting a comment. · 请先登录后再删除留言。')
      return
    }

    if (!window.confirm('Delete this comment? · 确定要删除这条留言吗？')) {
      return
    }

    let query = supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .neq('album_id', OPS_QUEUE_ALBUM_ID)

    if (albumId && !useLegacyScope) {
      query = query.eq('album_id', Number(albumId))
    }

    if (!isAdmin) {
      query = query.eq('user_id', user.id)
    }

    const { data, error } = await query.select('id')
    if (error) {
      setErrorMsg(
        `Delete failed: ${error.message || 'network error'} · 删除失败：${error.message || '网络错误'}`,
      )
      return
    }

    if (!data?.length) {
      setErrorMsg(
        isAdmin
          ? 'Delete failed: comment no longer exists or has changed. · 删除失败：留言不存在或已变更。'
          : 'Delete failed: you can only delete your own comments. · 删除失败：你只能删除自己的留言。',
      )
      return
    }

    setComments((current) => current.filter((item) => item.id !== commentId))
  }

  if (!isSupabaseConfigured) {
    return (
      <section className="page-section">
        <h2 className="section-title">{title}</h2>
        <p className="muted-copy">{SUPABASE_MISSING_MESSAGE}</p>
      </section>
    )
  }

  return (
    <section className="page-section">
      <h2 className="section-title">{title}</h2>
      {errorMsg ? <p className="status-line is-error">{errorMsg}</p> : null}

      {user ? (
        <form className="editorial-form" onSubmit={handleSubmit}>
          <label>
            <span>留下附记</span>
            <textarea
              className="comment-textarea"
              rows="4"
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
              placeholder="写下对这本相册的记忆、补注或更正。"
            />
          </label>
          <div className="editorial-actions">
            <span className="muted-copy">署名：{user.user_metadata?.nickname || user.email}</span>
            <button type="submit" className="text-button" disabled={submitting}>
              {submitting ? '送出中' : '提交留言'}
            </button>
          </div>
        </form>
      ) : (
        <p className="muted-copy">
          <Link to="/login">Sign in · 登录</Link>
          {' '}to leave a marginal note. · 后可在此留言。
        </p>
      )}

      {loading ? <p className="muted-copy">正在调入旧页边批注……</p> : null}

      {!loading && !comments.length ? (
        <p className="muted-copy">
          {albumId ? '这本相册暂时还没有页边批注。' : '暂时还没有站内留言。'}
        </p>
      ) : null}

      {!loading && comments.length ? (
        <ol className="record-list comments-list">
          {comments.map((comment) => (
            <li key={comment.id} className="record-entry">
              <div className="record-entry-head">
                <div>
                  <h3>{comment.user_nickname || '同学'}</h3>
                  <p className="record-meta">{formatDate(comment.created_at)}</p>
                </div>
                {user && (isAdmin || user.id === comment.user_id) ? (
                  <button type="button" className="text-button subtle" onClick={() => handleDelete(comment.id)}>
                    删除
                  </button>
                ) : null}
              </div>
              <p>{comment.content}</p>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  )
}
