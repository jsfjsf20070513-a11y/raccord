import { useRef } from 'react'
import { Link } from 'react-router-dom'
import '../../WorldInternalExperience.css'
import '../../WorldRefinement.css'

export default function CarnetArchivesMobile({ volumes, selectedIndex, onSelect, todayIndex, theorem }) {
  const selected = theorem(selectedIndex)
  const readerRef = useRef(null)
  const selectArchive = (index) => {
    onSelect(index)
    window.requestAnimationFrame(() => {
      readerRef.current?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      })
    })
  }

  return <article className="carnet-archives carnet-archives-mobile"><header ref={readerRef}><p>Archives · Le Carnet</p><h1>{selected.title}</h1><span>N°{String(selectedIndex + 1).padStart(2, '0')} · {selectedIndex === todayIndex ? 'Aujourd’hui' : 'Archive'}</span></header><section className="archive-mobile-reader"><p>{selected.prelude}</p><div className="archive-formula" dangerouslySetInnerHTML={{ __html: selected.displayHtml || selected.fallback }} /><p className="archive-note"><i>批：</i>{selected.note}</p></section><nav>{volumes.map((volume) => <details key={volume.roman}><summary>{volume.roman} · {volume.title}<span>{volume.indices.length}</span></summary>{volume.indices.map((index) => <button key={index} type="button" className={index === selectedIndex ? 'is-active' : ''} onClick={() => selectArchive(index)}>N°{String(index + 1).padStart(2, '0')} · {theorem(index).title}</button>)}</details>)}</nav><footer><Link to="/">Aujourd’hui →</Link></footer></article>
}
