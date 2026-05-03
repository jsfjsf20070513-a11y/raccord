import {
  ArrowUpRight,
  CheckCircle2,
  CircleDashed,
  Clock3,
  ExternalLink,
  Github,
  PlayCircle,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  aiWorkflow,
  keyFeatures,
  problemPoints,
  roadmap,
  roleItems,
  showcaseLinks,
  showcaseStats,
  solutionSteps,
  techStack,
} from '../data/hackathonShowcase'

const statusIcon = {
  Completed: CheckCircle2,
  'In progress': Clock3,
  Planned: CircleDashed,
}

function ShowcaseSection({ id, kicker, title, children }) {
  return (
    <section className="hackathon-section" id={id}>
      <p className="hackathon-kicker">{kicker}</p>
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function PlaceholderButton({ icon: Icon, children }) {
  return (
    <span className="hackathon-button is-disabled" aria-disabled="true">
      <Icon size={17} aria-hidden="true" />
      {children}
    </span>
  )
}

export default function HackathonShowcase() {
  return (
    <article className="hackathon-page">
      <header className="hackathon-hero">
        <div className="hackathon-hero-copy">
          <p className="hackathon-eyebrow">Hackathon showcase · AI assisted builder portfolio</p>
          <h1>Math Class Website</h1>
          <p className="hackathon-hero-summary">
            A deployed class knowledge hub for a bilingual mathematics cohort, built as a real student product
            and packaged for hackathon review.
          </p>
          <p className="hackathon-hero-context">
            Use case: class schedule, event archive, learning resources, collaboration drafts, and a concise
            proof of AI native product-building ability.
          </p>
          <div className="hackathon-actions" aria-label="Project links">
            <Link className="hackathon-button is-primary" to={showcaseLinks.liveDemo}>
              <ArrowUpRight size={17} aria-hidden="true" />
              Live Demo
            </Link>
            <PlaceholderButton icon={Github}>GitHub pending</PlaceholderButton>
            <PlaceholderButton icon={PlayCircle}>Demo video pending</PlaceholderButton>
          </div>
          <p className="hackathon-ai-badge">
            <Sparkles size={15} aria-hidden="true" />
            Built with AI assisted development, verified and shaped by a student builder.
          </p>
        </div>

        <aside className="hackathon-hero-panel" aria-label="Project snapshot">
          {showcaseStats.map((item) => (
            <div key={item.label} className="hackathon-stat">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </aside>
      </header>

      <ShowcaseSection id="problem" kicker="01 · Problem" title="What problem does it solve?">
        <div className="hackathon-grid">
          {problemPoints.map((point) => (
            <article key={point.title} className="hackathon-card">
              <h3>{point.title}</h3>
              <p>{point.body}</p>
            </article>
          ))}
        </div>
      </ShowcaseSection>

      <ShowcaseSection id="solution" kicker="02 · Solution" title="A lightweight product for class memory and resources">
        <div className="hackathon-flow">
          {solutionSteps.map((step, index) => (
            <div key={step} className="hackathon-flow-step">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </ShowcaseSection>

      <ShowcaseSection id="features" kicker="03 · Key Features" title="Core functions and current status">
        <div className="hackathon-feature-grid">
          {keyFeatures.map((feature) => {
            const StatusIcon = statusIcon[feature.status] || CircleDashed

            return (
              <article key={feature.title} className="hackathon-card feature-card">
                <div className="feature-card-head">
                  <h3>{feature.title}</h3>
                  <span className="feature-status">
                    <StatusIcon size={15} aria-hidden="true" />
                    {feature.status}
                  </span>
                </div>
                <p>{feature.benefit}</p>
              </article>
            )
          })}
        </div>
      </ShowcaseSection>

      <ShowcaseSection id="tech-stack" kicker="04 · Tech Stack" title="Technology used in the current project">
        <p className="hackathon-section-lead">
          This stack summary is generated from the current dependencies, Vite setup, Supabase integration, and
          deployment scripts in the repository.
        </p>
        <div className="tech-stack-list">
          {techStack.map((item) => (
            <article key={item.category} className="tech-stack-row">
              <h3>{item.category}</h3>
              <div>
                <strong>{item.value}</strong>
                <p>{item.note}</p>
              </div>
            </article>
          ))}
        </div>
      </ShowcaseSection>

      <ShowcaseSection id="my-role" kicker="05 · My Role" title="Freshman math student, AI native builder">
        <div className="hackathon-two-column">
          <p>
            I am a first-year Mathematics student at Renmin University of China, Sino-French Institute in
            Suzhou. In this project, my role is not to claim senior engineering experience, but to show that I
            can define a real student problem, use AI tools responsibly, test the output, and ship a working
            prototype.
          </p>
          <ul className="hackathon-check-list">
            {roleItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </ShowcaseSection>

      <ShowcaseSection id="ai-workflow" kicker="06 · AI assisted Development Workflow" title="How AI helped, and what I owned">
        <p className="hackathon-section-lead">
          AI acted as a development accelerator. I remained responsible for problem definition, product judgment,
          final verification, and deciding what should be accepted into the project.
        </p>
        <div className="hackathon-grid">
          {aiWorkflow.map((item) => (
            <article key={item.tool} className="hackathon-card">
              <h3>{item.tool}</h3>
              <p>{item.use}</p>
            </article>
          ))}
        </div>
      </ShowcaseSection>

      <ShowcaseSection id="demo-links" kicker="07 · Demo Links" title="Review-ready entry points">
        <div className="demo-link-list">
          <Link className="demo-link-row" to="/">
            <span>Live class website</span>
            <strong>Open deployed product</strong>
          </Link>
          <span className="demo-link-row is-placeholder">
            <span>GitHub repository</span>
            <strong>{showcaseLinks.github}</strong>
          </span>
          <span className="demo-link-row is-placeholder">
            <span>Demo video</span>
            <strong>{showcaseLinks.demoVideo}</strong>
          </span>
        </div>
      </ShowcaseSection>

      <ShowcaseSection id="roadmap" kicker="08 · Roadmap" title="What happens next">
        <div className="hackathon-grid">
          {roadmap.map((group) => (
            <article key={group.phase} className="hackathon-card">
              <h3>{group.phase}</h3>
              <ul className="hackathon-plain-list">
                {group.tasks.map((task) => (
                  <li key={task}>{task}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </ShowcaseSection>

      <ShowcaseSection id="contact" kicker="09 · Contact" title="For hackathon registration">
        <div className="contact-panel">
          <dl>
            <div>
              <dt>Name</dt>
              <dd>Your name / English name</dd>
            </div>
            <div>
              <dt>School</dt>
              <dd>Renmin University of China, Sino-French Institute, Suzhou</dd>
            </div>
            <div>
              <dt>Major</dt>
              <dd>Mathematics and Applied Mathematics, freshman year</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>TODO: Add contact email</dd>
            </div>
            <div>
              <dt>GitHub</dt>
              <dd>https://github.com/jsfjsf20070513-a11y/MathClassWebsite-public</dd>
            </div>
            <div>
              <dt>Project link</dt>
              <dd>
                <a href={showcaseLinks.projectUrl}>{showcaseLinks.projectUrl}</a>
              </dd>
            </div>
          </dl>
          <p className="contact-sentence">
            One-line submission: A deployed class knowledge hub showing how a freshman mathematics student uses
            AI assisted development to turn a real campus workflow into a working web product.
          </p>
          <a className="hackathon-button is-primary" href={showcaseLinks.projectUrl}>
            <ExternalLink size={17} aria-hidden="true" />
            Public showcase URL
          </a>
        </div>
      </ShowcaseSection>
    </article>
  )
}
