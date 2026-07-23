import { useState } from 'react'
import { Link } from 'react-router-dom'
import { externalLinkProps } from '../../../lib/safeUrl'
import { getResourceLead } from '../../../lib/resourceText'
import '../../WorldInternalExperience.css'
import '../../WorldRefinement.css'

const INDEX = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']

function getInitialZoneIndex(zoneCount) {
  const match = window.location.hash.match(/^#zone-(\d+)$/)
  const index = match ? Number(match[1]) - 1 : 0
  return Number.isInteger(index) && index >= 0 && index < zoneCount ? index : 0
}

export default function PlanAtlasDesktop({ shelves, total }) {
  const [activeIndex, setActiveIndex] = useState(() => getInitialZoneIndex(shelves.length))
  const shelf = shelves[activeIndex]
  if (!shelf) return null
  return <article className="plan-atlas plan-atlas-desktop plan-atlas-refined"><header><p>Outil public · zone {INDEX[activeIndex]}</p><h1>Atlas</h1><dl><div><dt>Zones</dt><dd>{shelves.length}</dd></div><div><dt>Repères</dt><dd>{total}</dd></div></dl></header><div className="atlas-desktop-body"><nav aria-label="Atlas zones">{shelves.map((zone, index) => <button type="button" key={zone.title} className={index === activeIndex ? 'is-active' : ''} aria-pressed={index === activeIndex} onClick={() => setActiveIndex(index)}><small>{INDEX[index] || index + 1}</small><strong>{zone.title}</strong><span>{zone.items.length}</span></button>)}</nav><section className="atlas-zone-reader" id={`zone-${activeIndex + 1}`}><header><span>{INDEX[activeIndex] || activeIndex + 1}</span><div><h2>{shelf.title}</h2>{shelf.intro ? <p>{shelf.intro}</p> : null}</div></header><ol>{shelf.items.map((item) => { const lead=getResourceLead(item); return <li key={item.id}><a {...externalLinkProps(item.url)}>{item.title}</a>{item.tag ? <small>{item.tag}</small> : null}{lead ? <p>{lead}</p> : null}</li> })}</ol></section></div><footer><Link to="/resources/curate">Chantier · proposer un repère →</Link></footer></article>
}
