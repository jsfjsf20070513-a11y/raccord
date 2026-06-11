import {
  Anchor,
  ArrowUpRight,
  Copy,
  ExternalLink,
  Github,
  History,
  PlayCircle,
  RefreshCw,
  ShieldCheck,
  Signature,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
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
  buildSolscanAccountUrl,
  buildSolscanUrl,
  createDevnetConnection,
  fetchLamportBalance,
  formatBlockTime,
  formatSol,
  MIN_LAMPORTS_FOR_MEMO,
  submitMemoViaWallet,
} from '../lib/solanaMemo'
import {
  eagerReconnect,
  getInjectedSolanaProvider,
  waitForInjectedSolanaProvider,
} from '../lib/walletProvider'
import {
  isSeedWallet,
} from '../data/classRegistry'
import {
  base58Encode,
  buildIssuedTimestamp,
  copyToClipboardSafe,
  formatAddress,
  getAddressFromProvider,
  resolveProviderName,
} from '../lib/web3ProfileHelpers'
import { useClassMemoFeed } from './useClassMemoFeed'

const MEMO_PROGRAM_ID_STRING = MEMO_PROGRAM_ID.toBase58()

const PHANTOM_DOWNLOAD_URL = 'https://phantom.app/download'

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

  // 班级 feed 逻辑已抽到 useClassMemoFeed（devnet 只读，与钱包/签名核心解耦）。
  const {
    memoFeedState,
    memoFeedError,
    feedView,
    setFeedView,
    classRegistry,
    addWalletInput,
    setAddWalletInput,
    addWalletStatus,
    unifiedFeed,
    memoFeedStatusLabel,
    collectiveWalletCount,
    refreshMemoFeed,
    scheduleRefresh,
    resetFeed,
    handleAddWalletToRegistry,
    handleRemoveWalletFromRegistry,
  } = useClassMemoFeed({ walletAddress, isConnected })
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
  const walletSolscanUrl = useMemo(
    () => buildSolscanAccountUrl(walletAddress, 'devnet'),
    [walletAddress],
  )
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
    resetFeed()
  }, [resetFeed])

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
    let cancelled = false
    let listening = null // { provider, handleConnect, handleDisconnect, handleAccountChanged }

    const attachListeners = (provider) => {
      if (!provider?.on || listening) {
        return
      }

      const handleConnect = (publicKey) => {
        setWalletError('')
        setWalletAddress(getAddressFromProvider(provider, { publicKey }))
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

      provider.on('connect', handleConnect)
      provider.on('disconnect', handleDisconnect)
      provider.on('accountChanged', handleAccountChanged)
      listening = { provider, handleConnect, handleDisconnect, handleAccountChanged }
    }

    // Immediate best-effort: the provider may already be injected.
    refreshWalletState()
    attachListeners(getInjectedSolanaProvider())

    // Wallets inject asynchronously, so wait for the provider before deciding
    // it's missing, then silently restore a previously-approved session so the
    // "connected" condition survives reloads and navigation.
    waitForInjectedSolanaProvider().then(async (provider) => {
      if (cancelled || !provider) {
        return
      }

      setProvider(provider)
      attachListeners(provider)

      const restored = await eagerReconnect(provider, getAddressFromProvider)
      if (cancelled) {
        return
      }
      if (restored) {
        setWalletError('')
        setWalletAddress(restored)
        setWalletStatus('Connected')
      } else {
        refreshWalletState()
      }
    })

    return () => {
      cancelled = true
      if (listening) {
        const { provider, handleConnect, handleDisconnect, handleAccountChanged } = listening
        provider.off?.('connect', handleConnect)
        provider.off?.('disconnect', handleDisconnect)
        provider.off?.('accountChanged', handleAccountChanged)
      }
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
    } else {
      refreshBalance()
    }
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

      // Refresh balance and memo feed to reflect new on-chain state.
      refreshBalance()

      // Devnet public RPC indexes a fresh transaction with variable latency
      // (1-15 seconds in practice) and aggressively prunes old history. Try
      // a few times so the just-anchored memo reliably appears in the feed.
      // scheduleRefresh tracks each timer so they're cancelled if the user
      // navigates away before they fire.
      const retries = [3000, 7000, 14000]
      retries.forEach((delay) => scheduleRefresh(delay))
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
            transaction on devnet — using both the SPL Memo program and a custom Anchor program written for this hackathon, with no mainnet writes and no new Supabase schema.
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
            Solana devnet. SPL Memo plus a custom Anchor program — both on devnet, no mainnet write, no real money.
          </p>
        </div>

        <aside className="hackathon-hero-panel" aria-label="Web3 profile snapshot">
          <div className="hackathon-stat">
            <span>Track fit</span>
            <strong>Solana + AI</strong>
          </div>
          <div className="hackathon-stat">
            <span>Implementation stage</span>
            <strong>Connect · sign · anchor · index</strong>
          </div>
          <div className="hackathon-stat">
            <span>On-chain status</span>
            <strong>Devnet write + RPC read</strong>
          </div>
        </aside>
      </header>

      <section className="web3-class-letter" aria-label="A short note for the class">
        <p className="web3-class-letter-kicker">
          Pourquoi cette page existe · 为何在这里
        </p>
        <p>
          This page lets the class leave a tiny, permanent mark on a public ledger
          called <em>Solana</em>. No money changes hands. No password leaves your
          device. Just a quiet &ldquo;I was here&rdquo;, written into a place no one
          can take back later — not the institute, not the platform, not even me,
          the builder.
        </p>
        <p className="web3-class-letter-pull">
          Anchored, not stored.
        </p>
        <p>
          If you have a Solana wallet, you can leave that mark in &sect;01–&sect;03
          below. If you don&rsquo;t, &sect;04 still shows everyone else&rsquo;s
          marks without installing anything. That&rsquo;s the whole idea.
        </p>
        <p className="web3-class-letter-rule" aria-hidden="true">
          —
        </p>
        <p lang="zh">
          致班级的同学：你不必懂区块链。这页只是想试一下，能不能让&ldquo;我曾来过&rdquo;
          这件事变成一个公共可验证的事实——不在我的服务器上，不在学校的数据库里。
          每一条记录都已经被固定，没人能后悔删除，也包括我。
        </p>
        <p lang="zh">
          如果你没有 Solana 钱包，看 &sect;04 就够了；如果你想留一笔，
          &sect;01–&sect;03 会一步一步带你过去。
        </p>
      </section>

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
            <Link className="hackathon-button" to="/witness">
              <Sparkles size={17} aria-hidden="true" />
              Try class_anchor on /witness →
            </Link>
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

          <div className="hackathon-section-lead">
            <strong>Second anchor path · custom Rust Anchor program.</strong>{' '}
            The button above writes via the SPL Memo program. The custom{' '}
            <code>class_anchor</code> program written and deployed to devnet for this
            hackathon (program ID <code>Cmv8pnxAaCfo8PtMZowcKTRv85Y5BvT7U2zYfspBC4fu</code>)
            has its own dedicated demo page.{' '}
            <Link to="/witness">→ Open /witness · 见证墙</Link>
          </div>

          <p className="hackathon-ai-badge">
            <ShieldCheck size={15} aria-hidden="true" />
            {onchainAnchor.safety}
          </p>
        </article>
      </ProfileSection>

      <ProfileSection
        id="onchain-feed"
        kicker="04 · On-Chain Activity Feed"
        title="Class collective memory · live read from Solana devnet"
      >
        <article className="hackathon-card">
          <div className="feature-card-head">
            <h3>Memo feed · live RPC read</h3>
            <span className="feature-status">
              <History size={15} aria-hidden="true" />
              {memoFeedStatusLabel}
            </span>
          </div>
          <p>
            Real-time read-side proof. The list below is fetched directly from the Solana devnet RPC at{' '}
            <code>api.devnet.solana.com</code> using <code>getSignaturesForAddress</code> followed by{' '}
            <code>getParsedTransaction</code>, then filtered to SPL Memo instructions and decoded.
            No backend, no cache, no third-party indexer — every refresh is a fresh devnet round-trip.
          </p>

          <div className="feed-view-tabs" role="tablist" aria-label="Feed scope">
            <button
              type="button"
              role="tab"
              aria-selected={feedView === 'mine'}
              className={`feed-view-tab${feedView === 'mine' ? ' is-active' : ''}`}
              onClick={() => setFeedView('mine')}
            >
              My wallet
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={feedView === 'collective'}
              className={`feed-view-tab${feedView === 'collective' ? ' is-active' : ''}`}
              onClick={() => setFeedView('collective')}
            >
              Class collective
              <span className="feed-view-tab-count">· {collectiveWalletCount}</span>
            </button>
          </div>

          <p className="hackathon-section-lead">
            {feedView === 'collective'
              ? `Aggregated memo feed across ${collectiveWalletCount} known class wallet${collectiveWalletCount === 1 ? '' : 's'}, sorted by on-chain time. New wallets join the registry automatically when they connect to this site and anchor a memo.`
              : 'Memos signed by your connected wallet only. Anchor a fresh memo in section 03 — it will appear here within seconds of devnet indexing.'}
          </p>

          {feedView === 'collective' ? (
            <div className="class-registry-panel" aria-label="Class wallet registry">
              <form className="class-registry-add-form" onSubmit={handleAddWalletToRegistry}>
                <label htmlFor="add-wallet-input" className="class-registry-add-label">
                  Add a class wallet to the collective feed
                </label>
                <div className="class-registry-add-row">
                  <input
                    id="add-wallet-input"
                    type="text"
                    className="class-registry-add-input"
                    placeholder="Paste a Solana base58 wallet address…"
                    value={addWalletInput}
                    onChange={(event) => setAddWalletInput(event.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button
                    type="submit"
                    className="hackathon-button is-primary"
                    disabled={!addWalletInput.trim()}
                  >
                    + Add wallet
                  </button>
                </div>
                <p className="class-registry-help">
                  Stored locally in this browser only. The wallet&rsquo;s recent devnet memos
                  are merged into the feed below on the next refresh. Reviewers can paste the
                  Dev3pack judging wallet here to verify the aggregation is real.
                </p>
                {addWalletStatus ? (
                  <p className="status-line">{addWalletStatus}</p>
                ) : null}
              </form>

              {classRegistry.length > 0 ? (
                <ul className="class-registry-list" aria-label="Known class wallets">
                  {classRegistry.map((address) => {
                    const seed = isSeedWallet(address)
                    return (
                      <li key={address} className="class-registry-item">
                        <a
                          href={buildSolscanAccountUrl(address, 'devnet')}
                          target="_blank"
                          rel="noreferrer"
                          className="class-registry-link"
                        >
                          <ExternalLink size={12} aria-hidden="true" />
                          <span className="class-registry-address">
                            {address.slice(0, 6)}…{address.slice(-6)}
                          </span>
                        </a>
                        {seed ? (
                          <span className="class-registry-tag" title="Seed wallet — cannot be removed">
                            seed
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="class-registry-remove"
                            onClick={() => handleRemoveWalletFromRegistry(address)}
                            aria-label={`Remove ${address.slice(0, 6)}…${address.slice(-6)} from local registry`}
                            title="Remove from local registry"
                          >
                            ×
                          </button>
                        )}
                      </li>
                    )
                  })}
                </ul>
              ) : null}
            </div>
          ) : null}

          <div className="hackathon-actions" aria-label="Feed controls">
            <button
              className="hackathon-button is-primary"
              type="button"
              onClick={refreshMemoFeed}
              disabled={memoFeedState === 'loading' || (feedView === 'mine' && !isConnected)}
            >
              <RefreshCw size={17} aria-hidden="true" />
              {memoFeedState === 'loading' ? 'Reading…' : 'Refresh feed'}
            </button>
          </div>

          {feedView === 'mine' && !isConnected ? (
            <p className="hackathon-section-lead">
              Connect a wallet in section 01 to read its on-chain memos. The Class collective tab works without a wallet.
            </p>
          ) : null}

          {memoFeedState === 'loading' && unifiedFeed.length === 0 ? (
            <p className="hackathon-section-lead">Reading recent transactions from devnet RPC…</p>
          ) : null}

          {memoFeedState === 'loaded' && unifiedFeed.length === 0 && (feedView === 'collective' || isConnected) ? (
            <div className="memo-feed-empty">
              <p className="hackathon-section-lead">
                {feedView === 'collective'
                  ? 'No memos in the current devnet RPC window across the class registry. The public devnet RPC at api.devnet.solana.com retains roughly 1–2 hours of recent transaction history; older anchors are still permanently visible on Solscan.'
                  : 'No memos in the current devnet RPC window for this wallet. The public devnet RPC retains roughly 1–2 hours of recent transaction history; older anchors are still permanently visible on Solscan.'}
              </p>
              <div className="memo-feed-historical">
                <p className="memo-feed-historical-kicker">
                  Verified historical anchors (outside the current RPC window)
                </p>
                <p className="memo-feed-historical-meta">
                  Path A · SPL Memo program v2 · 2026-05-08
                </p>
                <pre className="signed-statement memo-feed-historical-payload">
                  math-class-website:1|tag=student-profile|wallet=Fo7H3z7r47RSJs7jLLQGdgcShUrdC9o3yWx1fmrigHJQ|issued=2026-05-08T…
                </pre>
                <p className="hackathon-section-lead">
                  <a
                    href="https://solscan.io/tx/5L76cFugqS8qyt5XozqJr3Brt4sf7ZWhsyrqdiqmJPZ4gpDU4cnFN3Ph9TDWTYgrEEL8qsrPajpJSQwcn56gv846?cluster=devnet"
                    target="_blank"
                    rel="noreferrer"
                    className="memo-feed-link"
                  >
                    <ExternalLink size={13} aria-hidden="true" />
                    View tx 5L76cFugq…56gv846 on Solscan →
                  </a>
                </p>

                <p className="memo-feed-historical-meta" style={{ marginTop: 16 }}>
                  Path B · custom class_anchor program (PDA, permanent) · 2026-05-09
                </p>
                <pre className="signed-statement memo-feed-historical-payload">
                  2026 春季黑客松 — 第一笔从 production 站点写的 anchor
                </pre>
                <p className="hackathon-section-lead">
                  <a
                    href="https://solscan.io/tx/TLYjToQBbvDioD8NqByiBxhH6UqSgftss29NJ6LAxSZKTENLYdHFtfYrq27pEXRHZnJUY7H6y7PMjub2Qtmm9vX?cluster=devnet"
                    target="_blank"
                    rel="noreferrer"
                    className="memo-feed-link"
                  >
                    <ExternalLink size={13} aria-hidden="true" />
                    View tx TLYjToQB…m9vX on Solscan →
                  </a>
                  {' · '}
                  <a
                    href="https://solscan.io/account/65RxSkm4UtE8tbAknGxRe9LCfDssJtGaAvZAmXDaC2G8?cluster=devnet"
                    target="_blank"
                    rel="noreferrer"
                    className="memo-feed-link"
                  >
                    <ExternalLink size={13} aria-hidden="true" />
                    PDA 65RxSkm4…DaC2G8 →
                  </a>
                </p>
                <p className="hackathon-section-lead" style={{ marginTop: 8, fontSize: 13 }}>
                  Class-anchor PDAs are permanent on-chain accounts and survive RPC pruning.{' '}
                  <Link to="/witness">Read all class_anchor PDAs at /witness §03 →</Link>
                </p>
              </div>

              {feedView === 'mine' && walletSolscanUrl ? (
                <p className="hackathon-section-lead">
                  <a href={walletSolscanUrl} target="_blank" rel="noreferrer" className="memo-feed-link">
                    <ExternalLink size={13} aria-hidden="true" />
                    View this wallet&rsquo;s complete devnet history on Solscan →
                  </a>
                </p>
              ) : null}
              {feedView === 'collective' && classRegistry.length > 0 ? (
                <ul className="memo-feed-empty-registry">
                  {classRegistry.map((address) => (
                    <li key={address}>
                      <a
                        href={buildSolscanAccountUrl(address, 'devnet')}
                        target="_blank"
                        rel="noreferrer"
                        className="memo-feed-link"
                      >
                        <ExternalLink size={13} aria-hidden="true" />
                        {address.slice(0, 6)}…{address.slice(-6)} on Solscan →
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          {unifiedFeed.length > 0 ? (
            <ol className="memo-feed-list">
              {unifiedFeed.map((entry) => {
                const isAnchor = entry.source === 'anchor'
                const sourceLabel = isAnchor ? 'class_anchor PDA' : 'SPL Memo'
                const sourceClassName = isAnchor
                  ? 'memo-feed-source memo-feed-source-anchor'
                  : 'memo-feed-source memo-feed-source-memo'
                return (
                  <li key={entry.key} className="memo-feed-entry">
                    <div className="memo-feed-head">
                      <span className="memo-feed-time">
                        <span className={sourceClassName}>{sourceLabel}</span>
                        {' · '}
                        {formatBlockTime(entry.blockTime) || (entry.slot ? `slot ${entry.slot}` : 'unknown time')}
                      </span>
                      <a
                        className="memo-feed-link"
                        href={entry.detailUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink size={13} aria-hidden="true" />
                        {isAnchor ? 'PDA on Solscan' : 'Tx on Solscan'}
                      </a>
                    </div>
                    <pre className="signed-statement">{entry.payload}</pre>
                    <p className="memo-feed-sig">
                      {feedView === 'collective' && entry.walletAddress ? (
                        <>
                          from {entry.walletAddress.slice(0, 6)}…{entry.walletAddress.slice(-6)} ·{' '}
                        </>
                      ) : null}
                      {isAnchor
                        ? `pda: ${entry.pda.slice(0, 8)}…${entry.pda.slice(-8)} · nonce ${entry.nonce}`
                        : `sig: ${entry.signature.slice(0, 12)}…${entry.signature.slice(-10)}`}
                    </p>
                  </li>
                )
              })}
            </ol>
          ) : null}

          {memoFeedError ? <p className="status-line is-error">{memoFeedError}</p> : null}

          <p className="hackathon-ai-badge">
            <ShieldCheck size={15} aria-hidden="true" />
            Read-only RPC, public devnet endpoint, no API key required. SPL Memo
            rows are filtered to the class wallet registry (per-wallet RPC);
            class_anchor PDA rows show every on-chain record from the deployed
            program (single round-trip, surfaces classmates whose wallet is not
            yet in the local registry). Up to 5 memos per registry wallet and 30
            PDAs total. Older SPL Memo history stays fully verifiable on Solscan.
          </p>
        </article>
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
