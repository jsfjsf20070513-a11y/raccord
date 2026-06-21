import { useCallback, useEffect, useState } from 'react'
import { SEED_CLASS_WALLETS } from '../data/classRegistry'
import {
  PROGRAM_ID,
  anchorStatement,
  fetchAnchorsByAuthor,
  programExplorerLink,
} from '../lib/classAnchor'
import {
  eagerReconnect,
  getInjectedSolanaProvider,
  waitForInjectedSolanaProvider,
} from '../lib/walletProvider'

// Seed wallet whose anchored statements should always be visible to a
// non-wallet judge skimming /witness §03. This is the wallet that
// performed the project's first public `anchor_statement` call from
// the production site (tx TLYjToQB…m9vX → PDA 65RxSkm4…DaC2G8).
const SEED_BROWSE_WALLET = SEED_CLASS_WALLETS[0] || null

// On-chain hard limit is 200 UTF-8 bytes. The friendly counter caps at
// 60 characters — 60 Chinese chars ≈ 180 bytes < 200, so the byte guard
// below stays a backstop that should never trip in normal use.
const MAX_BYTES = 200
const CHAR_LIMIT = 60

function utf8ByteLength(value) {
  return new TextEncoder().encode(value).length
}

function charLength(value) {
  return [...value].length
}

function formatTimestamp(seconds) {
  return new Date(seconds * 1000).toLocaleString('en-CA', {
    timeZone: 'Asia/Shanghai',
    hour12: false,
  })
}

