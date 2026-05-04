import {
  ArrowUpRight,
  Github,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  contributionRecords,
  contributionSummary,
  stretchGoals,
  walletIdentity,
  web3ProfileLinks,
} from '../data/web3ProfileContent'

const PHANTOM_DOWNLOAD_URL = 'https://phantom.app/download'

function getInjectedSolanaProvider() {
  if (typeof window === 'undefined') {
    return null
  }

  const provider = window.phantom?.solana || window.solana
  return typeof provider?.connect === 'function' ? provider : null
}

function formatAddress(publicKey = '') {
  if (!publicKey) {
    return ''
  }

  if (publicKey.length <= 14) {
    return publicKey
  }

  return `${publicKey.slice(0, 6)}...${publicKey.slice(-6)}`
}

function getAddressFromProvider(provider, response) {
  const publicKey = response?.publicKey || provider?.publicKey
  return publicKey?.toBase58 ? publicKey.toBase58() : `${publicKey || ''}`
}

function resolveProviderName(provider) {
  if (!provider) {
    return 'No wallet detected'
  }

  if (provider.isPhantom) {
    return 'Phantom'
  }

  return 'Injected Solana wallet'
}

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
  const [provider, setProvider] = useState(null)
  const [walletStatus, setWalletStatus] = useState('Checking wallet')
  const [walletAddress, setWalletAddress] = useState('')
  const [walletError, setWalletError] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)

  const providerName = useMemo(() => resolveProviderName(provider), [provider])
  const shortAddress = useMemo(() => formatAddress(walletAddress), [walletAddress])
  const isConnected = Boolean(walletAddress)

  const refreshWalletState = useCallback(() => {
    const nextProvider = getInjectedSolanaProvider()
    setProvider(nextProvider)

    if (!nextProvider) {
      setWalletStatus('Wallet not detected')
      setWalletAddress('')
      return
    }

    const nextAddress = getAddressFromProvider(nextProvider)
    setWalletAddress(nextProvider.isConnected && nextAddress ? nextAddress : '')
    setWalletStatus(nextProvider.isConnected && nextAddress ? 'Connected' : 'Ready to connect')
  }, [])

  useEffect(() => {
    refreshWalletState()

    const currentProvider = getInjectedSolanaProvider()
    if (!currentProvider?.on) {
      return undefined
    }

    const handleConnect = (publicKey) => {
      setWalletError('')
      setWalletAddress(getAddressFromProvider(currentProvider, { publicKey }))
      setWalletStatus('Connected')
    }

    const handleDisconnect = () => {
      setWalletAddress('')
      setWalletStatus('Ready to connect')
    }

    const handleAccountChanged = (publicKey) => {
      if (publicKey) {
        setWalletError('')
        setWalletAddress(publicKey.toBase58 ? publicKey.toBase58() : `${publicKey}`)
        setWalletStatus('Connected')
        return
      }

      setWalletAddress('')
      setWalletStatus('Ready to connect')
    }

    currentProvider.on('connect', handleConnect)
    currentProvider.on('disconnect', handleDisconnect)
    currentProvider.on('accountChanged', handleAccountChanged)

    return () => {
      currentProvider.off?.('connect', handleConnect)
      currentProvider.off?.('disconnect', handleDisconnect)
      currentProvider.off?.('accountChanged', handleAccountChanged)
    }
  }, [refreshWalletState])

  const handleWalletAction = async () => {
    const currentProvider = getInjectedSolanaProvider()
    setProvider(currentProvider)
    setWalletError('')

    if (!currentProvider) {
      setWalletStatus('Wallet not detected')
      setWalletError('Install Phantom or another injected Solana wallet to connect a public wallet address.')
      return
    }

    try {
      setIsConnecting(true)

      if (isConnected) {
        await currentProvider.disconnect?.()
        setWalletAddress('')
        setWalletStatus('Ready to connect')
        return
      }

      const response = await currentProvider.connect()
      const nextAddress = getAddressFromProvider(currentProvider, response)
      setWalletAddress(nextAddress)
      setWalletStatus(nextAddress ? 'Connected' : 'Ready to connect')
    } catch (error) {
      setWalletError(error?.message || 'Wallet connection was cancelled or failed.')
      setWalletStatus('Ready to connect')
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <article className="hackathon-page">
      <header className="hackathon-hero">
        <div className="hackathon-hero-copy">
          <p className="hackathon-eyebrow">Dev3pack solo MVP · real wallet connection stage</p>
          <h1>Web3 Student Profile</h1>
          <p className="hackathon-hero-summary">
            A Solana-ready identity layer for student collaboration, contribution records, and AI-assisted
            project summaries.
          </p>
          <p className="hackathon-hero-context">
            This page extends the existing class collaboration website toward the Dev3pack Solana track with a
            real browser wallet connection, without smart contracts, mainnet transactions, or new Supabase schema.
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
            Real wallet connection MVP. No signature request, RPC write, or transaction is performed in this stage.
          </p>
        </div>

        <aside className="hackathon-hero-panel" aria-label="Web3 profile snapshot">
          <div className="hackathon-stat">
            <span>Track fit</span>
            <strong>Solana + AI</strong>
          </div>
          <div className="hackathon-stat">
            <span>Implementation stage</span>
            <strong>Wallet connect</strong>
          </div>
          <div className="hackathon-stat">
            <span>On-chain status</span>
            <strong>No transactions</strong>
          </div>
        </aside>
      </header>

      <ProfileSection id="wallet-identity" kicker="01 · Wallet Identity" title="Solana-ready student identity">
        <article className="hackathon-card">
          <div className="feature-card-head">
            <h3>Wallet Identity Card</h3>
            <span className="feature-status">
              <Wallet size={15} aria-hidden="true" />
              {walletStatus}
            </span>
          </div>
          <div className="hackathon-actions" aria-label="Wallet connection controls">
            <button
              className="hackathon-button is-primary"
              type="button"
              onClick={handleWalletAction}
              disabled={isConnecting}
            >
              <Wallet size={17} aria-hidden="true" />
              {isConnecting ? 'Connecting...' : isConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
            </button>
            {!provider ? (
              <a className="hackathon-button" href={PHANTOM_DOWNLOAD_URL} target="_blank" rel="noreferrer">
                <ArrowUpRight size={17} aria-hidden="true" />
                Install Phantom
              </a>
            ) : null}
          </div>
          <div className="contact-panel">
            <dl>
              <div>
                <dt>Wallet status</dt>
                <dd>{walletStatus}</dd>
              </div>
              <div>
                <dt>Provider</dt>
                <dd>{providerName}</dd>
              </div>
              <div>
                <dt>App network target</dt>
                <dd>{walletIdentity.network}</dd>
              </div>
              <div>
                <dt>Wallet address</dt>
                <dd className="wallet-address-value">
                  {walletAddress ? `${shortAddress} (${walletAddress})` : walletIdentity.address}
                </dd>
              </div>
              <div>
                <dt>Next step</dt>
                <dd>{walletIdentity.nextStep}</dd>
              </div>
            </dl>
          </div>
          {walletError ? (
            <p className="status-line is-error">{walletError}</p>
          ) : null}
          <p className="hackathon-ai-badge">
            <ShieldCheck size={15} aria-hidden="true" />
            {walletIdentity.safety}
          </p>
        </article>
      </ProfileSection>

      <ProfileSection id="contributions" kicker="02 · Contribution Records" title="Demo records from the current project">
        <p className="hackathon-section-lead">
          These records are static demo data for the Web3 Student Profile MVP. They are not presented as on-chain
          records.
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
                Planned for a later phase after wallet connection remains stable and the original class website
                remains safe.
              </p>
            </article>
          ))}
        </div>
      </ProfileSection>
    </article>
  )
}
