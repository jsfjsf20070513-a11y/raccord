import '../../VocabularyExperience.css'
import '../../WorldRefinement.css'

export default function VocabularyDesktopShell({ children, status }) {
  return <section className="vocabulary-instrument vocabulary-desktop" data-vocab-status={status} aria-labelledby="vocabulary-title"><header className="vocabulary-running"><span>Outil d’étude</span><span>SRS · A1—C2</span></header><div className="vocabulary-desktop-stage"><p className="vocabulary-signal">Signal d’apprentissage</p><h1 id="vocabulary-title">Vocabulaire</h1>{children}</div></section>
}
