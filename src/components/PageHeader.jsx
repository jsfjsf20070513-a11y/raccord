import { Link } from 'react-router-dom'

export default function PageHeader({
  kicker,
  title,
  summary,
  backTo = '/',
  backLabel = 'Back to title page · 返回扉页',
  meta = [],
  note = '',
  showRule = true,
  children,
}) {
  return (
    <header className="page-header">
      <p className="page-header-back">
        <Link to={backTo}>{backLabel}</Link>
      </p>
      {kicker ? <p className="page-header-kicker">{kicker}</p> : null}
      <h1>{title}</h1>
      {summary ? <p className="page-header-summary">{summary}</p> : null}
      {note ? <p className="page-header-note">{note}</p> : null}
      {meta.length ? (
        <p className="page-header-meta">
          {meta.map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </p>
      ) : null}
      {showRule ? (
        <p className="page-header-rule" aria-hidden="true">
          ─────
        </p>
      ) : null}
      {children}
    </header>
  )
}
