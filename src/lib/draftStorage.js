const DRAFT_PREFIX = 'mathclass-site-drafts'
export const DRAFTS_UPDATED_EVENT = 'mathclass-site-drafts-updated'

function getStorageKey(scope) {
  return `${DRAFT_PREFIX}:${scope}`
}

function emitDraftUpdate(scope) {
  if (typeof window === 'undefined') {
    return
  }
  window.dispatchEvent(new CustomEvent(DRAFTS_UPDATED_EVENT, { detail: { scope } }))
}

export function loadDrafts(scope) {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(scope))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function createDraft(scope, values) {
  const nextDrafts = [
    {
      ...values,
      id: typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      savedAt: new Date().toISOString(),
    },
    ...loadDrafts(scope),
  ]

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(getStorageKey(scope), JSON.stringify(nextDrafts))
    emitDraftUpdate(scope)
  }

  return nextDrafts
}

export function deleteDraft(scope, id) {
  const nextDrafts = loadDrafts(scope).filter((draft) => draft.id !== id)

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(getStorageKey(scope), JSON.stringify(nextDrafts))
    emitDraftUpdate(scope)
  }

  return nextDrafts
}
