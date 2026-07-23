import { Link } from 'react-router-dom'
import '../../WorldInternalFlows.css'

export default function PlanChantierMobile({
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
    <article className="plan-chantier plan-chantier-mobile">
      <header>
        <p>Outil public · Atlas</p>
        <h1>Chantier</h1>
        <Link to="/resources">Retour à l’Atlas →</Link>
      </header>

      {done ? (
        <section className="chantier-state" aria-live="polite">
          <small>Déposé · 已提交</small>
          <h2>{done.title}</h2>
          <button type="button" onClick={onAgain}>Nouveau repère</button>
          <Link to="/resources">Retour à l’Atlas</Link>
        </section>
      ) : !user ? (
        <section className="chantier-state">
          <small>Accès requis</small>
          <h2>登录后可添加坐标。</h2>
          <Link to="/login">Connexion →</Link>
        </section>
      ) : (
        <form className="chantier-sheet" onSubmit={onSubmit}>
          <label><span>01 · Zone</span><select value={form.category} onChange={onField('category')}>{shelves.map((shelf) => <option key={shelf.value} value={shelf.value}>{shelf.label}</option>)}</select></label>
          <label><span>02 · Titre</span><input type="text" value={form.title} onChange={onField('title')} placeholder="Titre" required /></label>
          <label><span>03 · Lien</span><input type="url" value={form.url} onChange={onField('url')} placeholder="https://…" required /></label>
          <label><span>04 · Note</span><textarea rows="4" value={form.description} onChange={onField('description')} placeholder="为什么值得留下。" /></label>
          <footer>
            <button type="submit" disabled={submitting}>{submitting ? 'Dépôt…' : 'Déposer'}</button>
            {error ? <p role="alert">{error}</p> : null}
          </footer>
        </form>
      )}
    </article>
  )
}
