import {
  ArrowUpRight,
  Github,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  contributionRecords,
  contributionSummary,
  stretchGoals,
  walletIdentity,
  web3ProfileLinks,
} from '../data/web3ProfileContent'

function ProfileSection({ id, kicker, title, children }) {
  return (
    <section className="hackathon-section" id={id}>
      <p className="hackathon-kicker">{kicker}</p>
      <h2>{title}</h2>
      {children}
    </section>
  )
}

export default function Web3StudentProfile() {
  return (
    <article className="hackathon-page">
      <header className="hackathon-hero">
        <div className="hackathon-hero-copy">
          <p className="hackathon-eyebrow">Dev3pack solo MVP · wallet-ready demo mode</p>
          <h1>Web3 Student Profile</h1>
          <p className="hackathon-hero-summary">
            A Solana-ready identity layer for student collaboration, contribution records, and AI-assisted
            project summaries.
          </p>
          <p className="hackathon-hero-context">
            This page extends the existing class collaboration website toward the Dev3pack Solana track without
            adding smart contracts, mainnet transactions, or new Supabase schema in this first MVP stage.
          </p>
          <div className="hackathon-actions" aria-label="Web3 profile links">
            <Link className="hackathon-button is-primary" to={web3ProfileLinks.hackathon}>
              <ArrowUpRight size={17} aria-hidden="true" />
              Back to Hackathon Showcase
            </Link>
            <a className="hackathon-button" href={web3ProfileLinks.github} target="_blank" rel="noreferrer">
              <Github size={17} aria-hidden="true" />
              View GitHub Repository
            </a>
            <a className="hackathon-button" href={web3ProfileLinks.demoVideo} target="_blank" rel="noreferrer">
              <PlayCircle size={17} aria-hidden="true" />
              View Demo Video
            </a>
          </div>
          <p className="hackathon-ai-badge">
            <Sparkles size={15} aria-hidden="true" />
            Currently demo mode / wallet-ready MVP. No real wallet transaction is performed in this stage.
          </p>
        </div>

        <aside className="hackathon-hero-panel" aria-label="Web3 profile snapshot">
          <div className="hackathon-stat">
            <span>Track fit</span>
            <strong>Solana + AI</strong>
          </div>
          <div className="hackathon-stat">
            <span>Implementation stage</span>
            <strong>Demo mode</strong>
          </div>
          <div className="hackathon-stat">
            <span>On-chain status</span>
            <strong>Not used yet</strong>
          </div>
        </aside>
      </header>

      <ProfileSection id="wallet-identity" kicker="01 · Wallet Identity" title="Solana-ready student identity">
        <article className="hackathon-card">
          <div className="feature-card-head">
            <h3>Wallet Identity Card</h3>
            <span className="feature-status">
              <Wallet size={15} aria-hidden="true" />
              {walletIdentity.status}
            </span>
          </div>
          <div className="contact-panel">
            <dl>
              <div>
                <dt>Wallet status</dt>
                <dd>{walletIdentity.status}</dd>
              </div>
              <div>
                <dt>Network</dt>
                <dd>{walletIdentity.network}</dd>
              </div>
              <div>
                <dt>Wallet address</dt>
                <dd>{walletIdentity.address}</dd>
              </div>
              <div>
                <dt>Next step</dt>
                <dd>{walletIdentity.nextStep}</dd>
              </div>
            </dl>
          </div>
          <p className="hackathon-ai-badge">
            <ShieldCheck size={15} aria-hidden="true" />
            {walletIdentity.safety}
          </p>
        </article>
      </ProfileSection>

      <ProfileSection id="contributions" kicker="02 · Contribution Records" title="Demo records from the current project">
        <p className="hackathon-section-lead">
          These records are static demo data for the first Web3 Student Profile MVP. They are not presented as
          on-chain records.
        </p>
        <div className="hackathon-grid">
          {contributionRecords.map((record) => (
            <article key={record.title} className="hackathon-card">
              <h3>{record.title}</h3>
              <p>{record.detail}</p>
            </article>
          ))}
        </div>
      </ProfileSection>

      <ProfileSection id="ai-summary" kicker="03 · AI-assisted Contribution Summary" title="A summary designed for review">
        <article className="hackathon-card">
          <h3>Summary Draft</h3>
          <p>{contributionSummary}</p>
          <p className="hackathon-section-lead">
            AI-style summary draft for demo. No external AI API key is used in this MVP stage.
          </p>
        </article>
      </ProfileSection>

      <ProfileSection id="stretch-goals" kicker="04 · Stretch Goal" title="Next steps for a real Solana integration">
        <div className="hackathon-grid">
          {stretchGoals.map((goal) => (
            <article key={goal} className="hackathon-card">
              <h3>{goal}</h3>
              <p>
                Planned for a later phase after the demo-mode profile is stable and the original class website
                remains safe.
              </p>
            </article>
          ))}
        </div>
      </ProfileSection>
    </article>
  )
}
