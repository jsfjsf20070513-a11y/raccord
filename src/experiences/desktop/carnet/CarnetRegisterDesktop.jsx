import { externalLinkProps } from '../../../lib/safeUrl'
import '../../WorldInternalFlows.css'
import '../../WorldRefinement.css'

export default function CarnetRegisterDesktop({ traces, contributions, loading, status }) {
  return (
    <article className="carnet-register carnet-register-desktop is-readonly">
      <header>
        <p>Le Carnet · Annexe</p>
        <h1>Provenance</h1>
        <span>来源明确，身份分开</span>
      </header>

      <div className="register-desktop-spread">
        <section className="register-ledger" aria-label="可核验技术记录">
          <p className="register-section-label">Trace vérifiée · 技术记录</p>
          <ol>
            {traces.map((entry, index) => (
              <li key={entry.id}>
                <small>N°{String(index + 1).padStart(2, '0')}</small>
                <blockquote>{entry.content}</blockquote>
                <p>— {entry.signature} · {entry.date}</p>
                <i>Solana devnet · provenance vérifiée</i>
                <p className="register-source-links"><a {...externalLinkProps(entry.provenance.accountUrl)}>Account</a><a {...externalLinkProps(entry.provenance.transactionUrl)}>Transaction</a></p>
              </li>
            ))}
          </ol>
        </section>
        <section className="register-ledger register-contributions" aria-label="已接收但未核验的提交记录">
          <p className="register-section-label">Contributions reçues · 未作史实核验</p>
          {loading ? <p className="register-loading">Ouverture des archives…</p> : null}
          {status ? <p className="register-status" aria-live="polite">{status}</p> : null}
          {!loading && !contributions.length ? <p className="register-empty">Aucune contribution publique.</p> : null}
          <ol>{contributions.map((entry, index) => <li key={entry.id}><small>N°{String(index + 1).padStart(2, '0')}</small><blockquote>{entry.content}</blockquote><p>— {entry.signature} · {entry.date}</p><i>soumission reçue · non vérifiée</i></li>)}</ol>
        </section>
      </div>
    </article>
  )
}
