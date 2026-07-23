import { useCallback, useEffect, useState } from 'react'

const AWAKENING_DURATION_MS = 1250

export default function useEnterAwakening() {
  const [isAwakening, setIsAwakening] = useState(true)
  const settle = useCallback(() => setIsAwakening(false), [])

  useEffect(() => {
    const timeout = window.setTimeout(settle, AWAKENING_DURATION_MS)
    return () => window.clearTimeout(timeout)
  }, [settle])

  return { isAwakening, settle }
}
