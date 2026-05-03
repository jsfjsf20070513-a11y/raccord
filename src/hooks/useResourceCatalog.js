import { useMemo } from 'react'
import { usePublishedContent } from './usePublishedContent'
import { buildPublicResourceCatalog } from '../data/resourceCatalog'

export function useResourceCatalog() {
  const { resources: officialResources, loading: publishedLoading } = usePublishedContent()

  const catalogItems = useMemo(
    () => buildPublicResourceCatalog({ officialResources }),
    [officialResources],
  )

  return {
    catalogItems,
    loading: publishedLoading,
  }
}
