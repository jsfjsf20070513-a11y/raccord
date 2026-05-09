import { Anchor, ExternalLink, History, ShieldCheck, Sparkles, Wallet } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { SEED_CLASS_WALLETS } from '../data/classRegistry'
import {
  PROGRAM_ID,
  anchorStatement,
  fetchAnchorsByAuthor,
  programExplorerLink,
} from '../lib/classAnchor'

// Seed wallet whose anchored statements should always be visible to a
// non-wallet judge skimming /witness §03. This is the wallet that
// performed the project's first public `anchor_statement` call from
// the production site (tx TLYjToQB…m9vX → PDA 65RxSkm4…DaC2G8).
const SEED_BROWSE_WALLET = SEED_CLASS_WALLETS[0] || null

const MAX_BYTES = 200

function utf8ByteLength(value) {
  return new TextEncoder().encode(value).length
}

function formatTimestamp(seconds) {
  return new Date(seconds * 1000).toLocaleString('en-CA', {
    timeZone: 'Asia/Shanghai',
    hour12: false,
  })
}

export default function SolanaWitness() {
  const { user } = useAuth()
  const [walletKey, setWalletKey] = useState(null)
  const [statement, setStatement] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [history, setHistory] = useState([])
  const [historyAuthor, setHistoryAuthor] = useState(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [error, setError] = useState(null)

  const phantomMissing = typeof window !== 'undefined' && !window.solana?.isPhantom

  const refreshHistory = useCallback(async (pubkey) => {
    if (!pubkey) return
    try {
      setHistoryLoading(true)
      const items = await fetchAnchorsByAuthor(pubkey)
      setHistory(items)
      setHistoryAuthor(pubkey)
    } catch (err) {
      console.error('[witness] fetchAnchorsByAuthor failed', err)
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  // Default browse — load the seed wallet's PDA history on mount so a
  // judge with no Phantom installed still sees real class_anchor PDAs
  // proving the program works end-to-end. The seed list is read-only
  // and read-back is permissionless (program.account.classAnchor.all).
  useEffect(() => {
    if (!SEED_BROWSE_WALLET) return
    refreshHistory(SEED_BROWSE_WALLET)
    // Intentionally only once on mount; per-wallet refresh is wired in
    // the Phantom listener effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const connectWallet = useCallback(async () => {
    setError(null)
    if (phantomMissing) {
      setError(
        'Phantom wallet not detected. Install Phantom in this browser, then refresh. · 未检测到 Phantom 钱包，请安装后刷新页面。',
      )
      return
    }
    try {
      const resp = await window.solana.connect()
      const pk = resp.publicKey.toBase58()
      setWalletKey(pk)
      await refreshHistory(pk)
    } catch (err) {
      setError(err?.message ?? 'Wallet connection failed · 钱包连接失败')
    }
  }, [phantomMissing, refreshHistory])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const provider = window.solana
    if (!provider?.isPhantom) return undefined
    if (provider.isConnected && provider.publicKey) {
      const pk = provider.publicKey.toBase58()
      setWalletKey(pk)
      refreshHistory(pk)
    }
    const onConnect = (publicKey) => {
      const pk = publicKey?.toBase58?.() ?? null
      setWalletKey(pk)
      if (pk) refreshHistory(pk)
    }
    const onDisconnect = () => {
      setWalletKey(null)
      // Fall back to the seed wallet's history rather than blanking the
      // section, so the read-back proof stays visible for judges.
      if (SEED_BROWSE_WALLET) {
        refreshHistory(SEED_BROWSE_WALLET)
      } else {
        setHistory([])
      }
    }
    provider.on?.('connect', onConnect)
    provider.on?.('disconnect', onDisconnect)
    return () => {
      provider.removeListener?.('connect', onConnect)
      provider.removeListener?.('disconnect', onDisconnect)
    }
  }, [refreshHistory])

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault()
      setFeedback(null)
      setError(null)

      if (!walletKey) {
        setError('Connect a wallet first. · 请先连接 Phantom 钱包。')
        return
      }
      if (!statement.trim()) {
        setError('Write the statement you want to anchor first. · 请先写一段想要 anchor 的内容。')
        return
      }
      const bytes = utf8ByteLength(statement)
      if (bytes > MAX_BYTES) {
        setError(
          `Too long: ${bytes} bytes. The on-chain limit is ${MAX_BYTES} bytes. · 太长了 ${bytes} 字节，上链最多 ${MAX_BYTES} 字节。`,
        )
        return
      }

      try {
        setSubmitting(true)
        const result = await anchorStatement(statement)
        setFeedback({
          signature: result.signature,
          pda: result.pda.toBase58(),
          explorerTx: result.explorerTx,
          explorerAccount: result.explorerAccount,
        })
        setStatement('')
        await refreshHistory(walletKey)
      } catch (err) {
        console.error('[witness] anchorStatement failed', err)
        setError(err?.message ?? 'On-chain write failed · 上链失败')
      } finally {
        setSubmitting(false)
      }
    },
    [statement, walletKey, refreshHistory],
  )

  const remainingBytes = MAX_BYTES - utf8ByteLength(statement)
  const programId = PROGRAM_ID.toBase58()

  return (
    <article className="hackathon-page">
      <header className="hackathon-hero">
        <div className="hackathon-hero-copy">
          <p className="hackathon-eyebrow">Dev3pack Solana track · custom Anchor program · devnet</p>
          <h1>Solana Witness · 见证墙</h1>
          <p className="hackathon-hero-summary">
            A standalone demo of the custom Rust Anchor program written for this hackathon. Every
            statement on this page is permanently inscribed on Solana devnet via a
            per-(signer, nonce) PDA. No mainnet, no money — just a quiet, public &ldquo;I was here.&rdquo;
          </p>
          <p className="hackathon-hero-context" lang="zh">
            班级见证墙：用我自己写的 Anchor 程序把同学的留言永久记录在 Solana 测试网。
            每一条留言都有一个独立的 PDA 账户，写入后没有人能删除它，包括我自己。
          </p>
          <div className="hackathon-actions" aria-label="Solana witness links">
            <a
              className="hackathon-button"
              href={programExplorerLink()}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={17} aria-hidden="true" />
              View program on Solscan
            </a>
            <Link className="hackathon-button" to="/web3-profile">
              <Anchor size={17} aria-hidden="true" />
              Back to Web3 Student Profile
            </Link>
          </div>
        </div>
        <aside className="hackathon-hero-panel" aria-label="Program snapshot">
          <div className="hackathon-stat">
            <span>Program ID</span>
            <strong className="wallet-address-value">{programId}</strong>
          </div>
          <div className="hackathon-stat">
            <span>Cluster</span>
            <strong>Solana Devnet</strong>
          </div>
          <div className="hackathon-stat">
            <span>Framework</span>
            <strong>Anchor 0.29 (Rust)</strong>
          </div>
        </aside>
      </header>

      <section className="hackathon-section">
        <p className="hackathon-kicker">01 · Connect</p>
        <h2>Connect a Phantom wallet on Devnet</h2>
        <article className="hackathon-card">
          <p>
            This page only writes to <strong>Solana devnet</strong>. Devnet SOL has no monetary value
            and cannot be exchanged for mainnet SOL. Switch Phantom to Devnet (Settings → Developer
            Settings → Testnet Mode → Solana Devnet), then come back and click connect.
          </p>
          {phantomMissing ? (
            <p className="status-line is-error">
              Phantom not detected. ·{' '}
              <a href="https://phantom.app/download" target="_blank" rel="noreferrer">
                Install Phantom
              </a>{' '}
              and refresh.
            </p>
          ) : null}
          <div className="hackathon-actions" aria-label="Wallet controls">
            {!walletKey ? (
              <button type="button" className="hackathon-button is-primary" onClick={connectWallet}>
                <Wallet size={17} aria-hidden="true" />
                Connect Phantom · 连接钱包
              </button>
            ) : (
              <span className="hackathon-button is-disabled" aria-disabled="true">
                <Wallet size={17} aria-hidden="true" />
                Connected · 已连接 ({walletKey.slice(0, 6)}…{walletKey.slice(-6)})
              </span>
            )}
          </div>
          {user ? (
            <p className="hackathon-section-lead">
              Site account · 站点身份: {user.email ?? user.id}
            </p>
          ) : null}
        </article>
      </section>

      <section className="hackathon-section">
        <p className="hackathon-kicker">02 · Anchor</p>
        <h2>Inscribe a statement permanently</h2>
        <article className="hackathon-card">
          <form className="editorial-form" onSubmit={handleSubmit}>
            <label htmlFor="witness-statement">
              <span>
                Statement &middot; max {MAX_BYTES} UTF-8 bytes (~66 Chinese chars or 200 ASCII)
              </span>
              <textarea
                id="witness-statement"
                rows={4}
                value={statement}
                onChange={(event) => setStatement(event.target.value)}
                disabled={submitting}
                placeholder="Spring 2026, the moment a theorem clicked. · 2026 春季数学课，某个让我开窍的瞬间。"
              />
            </label>
            <p className="hackathon-section-lead" aria-live="polite">
              {remainingBytes >= 0
                ? `${remainingBytes} bytes remaining · 剩余 ${remainingBytes} 字节`
                : `Over by ${Math.abs(remainingBytes)} bytes · 超出 ${Math.abs(remainingBytes)} 字节`}
            </p>
            <div className="hackathon-actions" aria-label="Anchor controls">
              <button
                type="submit"
                className="hackathon-button is-primary"
                disabled={submitting || !walletKey || remainingBytes < 0}
              >
                <Anchor size={17} aria-hidden="true" />
                {submitting ? 'Anchoring on devnet…' : 'Anchor on devnet · 上链记录'}
              </button>
            </div>
          </form>
          {error ? <p className="status-line is-error">{error}</p> : null}
          {feedback ? (
            <div className="contact-panel">
              <dl>
                <div>
                  <dt>Status</dt>
                  <dd>Confirmed on devnet · 已确认上链</dd>
                </div>
                <div>
                  <dt>Transaction signature</dt>
                  <dd className="wallet-address-value">{feedback.signature}</dd>
                </div>
                <div>
                  <dt>PDA</dt>
                  <dd className="wallet-address-value">{feedback.pda}</dd>
                </div>
                <div>
                  <dt>Verify</dt>
                  <dd>
                    <a href={feedback.explorerTx} target="_blank" rel="noreferrer">
                      Transaction on Solscan
                    </a>
                    {' · '}
                    <a href={feedback.explorerAccount} target="_blank" rel="noreferrer">
                      PDA on Solscan
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}
          <p className="hackathon-ai-badge">
            <ShieldCheck size={15} aria-hidden="true" />
            Devnet only. The program is open-source under MIT — see{' '}
            <code>programs/class-anchor/src/lib.rs</code>.
          </p>
        </article>
      </section>

      <section className="hackathon-section">
        <p className="hackathon-kicker">03 · History</p>
        <h2>{walletKey ? 'What this wallet has anchored' : 'What the seed wallet has anchored'}</h2>
        <article className="hackathon-card">
          <div className="feature-card-head">
            <h3>Read straight from the program</h3>
            <span className="feature-status">
              <History size={15} aria-hidden="true" />
              {historyLoading ? 'Reading…' : `${history.length} record${history.length === 1 ? '' : 's'}`}
            </span>
          </div>
          <p>
            Every entry below is fetched with{' '}
            <code>program.account.classAnchor.all([memcmp on author])</code> — no third-party
            indexer, just the deployed Anchor program and devnet RPC.{' '}
            {walletKey ? (
              <>Showing the records owned by your connected wallet.</>
            ) : historyAuthor ? (
              <>
                Showing the seed wallet&rsquo;s records (
                <code className="wallet-address-value">{historyAuthor.slice(0, 6)}…{historyAuthor.slice(-6)}</code>
                ) so this section is not blank for judges without a Phantom wallet. Connect to see your own.
              </>
            ) : null}
          </p>
          {history.length === 0 && !historyLoading ? (
            <p className="hackathon-section-lead">
              {walletKey
                ? 'This wallet has not anchored any statement yet. Anchor one above to see it appear here.'
                : 'No PDAs yet. Reload to retry, or anchor one yourself in §02 above.'}
            </p>
          ) : (
            <ol className="memo-feed-list">
              {history.map((item) => (
                <li key={item.pda} className="memo-feed-entry">
                  <div className="memo-feed-head">
                    <span className="memo-feed-time">
                      {formatTimestamp(item.timestamp)} &middot; nonce {item.nonce}
                    </span>
                    <a
                      className="memo-feed-link"
                      href={`https://solscan.io/account/${item.pda}?cluster=devnet`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink size={13} aria-hidden="true" />
                      PDA
                    </a>
                  </div>
                  <pre className="signed-statement">{item.statement}</pre>
                  <p className="memo-feed-sig">
                    PDA: {item.pda.slice(0, 8)}…{item.pda.slice(-6)}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </article>
      </section>

      <section className="hackathon-section">
        <p className="hackathon-kicker">Coda</p>
        <h2>Why this exists</h2>
        <article className="hackathon-card">
          <p>
            <em>Anchored, not stored.</em> The class collaboration website at the root URL is a
            quiet bilingual class notebook. This page is its hard-edged twin — written in Rust,
            deployed to a public ledger, and verifiable by anyone with a browser.
          </p>
          <p>
            Pair with{' '}
            <Link to="/web3-profile#onchain-feed">/web3-profile §04 — Class collective memo feed</Link>{' '}
            (live RPC read across the class wallet registry, SPL Memo path) for a complementary
            view of what the class has written on Solana. The history above is the persistent
            class_anchor PDA path; §04 is the SPL Memo path with a wider class scope.
          </p>
          <p className="hackathon-ai-badge">
            <Sparkles size={15} aria-hidden="true" />
            Built solo by Jin Shuofeng for Dev3pack 2026. AI-assisted dev, human-verified, MIT.
          </p>
        </article>
      </section>
    </article>
  )
}
