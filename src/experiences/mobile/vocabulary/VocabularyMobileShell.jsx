import '../../VocabularyExperience.css'
import '../../WorldRefinement.css'

export default function VocabularyMobileShell({ children, status }) {
  return <section className="vocabulary-instrument vocabulary-mobile" data-vocab-status={status} aria-labelledby="vocabulary-title"><header><span>Outil d’étude</span><span>SRS</span></header><div className="vocabulary-mobile-stage"><p>Signal d’apprentissage</p><h1 id="vocabulary-title">Vocabulaire</h1>{children}</div></section>
}
