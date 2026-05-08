import {
  Anchor,
  ArrowUpRight,
  Copy,
  ExternalLink,
  Github,
  PlayCircle,
  ShieldCheck,
  Signature,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  contributionRecords,
  contributionSummary,
  messageStatement,
  onchainAnchor,
  stretchGoals,
  walletIdentity,
  web3ProfileLinks,
} from '../data/web3ProfileContent'
import {
  MEMO_PROGRAM_ID,
  buildMemoPayload,
  buildSolscanUrl,
  createDevnetConnection,
  fetchLamportBalance,
  formatSol,
  MIN_LAMPORTS_FOR_MEMO,
  submitMemoViaWallet,
} from '../lib/solanaMemo'

const MEMO_PROGRAM_ID_STRING = MEMO_PROGRAM_ID.toBase58()

const PHANTOM_DOWNLOAD_URL = 'https://phantom.app/download'

// Base58 encoder for Solana signatures. Kept inline (no dependency) to avoid
// pulling @solana/web3.js / bs58 which previously triggered high-severity npm
// audit warnings for this public-safe repository.
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

function base58Encode(input) {
  if (!input) {
    return ''
  }

  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input)
  if (bytes.length === 0) {
    return ''
  }

  let leadingZeros = 0
  for (const byte of bytes) {
    if (byte === 0) {
      leadingZeros += 1
    } else {
      break
    }
  }

  const digits = [0]
  for (let byteIndex = 0; byteIndex < bytes.length; byteIndex += 1) {
    let carry = bytes[byteIndex]
    for (let digitIndex = 0; digitIndex < digits.length; digitIndex += 1) {
      carry += digits[digitIndex] << 8
      digits[digitIndex] = carry % 58
      carry = (carry / 58) | 0
    }
    while (carry > 0) {
      digits.push(carry % 58)
      carry = (carry / 58) | 0
    }
  }

  let encoded = ''
  for (let i = 0; i < leadingZeros; i += 1) {
    encoded += BASE58_ALPHABET[0]
  }
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    encoded += BASE58_ALPHABET[digits[i]]
  }
  return encoded
}

function buildIssuedTimestamp() {
  return new Date().toISOString().replace(/\.\d+Z$/, 'Z')
}

