import { useEffect, useMemo, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { fetchOpsSubmissions, OPS_QUEUE_ALBUM_ID, OPS_QUEUE_KINDS } from '../lib/opsQueue'

function resolveOptions(input) {
  if (typeof input === 'string') {
    return { kind: input }
  }

  return input || {}
}

export function useOpsSubmissions(input = {}) {
  const {
    kind = '',
    scope = 'all',
    userId = '',
    publishedSubmissionIds = new Set(),
    publishedContentMode = 'official',
  } = resolveOptions(input)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(Boolean(isSupabaseConfigured && (scope !== 'mine' || userId)))
  const [error, setError] = useState('')
  const isMineScope = scope === 'mine'

  useEffect(() => {
    if (isMineScope && !userId) {
      setSubmissions([])
      setError('')
      setLoading(false)
      return undefined
    }

    if (!isSupabaseConfigured || !supabase) {
      setLoading(false)
      return undefined
    }

    let active = true
    setLoading(true)

    const syncSubmissions = async () => {
      try {
        let nextSubmissions = []

        if (isMineScope) {
          const [mineSubmissions, moderationReceipts] = await Promise.all([
            fetchOpsSubmissions({
              userId,
              kind,
            }),
            fetchOpsSubmissions({
              kind: OPS_QUEUE_KINDS.moderation,
              targetUserId: userId,
            }),
          ])

          nextSubmissions = [...mineSubmissions, ...moderationReceipts]
        } else {
          nextSubmissions = await fetchOpsSubmissions({ kind })
        }

        if (!active) {
          return
        }
        setSubmissions(nextSubmissions)
        setError('')
      } catch (fetchError) {
        console.error('Failed to load ops submissions:', fetchError)
        if (active) {
          setError(fetchError.message || '无法加载云端协作稿')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    syncSubmissions()

    const channel = supabase
      .channel(`public:ops-queue:${isMineScope ? userId || 'mine' : kind || 'all'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `album_id=eq.${OPS_QUEUE_ALBUM_ID}`,
        },
        () => {
          syncSubmissions()
        },
      )
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [isMineScope, kind, userId])

  const moderationEntries = useMemo(() => (
    submissions.filter((submission) => submission.kind === OPS_QUEUE_KINDS.moderation)
  ), [submissions])

  const moderationMap = useMemo(() => {
    const nextMap = {}

    moderationEntries.forEach((submission) => {
      const targetId = submission.payload?.targetId
      if (!targetId || nextMap[targetId]) {
        return
      }

      nextMap[targetId] = submission
    })

    return nextMap
  }, [moderationEntries])

  const contentEntries = useMemo(() => (
    submissions
      .filter((submission) => submission.kind !== OPS_QUEUE_KINDS.moderation)
      .map((submission) => {
        const moderation = moderationMap[submission.id] || null
        const moderationState = moderation?.payload?.state || ''
        const publishedInOfficialTables = publishedContentMode === 'official' && publishedSubmissionIds.has(submission.id)
        const state = (
          moderationState === 'deleted'
            ? 'deleted'
            : moderationState === 'unpublished'
              ? 'unpublished'
              : publishedInOfficialTables
                ? 'published'
                : moderationState === 'published'
                  ? 'publish_blocked'
                  : 'pending'
        )

        return {
          ...submission,
          moderation,
          receiptOnly: false,
          state,
          published: state === 'published',
        }
      })
      .concat(
        isMineScope
          ? moderationEntries
              .filter((submission) => submission.payload?.state === 'deleted')
              .filter((submission) => submission.payload?.targetUserId === userId)
              .filter((submission) => !submissions.some((item) => item.id === submission.payload?.targetId))
              .map((submission) => ({
                id: submission.payload?.targetId || `deleted-${submission.id}`,
                kind: submission.payload?.targetKind || kind || '',
                payload: {
                  title: submission.payload?.title || '',
                  description: submission.payload?.excerpt || '',
                },
                createdAt: submission.createdAt,
                userId: submission.payload?.targetUserId || userId,
                authorName: submission.payload?.targetAuthorName || '未署名',
                moderation: submission,
                receiptOnly: true,
                state: 'deleted',
                published: false,
              }))
          : [],
      )
  ), [kind, moderationEntries, moderationMap, publishedContentMode, publishedSubmissionIds, submissions, userId, isMineScope])

  const filteredSubmissions = useMemo(() => {
    if (!kind) {
      return contentEntries
    }

    return contentEntries.filter((submission) => submission.kind === kind)
  }, [contentEntries, kind])

  return {
    submissions: filteredSubmissions,
    moderationEntries,
    loading,
    error,
  }
}
