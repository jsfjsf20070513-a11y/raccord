import { Link } from 'react-router-dom'
import '../../WorldInternalFlows.css'

export default function PlanChantierDesktop({
  user,
  form,
  shelves,
  onField,
  onSubmit,
  submitting,
  error,
  done,
  onAgain,
}) {
  return (
    <article className="plan-chantier plan-chantier-desktop">
      <header>
        <div>
          <p>Outil public · Atlas</p>
          <h1>Chantier</h1>
        </div>
        <Link to="/resources">Retour à l’Atlas →</Link>
      </header>

      {done ? (
        <section className="chantier-state" aria-live="polite">
          <small>Déposé · 已提交</small>
          <h2>{done.title}</h2>
          <div>
            <button type="button" onClick={onAgain}>Nouveau repère</button>
            <Link to="/resources">Retour à l’Atlas</Link>
          </div>
        </section>
      ) : !user ? (
        <section className="chantier-state">
          <small>Accès requis</small>
          <h2>Connectez-vous pour contribuer.</h2>
          <Link to="/login">Connexion →</Link>
        </section>
      ) : (
        <form className="chantier-sheet" onSubmit={onSubmit}>
          <div className="chantier-sheet-index" aria-hidden="true">
            <span>01</span><span>02</span><span>03</span><span>04</span>
          </div>
          <label>
            <span>Zone · 书架</span>
            <select value={form.category} onChange={onField('category')}>
              {shelves.map((shelf) => <option key={shelf.value} value={shelf.value}>{shelf.label}</option>)}
            </select>
          </label>
          <label>
            <span>Titre · 标题</span>
            <input type="text" value={form.title} onChange={onField('title')} placeholder="MIT OCW — Linear Algebra" required />
          </label>
          <label>
            <span>Lien · 链接</span>
            <input type="url" value={form.url} onChange={onField('url')} placeholder="https://…" required />
          </label>
          <label>
            <span>Note · 推荐理由</span>
            <textarea rows="3" value={form.description} onChange={onField('description')} placeholder="适合谁，为什么值得留下。" />
          </label>
          <footer>
            <button type="submit" disabled={submitting}>{submitting ? 'Dépôt…' : 'Déposer · 提交'}</button>
            <Link to="/resources">Annuler</Link>
            {error ? <p role="alert">{error}</p> : null}
          </footer>
        </form>
      )}
    </article>
  )
}
