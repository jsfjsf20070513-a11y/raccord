import { Link, useParams } from 'react-router-dom'
import Comments from '../components/Comments'
import DailyMeditation from '../components/DailyMeditation'
import PageHeader from '../components/PageHeader'
import { usePublicAlbums } from '../hooks/usePublicAlbums'

export default function AlbumDetail() {
  const { id } = useParams()
  const { albums, albumsById } = usePublicAlbums()
  const album = albumsById[id]

  if (!album) {
    return (
      <article className="page-column album-page">
        <PageHeader
          kicker="Planches"
          title="相册不存在"
          summary="这一本图版未能调出。"
          backTo="/"
          backLabel="返回扉页"
          showRule={false}
        />
      </article>
    )
  }

  const orderedAlbums = [...albums].sort((a, b) => b.date.localeCompare(a.date))
  const currentIndex = orderedAlbums.findIndex((item) => String(item.id) === String(album.id))
  const previousAlbum = currentIndex > 0 ? orderedAlbums[currentIndex - 1] : null
  const nextAlbum = currentIndex < orderedAlbums.length - 1 ? orderedAlbums[currentIndex + 1] : null
  const meditationOffset = 5 + Math.max(currentIndex, 0)
  const commentScopeId = album.commentScopeId || album.id

  return (
    <article className="page-column album-page">
      <PageHeader
        kicker="Planches"
        title={album.title}
        backTo="/"
        backLabel="返回扉页"
        meta={[album.date, album.location, `${album.photos.length} 张图版`]}
        showRule={false}
      />

      <section className="page-section">
        <ol className="photo-list album-plates">
          {album.photos.map((photo, index) => (
            <li key={`${photo.src}-${index}`}>
              <figure className="entry-figure">
                <picture>
                  {photo.webp ? <source srcSet={photo.webp} type="image/webp" /> : null}
                  <img
                    src={photo.src}
                    alt={photo.caption || album.title}
                    decoding="async"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    width={photo.width}
                    height={photo.height}
                  />
                </picture>
              </figure>
            </li>
          ))}
        </ol>
        <DailyMeditation offset={meditationOffset} />
      </section>

      <Comments albumId={commentScopeId} title="页边批注" />

      <nav className="pager-nav">
        {previousAlbum ? <Link to={`/album/${previousAlbum.id}`}>上一篇</Link> : <span />}
        <Link to="/">返回扉页</Link>
        {nextAlbum ? <Link to={`/album/${nextAlbum.id}`}>下一篇</Link> : <span />}
      </nav>
    </article>
  )
}