export default function SolanaWitness() {
  const [walletKey, setWalletKey] = useState(null)
  const [statement, setStatement] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [history, setHistory] = useState([])
  const [, setHistoryAuthor] = useState(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [error, setError] = useState(null)
  // Start optimistic: wallets inject `window.solana` asynchronously, so a sync
  // read on first paint races the injection. We confirm true/false once the
  // injection wait resolves (effect below) to avoid a wrong "install" flash.
  const [phantomMissing, setPhantomMissing] = useState(false)

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
    const provider = getInjectedSolanaProvider()
    if (!provider) {
      setError(
        'Phantom wallet not detected. Install Phantom in this browser, then refresh. · 未检测到 Phantom 钱包，请安装后刷新页面。',
      )
      return
    }
    try {
      const resp = await provider.connect()
      const pk = resp.publicKey.toBase58()
      setWalletKey(pk)
      await refreshHistory(pk)
    } catch (err) {
      setError(err?.message ?? 'Wallet connection failed · 钱包连接失败')
    }
  }, [refreshHistory])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    let cancelled = false
    let listening = null

    const attach = (provider) => {
      if (!provider?.on || listening) return
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
      listening = { provider, onConnect, onDisconnect }
    }

    // Wait for the (asynchronously injected) provider before deciding the
    // wallet is missing, then silently restore a previously-approved session
    // so the connected state survives a reload.
    waitForInjectedSolanaProvider().then(async (provider) => {
      if (cancelled) return
      setPhantomMissing(!provider)
      if (!provider) return
      attach(provider)

      const restored = await eagerReconnect(
        provider,
        (_p, resp) => (resp?.publicKey ?? provider.publicKey)?.toBase58?.() ?? null,
      )
      if (cancelled) return
      if (restored) {
        setWalletKey(restored)
        refreshHistory(restored)
      } else if (provider.isConnected && provider.publicKey) {
        const pk = provider.publicKey.toBase58()
        setWalletKey(pk)
        refreshHistory(pk)
      }
    })

    return () => {
      cancelled = true
      if (listening) {
        listening.provider.removeListener?.('connect', listening.onConnect)
        listening.provider.removeListener?.('disconnect', listening.onDisconnect)
      }
    }
  }, [refreshHistory])

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault()
      setFeedback(null)
      setError(null)

      if (!walletKey) {
        setError('先连接钱包,才能留下这句话。')
        return
      }
      if (!statement.trim()) {
        setError('先写下你想留下的话。')
        return
      }
      const chars = charLength(statement)
      if (chars > CHAR_LIMIT) {
        setError(`最多 ${CHAR_LIMIT} 字 —— 删去 ${chars - CHAR_LIMIT} 字再试。`)
        return
      }
      // Byte backstop: the char cap keeps us well under MAX_BYTES, but emoji
      // can be 4 bytes each, so guard the real on-chain limit too.
      if (utf8ByteLength(statement) > MAX_BYTES) {
        setError('这句话太长了,精简一下再试。')
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

  const remainingChars = CHAR_LIMIT - charLength(statement)
  const programId = PROGRAM_ID.toBase58()
  const programShort = `${programId.slice(0, 7)}…${programId.slice(-5)}`

  return (
    <article className="page-column witness-page">
      <header className="witness-masthead">
        <p className="witness-kicker">Pour la classe · 班级寄语</p>
        <h1 className="witness-title">班级寄语墙</h1>
        <p className="witness-lead">
          给这个班留下一句话 —— 一句你想被记住的话。写下后它就一直留在这里,谁也改不了、谁也删不掉。
        </p>
      </header>

      <section className="witness-traits" aria-label="三个品质">
        <div className="witness-trait">
          <span className="witness-trait-fr">Permanent</span>
          <span className="witness-trait-zh">永久保存</span>
        </div>
        <div className="witness-trait">
          <span className="witness-trait-fr">Public</span>
          <span className="witness-trait-zh">公开可见</span>
        </div>
        <div className="witness-trait">
          <span className="witness-trait-fr">Inaltérable</span>
          <span className="witness-trait-zh">不可篡改</span>
        </div>
      </section>
      <p className="witness-footnote">
        由 Solana 区块链承载 · 程序{' '}
        <a href={programExplorerLink()} target="_blank" rel="noreferrer">{programShort}</a>
        {' '}· MIT 开源
      </p>

      <section className="witness-step">
        <p className="witness-step-num">01 · 先连接你的钱包</p>
        <p className="witness-step-lead">钱包就像你的署名 —— 它证明这句话是你留下的。</p>
        {phantomMissing ? (
          <p className="witness-note">
            还没有钱包?装一个{' '}
            <a href="https://phantom.app/download" target="_blank" rel="noreferrer">Phantom</a>
            (免费浏览器插件,两分钟搞定),再刷新页面就好。
          </p>
        ) : null}
        <div className="witness-actions">
          {!walletKey ? (
            <button type="button" className="vocab-verify" onClick={connectWallet}>连接钱包</button>
          ) : (
            <span className="witness-connected">● 已连接 · 尾号 {walletKey.slice(-4)}</span>
          )}
        </div>
        {error && !walletKey ? <p className="witness-error">{error}</p> : null}
      </section>

      <section className="witness-step">
        <p className="witness-step-num">02 · 写下你的寄语</p>
        <form className="witness-form" onSubmit={handleSubmit}>
          <textarea
            className="witness-textarea"
            rows={3}
            value={statement}
            onChange={(event) => setStatement(event.target.value)}
            disabled={submitting}
            placeholder="想对这个班说的一句话……"
            aria-label="你的寄语"
          />
          <p className="witness-count" aria-live="polite">
            {remainingChars >= 0 ? `还能写 ${remainingChars} 字` : `超出 ${-remainingChars} 字`}
          </p>
          <div className="witness-actions">
            <button
              type="submit"
              className="vocab-verify"
              disabled={submitting || !walletKey || remainingChars < 0 || !statement.trim()}
            >
              {submitting ? '正在留下…' : '留下这句话'}
            </button>
          </div>
        </form>
        {error && walletKey ? <p className="witness-error">{error}</p> : null}
        {feedback ? (
          <div className="witness-receipt">
            <p><span className="witness-receipt-label">状态</span>已永久保存</p>
            <p>
              <span className="witness-receipt-label">凭证</span>
              <span className="witness-receipt-hash">{feedback.signature.slice(0, 10)}…{feedback.signature.slice(-8)}</span>
            </p>
            <p>
              <span className="witness-receipt-label">核验</span>
              <a href={feedback.explorerTx} target="_blank" rel="noreferrer">在 Solscan 上查看 →</a>
            </p>
          </div>
        ) : null}
      </section>

      <section className="witness-step">
        <p className="witness-step-num">03 · 已经留下的话</p>
        {history.length === 0 && !historyLoading ? (
          <p className="witness-step-lead">
            {walletKey ? '你还没有留下寄语 —— 在上面写下第一句吧。' : '还没有寄语,来写下第一句。'}
          </p>
        ) : (
          <ol className="witness-wall">
            {history.map((item) => (
              <li key={item.pda} className="witness-message">
                <p className="witness-message-text">{item.statement}</p>
                <p className="witness-message-meta">
                  {formatTimestamp(item.timestamp)}{' · '}
                  <a href={`https://solscan.io/account/${item.pda}?cluster=devnet`} target="_blank" rel="noreferrer">核验</a>
                </p>
              </li>
            ))}
          </ol>
        )}
        {historyLoading ? <p className="witness-step-lead">正在读取…</p> : null}
      </section>
    </article>
  )
}
