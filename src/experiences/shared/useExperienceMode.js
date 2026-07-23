import { useEffect, useState } from 'react'

export const MOBILE_EXPERIENCE_QUERY = '(max-width: 760px)'

function readMode() {
  if (typeof window === 'undefined') return 'desktop'
  return window.matchMedia(MOBILE_EXPERIENCE_QUERY).matches ? 'mobile' : 'desktop'
}

/**
 * Mounts one experience tree at a time. Desktop and mobile may share domain
 * data and material primitives, but they never duplicate DOM, Canvas loops or
 * network subscriptions behind CSS display rules.
 */
export default function useExperienceMode() {
  const [mode, setMode] = useState(readMode)

  useEffect(() => {
    const query = window.matchMedia(MOBILE_EXPERIENCE_QUERY)
    const update = () => setMode(query.matches ? 'mobile' : 'desktop')
    query.addEventListener('change', update)
    update()
    return () => query.removeEventListener('change', update)
  }, [])

  return mode
}
