import { Link } from 'react-router-dom'
import DailyMeditation from '../components/DailyMeditation'
import PageHeader from '../components/PageHeader'
import { usePublicAlbums } from '../hooks/usePublicAlbums'

export default function Gallery() {
  const { albums } = usePublicAlbums()
  const orderedAlbums = [...albums].sort((a, b) => b.date.localeCompare(a.date))
  const totalPhotos = orderedAlbums.reduce((sum, album) => sum + album.count, 0)
  const gallerySummary = orderedAlbums.length
    ? `${orderedAlbums.length} plate album${orderedAlbums.length === 1 ? '' : 's'}, ordered by date. · ${orderedAlbums.length} 册图版，按日期编列。`
    : 'No plates indexed yet. · 图版暂未编入。'

  return (
    <article className="page-column">
      <PageHeader
        kicker="Planches"
        title="Plate index · 图版目录"
        summary={gallerySummary}
        backTo="/"
        backLabel="Back to title page · 返回扉页"
        meta={[
          `${orderedAlbums.length} album${orderedAlbums.length === 1 ? '' : 's'} · ${orderedAlbums.length} 册`,
          `${totalPhotos} plate${totalPhotos === 1 ? '' : 's'} · ${totalPhotos} 张图版`,
        ]}
      />

      <section className="page-section">
        <h2 className="section-title">Plate index · 图版目录</h2>
        <ol className="record-list">
          {orderedAlbums.map((album) => (
            <li key={album.id} className="record-entry">
              <h3>
                <Link to={`/album/${album.id}`}>
                  {album.titleEn ? `${album.titleEn} · ${album.title}` : album.title}
                </Link>
              </h3>
              <p className="record-meta">{album.date} · {album.location}</p>
              <figure className="entry-figure">
                <picture>
                  {album.coverWebp ? <source srcSet={album.coverWebp} type="image/webp" /> : null}
                  <img
                    src={album.cover}
                    alt={album.title}
                    loading="lazy"
                    decoding="async"
                    width={album.coverWidth}
                    height={album.coverHeight}
                  />
                </picture>
              </figure>
            </li>
          ))}
        </ol>
        <DailyMeditation offset={4} />
      </section>
    </article>
  )
}
