import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { externalLinkProps } from '../../../lib/safeUrl'
import { getResourceLead } from '../../../lib/resourceText'
import '../../WorldInternalExperience.css'
import '../../WorldRefinement.css'

function getInitialZoneIndex(zoneCount) {
  const match = window.location.hash.match(/^#zone-(\d+)$/)
  const index = match ? Number(match[1]) - 1 : 0
  return Number.isInteger(index) && index >= 0 && index < zoneCount ? index : 0
}

export default function PlanAtlasMobile({ shelves, total }) {
  const [activeIndex, setActiveIndex] = useState(() => getInitialZoneIndex(shelves.length))
  return <article className="plan-atlas plan-atlas-mobile plan-atlas-refined"><header><p>Outil public · zone {String(activeIndex + 1).padStart(2, '0')}</p><h1>Atlas</h1><span>{shelves.length} zones · {total} repères</span></header><div className="atlas-mobile-zones">{shelves.map((shelf, index) => { const open=index===activeIndex; return <section key={shelf.title} className={open ? 'is-open' : ''}><button type="button" aria-expanded={open} onClick={() => setActiveIndex(index)}><small>{String(index + 1).padStart(2, '0')}</small><strong>{shelf.title}</strong><span>{shelf.items.length}</span><ChevronDown size={16} strokeWidth={1.5} aria-hidden="true" /></button>{open ? <ol>{shelf.items.map((item) => { const lead=getResourceLead(item); return <li key={item.id}><a {...externalLinkProps(item.url)}>{item.title}</a>{lead ? <p>{lead}</p> : null}</li> })}</ol> : null}</section> })}</div><footer><Link to="/resources/curate">Chantier · proposer un repère →</Link></footer></article>
}