async function copyToClipboardSafe(text) {
  if (!text) {
    return false
  }

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fall through to legacy path
  }

  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    return true
  } catch {
    return false
  }
}

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

  const [signingState, setSigningState] = useState('idle')
  const [signedStatement, setSignedStatement] = useState('')
  const [signatureBase58, setSignatureBase58] = useState('')
  const [signatureIssuedAt, setSignatureIssuedAt] = useState('')
  const [signatureError, setSignatureError] = useState('')
  const [copyStatus, setCopyStatus] = useState('')

  const [memoState, setMemoState] = useState('idle')
  const [memoSignature, setMemoSignature] = useState('')
  const [memoError, setMemoError] = useState('')
  const [memoPayloadShown, setMemoPayloadShown] = useState('')
  const [balanceLamports, setBalanceLamports] = useState(null)
  const [isCheckingBalance, setIsCheckingBalance] = useState(false)

  const providerName = useMemo(() => resolveProviderName(provider), [provider])
  const shortAddress = useMemo(() => formatAddress(walletAddress), [walletAddress])
  const isConnected = Boolean(walletAddress)
  const hasSignature = signingState === 'signed' && Boolean(signatureBase58)

  const signingStatusLabel = !isConnected
    ? 'Connect wallet first'
    : signingState === 'signing'
      ? 'Signing in progress'
      : signingState === 'signed'
        ? 'Signature verified locally'
        : signingState === 'error'
          ? 'Signing failed'
          : 'Ready to sign'

  const signingButtonLabel =
    signingState === 'signing'
      ? 'Signing…'
      : signingState === 'signed'
        ? 'Sign again'
        : signingState === 'error'
          ? 'Try again'
          : 'Sign with wallet'

  const hasMemoSignature = memoState === 'confirmed' && Boolean(memoSignature)
  const isMemoBusy = memoState === 'checking' || memoState === 'signing' || memoState === 'sending'
  const memoStatusLabel = !isConnected
    ? 'Connect wallet first'
    : memoState === 'checking'
      ? 'Checking devnet balance'
      : memoState === 'needs_airdrop'
        ? 'Devnet SOL needed'
        : memoState === 'signing'
          ? 'Awaiting wallet signature'
          : memoState === 'sending'
            ? 'Submitting to devnet'
            : memoState === 'confirmed'
              ? 'Confirmed on devnet'
              : memoState === 'error'
                ? 'Transaction failed'
                : 'Ready to anchor'

  const memoButtonLabel = isMemoBusy
    ? 'Anchoring…'
    : memoState === 'confirmed'
      ? 'Anchor again'
      : memoState === 'error' || memoState === 'needs_airdrop'
        ? 'Retry anchor'
        : 'Anchor on Devnet'

  const balanceLabel = !walletAddress
    ? 'Connect a wallet to view balance'
    : isCheckingBalance && balanceLamports === null
      ? 'Checking…'
      : balanceLamports === null
        ? 'Unavailable (RPC rate limit possible)'
        : formatSol(balanceLamports)

  const solscanUrl = useMemo(() => buildSolscanUrl(memoSignature, 'devnet'), [memoSignature])
  const needsAirdrop = memoState === 'needs_airdrop' ||
    (balanceLamports !== null && balanceLamports < MIN_LAMPORTS_FOR_MEMO)

  const resetSignature = useCallback(() => {
    setSigningState('idle')
    setSignedStatement('')
    setSignatureBase58('')
    setSignatureIssuedAt('')
    setSignatureError('')
    setCopyStatus('')
  }, [])

  const resetMemo = useCallback(() => {
    setMemoState('idle')
    setMemoSignature('')
    setMemoError('')
    setMemoPayloadShown('')
    setBalanceLamports(null)
    setIsCheckingBalance(false)
  }, [])

  const refreshWalletState = useCallback(() => {
    const nextProvider = getInjectedSolanaProvider()
    setProvider(nextProvider)

    if (!nextProvider) {
      setWalletStatus('Wallet not detected')
      setWalletAddress('')
      resetSignature()
      resetMemo()
      return
    }

    const nextAddress = getAddressFromProvider(nextProvider)
    setWalletAddress(nextProvider.isConnected && nextAddress ? nextAddress : '')
    setWalletStatus(nextProvider.isConnected && nextAddress ? 'Connected' : 'Ready to connect')
  }, [resetSignature, resetMemo])

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
      resetSignature()
      resetMemo()
    }

    const handleAccountChanged = (publicKey) => {
      resetSignature()
      resetMemo()
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
  }, [refreshWalletState, resetSignature, resetMemo])

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
        resetSignature()
        resetMemo()
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

  const handleSignStatement = async () => {
    const currentProvider = getInjectedSolanaProvider()
    if (!currentProvider) {
      setSignatureError('Connect a Solana-compatible wallet first to sign the statement.')
      return
    }
    if (!walletAddress) {
      setSignatureError('Connect a wallet before signing.')
      return
    }
    if (typeof currentProvider.signMessage !== 'function') {
      setSignatureError('Connected wallet does not expose signMessage. Try Phantom or a compatible wallet.')
      return
    }

    setSignatureError('')
    setCopyStatus('')
    setSigningState('signing')

    try {
      const issuedAt = buildIssuedTimestamp()
      const statement = messageStatement.buildStatement({
        address: walletAddress,
        issuedAt,
      })
      const encoded = new TextEncoder().encode(statement)
      const result = await currentProvider.signMessage(encoded, 'utf8')
      const signatureBytes = result?.signature
        ? result.signature
        : result instanceof Uint8Array
          ? result
          : null

      if (!signatureBytes || !(signatureBytes instanceof Uint8Array) || signatureBytes.length === 0) {
        throw new Error('Wallet returned an empty signature.')
      }

      setSignedStatement(statement)
      setSignatureBase58(base58Encode(signatureBytes))
      setSignatureIssuedAt(issuedAt)
      setSigningState('signed')
    } catch (error) {
      setSignatureError(error?.message || 'Signing was cancelled or failed.')
      setSigningState('error')
    }
  }

  const handleCopySignature = async () => {
    if (!signatureBase58) {
      return
    }
    const ok = await copyToClipboardSafe(signatureBase58)
    setCopyStatus(ok ? 'Signature copied to clipboard.' : 'Copy failed — please select and copy manually.')
  }

  const refreshBalance = useCallback(async () => {
    if (!walletAddress) {
      return
    }
    setIsCheckingBalance(true)
    try {
      const connection = createDevnetConnection()
      const lamports = await fetchLamportBalance(connection, walletAddress)
      setBalanceLamports(lamports)
    } catch {
      // Public devnet RPC can rate-limit. Surface a soft state, not a hard error.
      setBalanceLamports(null)
    } finally {
      setIsCheckingBalance(false)
    }
  }, [walletAddress])

  useEffect(() => {
    if (!walletAddress) {
      setBalanceLamports(null)
      return
    }
    refreshBalance()
  }, [walletAddress, refreshBalance])

  const handleAnchorMemo = async () => {
    const currentProvider = getInjectedSolanaProvider()
    if (!currentProvider) {
      setMemoError('Connect a Solana-compatible wallet first.')
      return
    }
    if (!walletAddress) {
      setMemoError('Connect a wallet before anchoring.')
      return
    }

    setMemoError('')
    setMemoSignature('')
    setMemoState('checking')

    try {
      const connection = createDevnetConnection()
      const lamports = await fetchLamportBalance(connection, walletAddress)
      setBalanceLamports(lamports)

      if (lamports < MIN_LAMPORTS_FOR_MEMO) {
        setMemoState('needs_airdrop')
        setMemoError(onchainAnchor.faucetHelp)
        return
      }

      setMemoState('signing')
      const memoText = buildMemoPayload({ walletAddress })
      setMemoPayloadShown(memoText)

      setMemoState('sending')
      const signature = await submitMemoViaWallet({
        provider: currentProvider,
        connection,
        payerAddress: walletAddress,
        memoText,
      })

      setMemoSignature(signature)
      setMemoState('confirmed')

      // Refresh balance to reflect signature fee burn
      refreshBalance()
    } catch (error) {
      setMemoError(error?.message || 'Memo transaction failed.')
      setMemoState('error')
    }
  }

  return (
    <article className="hackathon-page">
      <header className="hackathon-hero">
        <div className="hackathon-hero-copy">
          <p className="hackathon-eyebrow">Dev3pack solo MVP · wallet identity, ed25519 proof &amp; devnet anchor</p>
          <h1>Web3 Student Profile</h1>
          <p className="hackathon-hero-summary">
            A Solana-ready identity layer for student collaboration: real wallet connection, off-chain
            ownership proof, and an on-chain memo anchor on Solana devnet.
          </p>
          <p className="hackathon-hero-context">
            This page extends the existing class collaboration website toward the Dev3pack Solana track with a
            real browser wallet connection, an optional ed25519 signature, and a real on-chain memo
            transaction on devnet — without smart contracts, mainnet writes, or new Supabase schema.
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
            Real wallet connection, optional off-chain ed25519 signature, and an on-chain memo anchor on
            Solana devnet. No smart contract, no mainnet write, no real money.
          </p>
        </div>

        <aside className="hackathon-hero-panel" aria-label="Web3 profile snapshot">
          <div className="hackathon-stat">
            <span>Track fit</span>
            <strong>Solana + AI</strong>
          </div>
          <div className="hackathon-stat">
            <span>Implementation stage</span>
            <strong>Connect + sign + anchor</strong>
          </div>
          <div className="hackathon-stat">
            <span>On-chain status</span>
            <strong>Devnet memo enabled</strong>
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

      <ProfileSection
        id="identity-proof"
        kicker="02 · Identity Proof"
        title="Cryptographically signed student statement"
      >
        <article className="hackathon-card">
          <div className="feature-card-head">
            <h3>Wallet-Signed Statement</h3>
            <span className="feature-status">
              <Signature size={15} aria-hidden="true" />
              {signingStatusLabel}
            </span>
          </div>
          <p>{messageStatement.prompt}</p>
          <div className="hackathon-actions" aria-label="Signing controls">
            <button
              className="hackathon-button is-primary"
              type="button"
              onClick={handleSignStatement}
              disabled={!isConnected || signingState === 'signing'}
            >
              <Signature size={17} aria-hidden="true" />
              {signingButtonLabel}
            </button>
            {hasSignature ? (
              <button
                className="hackathon-button"
                type="button"
                onClick={handleCopySignature}
              >
                <Copy size={17} aria-hidden="true" />
                Copy signature
              </button>
            ) : null}
          </div>
          {!isConnected ? (
            <p className="hackathon-section-lead">
              Connect a wallet in the section above to enable signing.
            </p>
          ) : null}
          {hasSignature ? (
            <div className="contact-panel">
              <dl>
                <div>
                  <dt>Statement</dt>
                  <dd>
                    <pre className="signed-statement">{signedStatement}</pre>
                  </dd>
                </div>
                <div>
                  <dt>Issued at</dt>
                  <dd>{signatureIssuedAt}</dd>
                </div>
                <div>
                  <dt>Signer public key</dt>
                  <dd className="wallet-address-value">{walletAddress}</dd>
                </div>
                <div>
                  <dt>Signature (base58)</dt>
                  <dd className="wallet-address-value">{signatureBase58}</dd>
                </div>
              </dl>
            </div>
          ) : null}
          {signatureError ? <p className="status-line is-error">{signatureError}</p> : null}
          {copyStatus ? <p className="status-line">{copyStatus}</p> : null}
          <p className="hackathon-ai-badge">
            <ShieldCheck size={15} aria-hidden="true" />
            {messageStatement.safety}
          </p>
        </article>
      </ProfileSection>

      <ProfileSection
        id="onchain-anchor"
        kicker="03 · On-Chain Anchor"
        title="Real Solana devnet transaction"
      >
        <article className="hackathon-card">
          <div className="feature-card-head">
            <h3>SPL Memo program · Solana Devnet</h3>
            <span className="feature-status">
              <Anchor size={15} aria-hidden="true" />
              {memoStatusLabel}
            </span>
          </div>
          <p>{onchainAnchor.prompt}</p>

          <div className="phantom-warning-notice" role="note">
            <strong>About the Phantom &ldquo;Request blocked&rdquo; warning:</strong>{' '}
            {onchainAnchor.phantomWarningNotice}{' '}
            <a href={onchainAnchor.sourceCodeUrl} target="_blank" rel="noreferrer">
              {onchainAnchor.sourceCodeLabel} →
            </a>
          </div>

          <div className="contact-panel">
            <dl>
              <div>
                <dt>Cluster</dt>
                <dd>Solana Devnet</dd>
              </div>
              <div>
                <dt>Wallet balance</dt>
                <dd>{balanceLabel}</dd>
              </div>
              <div>
                <dt>Memo program</dt>
                <dd className="wallet-address-value">{MEMO_PROGRAM_ID_STRING}</dd>
              </div>
              {memoPayloadShown ? (
                <div>
                  <dt>Memo payload</dt>
                  <dd>
                    <pre className="signed-statement">{memoPayloadShown}</pre>
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>

          <div className="hackathon-actions" aria-label="Devnet anchor controls">
            <button
              className="hackathon-button is-primary"
              type="button"
              onClick={handleAnchorMemo}
              disabled={!isConnected || isMemoBusy}
            >
              <Anchor size={17} aria-hidden="true" />
              {memoButtonLabel}
            </button>
            {hasMemoSignature && solscanUrl ? (
              <a
                className="hackathon-button"
                href={solscanUrl}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink size={17} aria-hidden="true" />
                View on Solscan
              </a>
            ) : null}
            {walletAddress ? (
              <button
                className="hackathon-button"
                type="button"
                onClick={refreshBalance}
                disabled={isCheckingBalance}
              >
                <Wallet size={17} aria-hidden="true" />
                {isCheckingBalance ? 'Refreshing…' : 'Refresh balance'}
              </button>
            ) : null}
          </div>

          {!isConnected ? (
            <p className="hackathon-section-lead">
              Connect a wallet in section 01 to enable on-chain anchoring.
            </p>
          ) : null}

          {needsAirdrop ? (
            <p className="hackathon-section-lead">
              {onchainAnchor.faucetHelp}{' '}
              <a href={onchainAnchor.faucetUrl} target="_blank" rel="noreferrer">
                Open faucet.solana.com →
              </a>
            </p>
          ) : null}

          {hasMemoSignature ? (
            <div className="contact-panel">
              <dl>
                <div>
                  <dt>Transaction signature</dt>
                  <dd className="wallet-address-value">{memoSignature}</dd>
                </div>
                <div>
                  <dt>Verify on Solscan</dt>
                  <dd>
                    <a href={solscanUrl} target="_blank" rel="noreferrer">
                      {solscanUrl}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}

          {memoError && memoState !== 'needs_airdrop' ? (
            <p className="status-line is-error">{memoError}</p>
          ) : null}

          <p className="hackathon-ai-badge">
            <ShieldCheck size={15} aria-hidden="true" />
            {onchainAnchor.safety}
          </p>
        </article>
      </ProfileSection>

      <ProfileSection id="contributions" kicker="04 · Contribution Records" title="Demo records from the current project">
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

      <ProfileSection id="ai-summary" kicker="05 · AI-assisted Contribution Summary" title="A summary designed for review">
        <article className="hackathon-card">
          <h3>Summary Draft</h3>
          <p>{contributionSummary}</p>
          <p className="hackathon-section-lead">
            AI-style summary draft for demo. No external AI API key is used in this MVP stage.
          </p>
        </article>
      </ProfileSection>

      <ProfileSection id="stretch-goals" kicker="06 · Stretch Goal" title="Next steps for a real Solana integration">
        <div className="hackathon-grid">
          {stretchGoals.map((goal) => (
            <article key={goal} className="hackathon-card">
              <h3>{goal}</h3>
              <p>
                Planned for a later phase after wallet connection and signing remain stable and the original class
                website remains safe.
              </p>
            </article>
          ))}
        </div>
      </ProfileSection>
    </article>
  )
}
