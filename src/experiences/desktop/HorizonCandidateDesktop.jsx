import FoucaultSandField from '../../components/material/FoucaultSandField'
import './HorizonCandidateDesktop.css'

export default function HorizonCandidateDesktop({ chapter }) {
  return (
    <main className="horizon-candidate horizon-candidate--desktop">
      <FoucaultSandField
        variant="desktop"
        released={chapter.released}
        releaseDirectionDeg={chapter.state.releaseDirectionDeg}
        draftDirectionDeg={chapter.draftDirectionDeg}
        elapsedMs={chapter.elapsedMs}
        onDraftDirectionChange={chapter.setDraftDirectionDeg}
        onRelease={chapter.release}
      />
      <h1 className="horizon-candidate__title" aria-label="L’horizon immobile">
        <span>L’horizon</span>
        <span>immobile</span>
      </h1>
      <span
        className="horizon-candidate__folio"
        aria-label="Chapitre II"
      >
        II
      </span>
    </main>
  )
}
