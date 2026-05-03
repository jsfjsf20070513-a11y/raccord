import { useEffect, useState } from 'react'
import {
  fetchOfficialContent,
  OFFICIAL_CONTENT_UPDATED_EVENT,
  OFFICIAL_CONTENT_UPDATED_STORAGE_KEY,
} from '../lib/contentBackend'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const INITIAL_STATE = {
  mode: 'compat',
  albums: [],
  resources: [],
  loading: true,
  error: '',
}

let cachedPublishedContent = null
let pendingPublishedContentPromise = null

function buildPublishedContentState(data) {
  return {
    ...data,
    loading: false,
    error: '',
  }
}

async function loadPublishedContent(forceRefresh = false) {
  if (!forceRefresh && cachedPublishedContent) {
    return cachedPublishedContent
  }

  if (!forceRefresh && pendingPublishedContentPromise) {
    return pendingPublishedContentPromise
  }

  pendingPublishedContentPromise = fetchOfficialContent()
  try {
    const data = await pendingPublishedContentPromise
    cachedPublishedContent = data
    return data
  } finally {
    pendingPublishedContentPromise = null
  }
}

export function usePublishedContent() {
  const [state, setState] = useState(() => (
    cachedPublishedContent ? buildPublishedContentState(cachedPublishedContent) : INITIAL_STATE
  ))

  useEffect(() => {
    let active = true
    let refreshTimer = 0

    const syncContent = async (forceRefresh = false) => {
      try {
        const data = await loadPublishedContent(forceRefresh)
        if (!active) {
          return
        }

        setState(buildPublishedContentState(data))
      } catch (error) {
        console.error('Failed to load official content:', error)
        if (!active) {
          return
        }

        setState((current) => ({
          ...current,
          loading: false,
          error: error.message || '无法加载正式内容表',
        }))
      }
    }

    const scheduleSync = (forceRefresh = false) => {
      window.clearTimeout(refreshTimer)
      refreshTimer = window.setTimeout(() => {
        cachedPublishedContent = forceRefresh ? null : cachedPublishedContent
        syncContent(forceRefresh)
      }, forceRefresh ? 120 : 0)
    }

    if (!cachedPublishedContent) {
      syncContent()
    }

    const handleOfficialContentUpdated = () => {
      scheduleSync(true)
    }

    const handleStorage = (event) => {
      if (event.key === OFFICIAL_CONTENT_UPDATED_STORAGE_KEY) {
        scheduleSync(true)
      }
    }

    window.addEventListener(OFFICIAL_CONTENT_UPDATED_EVENT, handleOfficialContentUpdated)
    window.addEventListener('storage', handleStorage)

    let channel = null
    if (isSupabaseConfigured && supabase) {
      channel = supabase
        .channel('public:official-content')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'albums' },
          () => scheduleSync(true),
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'album_photos' },
          () => scheduleSync(true),
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'resources' },
          () => scheduleSync(true),
        )
        .subscribe()
    }

    return () => {
      active = false
      window.clearTimeout(refreshTimer)
      window.removeEventListener(OFFICIAL_CONTENT_UPDATED_EVENT, handleOfficialContentUpdated)
      window.removeEventListener('storage', handleStorage)
      if (channel && supabase) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  return state
}
