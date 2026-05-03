import { useMemo } from 'react'
import { albums as baseAlbums } from '../data/siteContent'
import { usePublishedContent } from './usePublishedContent'

function normalizeValue(value = '') {
  return `${value}`.trim().toLowerCase()
}

function buildAlbumIdentity(album) {
  return [
    normalizeValue(album.date),
    normalizeValue(album.title),
    normalizeValue(album.location),
  ].join('::')
}

function buildPublicAlbumList(officialAlbums = []) {
  const seen = new Set()

  return [...officialAlbums, ...baseAlbums]
    .filter((album) => {
      const identity = buildAlbumIdentity(album)
      if (!identity || seen.has(identity)) {
        return false
      }

      seen.add(identity)
      return true
    })
    .sort((left, right) => `${right.updatedAt || right.date}`.localeCompare(`${left.updatedAt || left.date}`))
}

export function usePublicAlbums() {
  const { albums: officialAlbums } = usePublishedContent()

  const albums = useMemo(() => buildPublicAlbumList(officialAlbums), [officialAlbums])
  const homeAlbums = useMemo(
    () => albums.slice(0, 7),
    [albums],
  )

  return {
    albums,
    homeAlbums,
    albumsById: Object.fromEntries(albums.map((album) => [String(album.id), album])),
  }
}
