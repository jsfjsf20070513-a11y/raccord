// 班级 memo / class_anchor feed 逻辑（§04 统一时间线）。
// 2026-06-09 从 Web3StudentProfile.jsx 抽出为自定义 hook，逻辑逐字保留。
// 纯 devnet 只读（collective 视图无需钱包），与钱包/签名核心解耦。
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  buildSolscanUrl,
  createDevnetConnection,
  fetchCollectiveMemos,
  fetchWalletMemos,
  isValidSolanaAddress,
} from '../lib/solanaMemo'
import { fetchAllClassAnchors } from '../lib/classAnchor'
import {
  addLocalWallet,
  getMergedRegistry,
  removeLocalWallet,
} from '../data/classRegistry'

export function useClassMemoFeed({ walletAddress, isConnected }) {
  const [memoFeed, setMemoFeed] = useState([])
  const [classAnchorFeed, setClassAnchorFeed] = useState([])
  const [memoFeedState, setMemoFeedState] = useState('idle')
  const [memoFeedError, setMemoFeedError] = useState('')
  const [feedView, setFeedView] = useState('mine') // 'mine' | 'collective'
  const [classRegistry, setClassRegistry] = useState(() => getMergedRegistry())
  const [addWalletInput, setAddWalletInput] = useState('')
  const [addWalletStatus, setAddWalletStatus] = useState('')

  // Unified §04 timeline: SPL Memo writes (transient, RPC-bounded)
  // merged with class_anchor PDAs (permanent on-chain accounts) into
  // a single chronological feed so a judge sees both anchor paths in
  // one place. Source-tagged so the UI can label each row.
  const unifiedFeed = useMemo(() => {
    const memoEntries = memoFeed.map((entry) => ({
      source: 'memo',
      key: `memo:${entry.signature}`,
      blockTime: entry.blockTime || 0,
      walletAddress: entry.walletAddress || '',
      payload: entry.memo,
      signature: entry.signature,
      slot: entry.slot,
      detailUrl: buildSolscanUrl(entry.signature, 'devnet'),
    }))
    const anchorEntries = classAnchorFeed.map((entry) => ({
      source: 'anchor',
      key: `anchor:${entry.pda}:${entry.nonce}`,
      blockTime: entry.timestamp || 0,
      walletAddress: entry.author || '',
      payload: entry.statement,
      pda: entry.pda,
      nonce: entry.nonce,
      detailUrl: `https://solscan.io/account/${entry.pda}?cluster=devnet`,
    }))
    return [...memoEntries, ...anchorEntries].sort(
      (a, b) => (b.blockTime || 0) - (a.blockTime || 0),
    )
  }, [memoFeed, classAnchorFeed])

  const memoFeedStatusLabel = memoFeedState === 'loading'
    ? 'Reading from devnet RPC'
    : memoFeedState === 'loaded'
      ? unifiedFeed.length === 0
        ? 'No records yet'
        : (() => {
            const memoCount = memoFeed.length
            const anchorCount = classAnchorFeed.length
            const parts = []
            if (memoCount) parts.push(`${memoCount} SPL Memo${memoCount === 1 ? '' : 's'}`)
            if (anchorCount) parts.push(`${anchorCount} class_anchor PDA${anchorCount === 1 ? '' : 's'}`)
            return parts.join(' + ')
          })()
      : memoFeedState === 'error'
        ? 'RPC read failed'
        : feedView === 'mine' && !isConnected
          ? 'Connect wallet first'
          : 'Idle'

  const collectiveWalletCount = classRegistry.length

  const refreshMemoFeed = useCallback(async () => {
    setMemoFeedState('loading')
    setMemoFeedError('')
    try {
      const connection = createDevnetConnection()

      if (feedView === 'collective') {
        // Pull both anchor paths in parallel: SPL Memo (transient,
        // bounded by RPC retention) and class_anchor PDAs (permanent
        // on-chain accounts surviving any RPC pruning). Failures on
        // either side are isolated so the other still renders.
        //
        // Asymmetric filter strategy on purpose:
        //  - SPL Memo MUST be filtered by classRegistry because the
        //    read path is per-wallet (one RPC call each). Unbounded
        //    memo scans on devnet would not scale.
        //  - class_anchor PDAs are a single
        //    program.account.classAnchor.all() round-trip, so we
        //    show every on-chain PDA regardless of the local
        //    registry. The whole point of "Class collective memory"
        //    is to surface what classmates anchored, even if the
        //    local browser's registry hasn't seen their wallet yet.
        const [memos, anchors] = await Promise.all([
          fetchCollectiveMemos({
            connection,
            walletAddresses: classRegistry,
            perWalletLimit: 5,
          }).catch((err) => {
            console.error('[memoFeed] collective memos failed', err)
            return []
          }),
          fetchAllClassAnchors({
            connection,
            limit: 30,
          }).catch((err) => {
            console.error('[memoFeed] collective anchors failed', err)
            return []
          }),
        ])
        setMemoFeed(memos)
        setClassAnchorFeed(anchors)
        setMemoFeedState('loaded')
        return
      }

      // 'mine' view requires a connected wallet
      if (!walletAddress) {
        setMemoFeed([])
        setClassAnchorFeed([])
        setMemoFeedState('idle')
        return
      }
      const [memos, anchors] = await Promise.all([
        fetchWalletMemos({ connection, walletAddress, limit: 8 }).catch((err) => {
          console.error('[memoFeed] wallet memos failed', err)
          return []
        }),
        fetchAllClassAnchors({
          connection,
          walletAddresses: [walletAddress],
          limit: 30,
        }).catch((err) => {
          console.error('[memoFeed] wallet anchors failed', err)
          return []
        }),
      ])
      setMemoFeed(memos.map((entry) => ({ ...entry, walletAddress })))
      setClassAnchorFeed(anchors)
      setMemoFeedState('loaded')
    } catch (error) {
      setMemoFeedError(error?.message || 'Failed to read memos from devnet RPC.')
      setMemoFeedState('error')
    }
  }, [walletAddress, feedView, classRegistry])

  // When the user connects a wallet, register it locally so the
  // 'Class collective' feed can pick it up.
  useEffect(() => {
    if (!walletAddress) {
      return
    }
    const merged = addLocalWallet(walletAddress)
    setClassRegistry((prev) => {
      const next = Array.from(new Set([...prev, ...merged]))
      return next.length === prev.length ? prev : next
    })
  }, [walletAddress])

  // Refresh the feed whenever its inputs (wallet / view / registry) change.
  // Mirrors the former component effect that called refreshMemoFeed().
  useEffect(() => {
    refreshMemoFeed()
  }, [refreshMemoFeed])

  const handleAddWalletToRegistry = (event) => {
    event?.preventDefault?.()
    const candidate = addWalletInput.trim()
    setAddWalletStatus('')

    if (!candidate) {
      setAddWalletStatus('Paste a Solana base58 wallet address first.')
      return
    }
    if (!isValidSolanaAddress(candidate)) {
      setAddWalletStatus('Not a valid Solana base58 address (32–44 chars).')
      return
    }
    if (classRegistry.includes(candidate)) {
      setAddWalletStatus('This wallet is already in the class registry.')
      return
    }

    addLocalWallet(candidate)
    setClassRegistry(getMergedRegistry())
    setAddWalletInput('')
    setAddWalletStatus(`Added ${candidate.slice(0, 6)}…${candidate.slice(-6)} to registry.`)

    // Trigger an immediate refresh so the new wallet's memos (if any)
    // show up in the collective feed without an extra click.
    if (feedView === 'collective') {
      setTimeout(() => refreshMemoFeed(), 50)
    }
  }

  // 钱包断开/重置时清空 feed（由组件的 resetMemo 调用）。
  const resetFeed = useCallback(() => {
    setMemoFeed([])
    setMemoFeedState('idle')
    setMemoFeedError('')
  }, [])

  const handleRemoveWalletFromRegistry = (address) => {
    if (!address) {
      return
    }
    removeLocalWallet(address)
    setClassRegistry(getMergedRegistry())
    setAddWalletStatus(`Removed ${address.slice(0, 6)}…${address.slice(-6)} from local registry.`)
    if (feedView === 'collective') {
      setTimeout(() => refreshMemoFeed(), 50)
    }
  }

  return {
    memoFeed,
    classAnchorFeed,
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
    resetFeed,
    handleAddWalletToRegistry,
    handleRemoveWalletFromRegistry,
  }
}
