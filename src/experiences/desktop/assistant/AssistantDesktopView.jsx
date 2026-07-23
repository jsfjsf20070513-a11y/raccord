import { Link, useLocation } from 'react-router-dom'
import '../../AssistantExperience.css'
import '../../WorldRefinement.css'

const MODES = [['guider', 'Guider'], ['expliquer', 'Expliquer'], ['verifier', 'Vérifier']]

function Turn({ message, renderRich }) {
  return <article className={`diagnostic-turn is-${message.role === 'user' ? 'user' : 'assistant'}`}><p>{message.role === 'user' ? 'Question' : 'Diagnostic'}</p>{message.image ? <img src={message.image} alt="题图" /> : null}{message.role === 'user' ? <div>{message.content}</div> : <div dangerouslySetInnerHTML={{ __html: renderRich(message.content) }} />}</article>
}

export default function AssistantDesktopView(props) {
  const location = useLocation()
  const returnPath = `${location.pathname}${location.search}`
  const { user, messages, starters, mode, setMode, input, setInput, loading, error, image, setImage, send, stop, clear, pickImage, fileRef, inputRef, renderRich } = props
  if (!user) return <section className="assistant-diagnostic assistant-desktop" aria-labelledby="assistant-title"><header><p>Outil contextuel</p><h1 id="assistant-title">Assistant</h1></header><section className="diagnostic-gate"><p>Connexion requise.</p><Link to="/login" state={{ from: returnPath }}>Se connecter →</Link></section></section>
  return (
    <section className={`assistant-diagnostic assistant-desktop${messages.length ? ' has-thread' : ''}`} aria-labelledby="assistant-title">
      <header className="diagnostic-masthead"><div><p>Outil contextuel · diagnostic</p><h1 id="assistant-title">Assistant</h1></div><nav aria-label="Mode de travail">{MODES.map(([id, label]) => <button key={id} type="button" aria-pressed={mode === id} className={mode === id ? 'is-active' : ''} onClick={() => setMode(id)}>{label}</button>)}</nav></header>
      <section className="diagnostic-workspace">
        <div className="diagnostic-thread" aria-live="polite">
          {!messages.length ? <div className="diagnostic-starters"><p>Choisir un point de départ</p>{starters.map((starter, index) => <button key={starter} type="button" onClick={() => send(starter)}><small>0{index + 1}</small>{starter}</button>)}</div> : messages.map((message, index) => <Turn key={index} message={message} renderRich={renderRich} />)}
          {loading ? <p className="diagnostic-status">Analyse en cours…</p> : null}
        </div>
        <aside className={`diagnostic-object${image ? '' : ' is-empty'}`}><p>Objet actif</p>{image ? <><img src={image.preview} alt="待分析题图" /><button type="button" onClick={() => setImage(null)}>Retirer</button></> : <span>Aucun objet sélectionné.</span>}</aside>
      </section>
      {error ? <p className="diagnostic-error">{error}</p> : null}
      <form className="diagnostic-composer" onSubmit={(event) => { event.preventDefault(); send(input) }}>
        <input ref={fileRef} type="file" accept="image/*" onChange={pickImage} hidden />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={loading}>Image</button>
        <textarea ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} placeholder="Une question de maths ou de français…" rows={2} disabled={loading} />
        {loading ? <button type="button" onClick={stop}>Arrêter</button> : <button type="submit" disabled={!input.trim() && !image}>Envoyer</button>}
      </form>
      {messages.length ? <button type="button" className="diagnostic-clear" onClick={clear}>Effacer l’historique</button> : null}
    </section>
  )
}
