import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'

// SPL Memo program v2 (canonical address used by Phantom, Solana CLI, Solscan)
export const MEMO_PROGRAM_ID = new PublicKey(
  'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
)

// Public Solana devnet RPC. No API key required.
export const DEVNET_RPC_ENDPOINT = 'https://api.devnet.solana.com'

// Minimum lamports we want available before attempting a memo transaction.
// A bare memo tx burns ~5000 lamports (signature fee). We require a small
// margin so we never bait the user into a guaranteed-fail signing flow.
export const MIN_LAMPORTS_FOR_MEMO = 5_000_000 // 0.005 SOL

export const SOLSCAN_TX_URL_BASE = 'https://solscan.io/tx'
export const SOLSCAN_ACCOUNT_URL_BASE = 'https://solscan.io/account'

/**
 * Validate a string as a Solana base58 public key. Catches both length
 * issues and invalid base58 characters via the PublicKey constructor.
 */
export function isValidSolanaAddress(address) {
  if (!address || typeof address !== 'string') {
    return false
  }
  const trimmed = address.trim()
  if (trimmed.length < 32 || trimmed.length > 44) {
    return false
  }
  try {
    // PublicKey constructor throws on invalid base58 or wrong byte length.
    // The constructor's side effect (validation) is exactly what we want here.
    const probe = new PublicKey(trimmed)
    return probe.toBase58().length > 0
  } catch {
    return false
  }
}

export function lamportsToSol(lamports) {
  if (typeof lamports !== 'number' || !Number.isFinite(lamports)) {
    return 0
  }
  return lamports / LAMPORTS_PER_SOL
}

export function formatSol(lamports) {
  const sol = lamportsToSol(lamports)
  return `${sol.toFixed(4)} SOL`
}

export function buildSolscanUrl(signature, cluster = 'devnet') {
  if (!signature) {
    return ''
  }
  const params = cluster && cluster !== 'mainnet-beta' ? `?cluster=${cluster}` : ''
  return `${SOLSCAN_TX_URL_BASE}/${signature}${params}`
}

export function buildSolscanAccountUrl(walletAddress, cluster = 'devnet') {
  if (!walletAddress) {
    return ''
  }
  const params = cluster && cluster !== 'mainnet-beta' ? `?cluster=${cluster}` : ''
  return `${SOLSCAN_ACCOUNT_URL_BASE}/${walletAddress}${params}`
}

export function createDevnetConnection() {
  return new Connection(DEVNET_RPC_ENDPOINT, 'confirmed')
}

export async function fetchLamportBalance(connection, walletAddress) {
  if (!walletAddress) {
    return 0
  }
  const pubkey = new PublicKey(walletAddress)
  return connection.getBalance(pubkey, 'confirmed')
}

/**
 * Build a memo transaction anchoring a class collaboration record onto
 * Solana devnet. The transaction has a single instruction whose data
 * payload is the UTF-8 encoded memo text. No SOL is moved between
 * accounts; the only on-chain cost is the standard signature fee.
 */
export function buildMemoTransaction({ payerAddress, memoText, recentBlockhash }) {
  if (!payerAddress) {
    throw new Error('Missing wallet address for memo transaction.')
  }
  if (!memoText) {
    throw new Error('Missing memo text.')
  }
  if (!recentBlockhash) {
    throw new Error('Missing recent blockhash.')
  }

  const fromPubkey = new PublicKey(payerAddress)
  const memoInstruction = new TransactionInstruction({
    keys: [{ pubkey: fromPubkey, isSigner: true, isWritable: true }],
    programId: MEMO_PROGRAM_ID,
    data: new TextEncoder().encode(memoText),
  })

  const transaction = new Transaction({
    feePayer: fromPubkey,
    recentBlockhash,
  })
  transaction.add(memoInstruction)
  return transaction
}

/**
 * Build a canonical memo payload that identifies the class collaboration
 * record. Kept short, ASCII-only, and human-readable on Solscan so judges
 * can verify the transaction without specialized tooling.
 */
export function buildMemoPayload({ walletAddress, project = 'math-class-website', tag = 'student-profile' }) {
  const issuedAt = new Date().toISOString().replace(/\.\d+Z$/, 'Z')
  return `${project}:1|tag=${tag}|wallet=${walletAddress}|issued=${issuedAt}`
}

/**
 * Fetch recent on-chain memo records produced by a wallet on Solana devnet.
 *
 * Strategy:
 *   1. List the wallet's most recent transaction signatures via getSignaturesForAddress
 *   2. For each signature, parse the transaction and extract instructions that
 *      target the SPL Memo program v2
 *   3. Decode the memo data as UTF-8 and return one entry per memo
 *
 * The number of RPC calls is bounded by `limit` to stay friendly to the
 * public devnet RPC rate limits. Calls are awaited sequentially with a small
 * delay so a quick page load does not trigger 429s.
 */
export async function fetchWalletMemos({
  connection,
  walletAddress,
  limit = 8,
  rpcDelayMs = 80,
}) {
  if (!walletAddress) {
    return []
  }

  const pubkey = new PublicKey(walletAddress)
  const sigs = await connection.getSignaturesForAddress(pubkey, { limit })
  if (!sigs || sigs.length === 0) {
    return []
  }

  const memos = []
  for (const sigInfo of sigs) {
    if (sigInfo.err) {
      continue
    }
    try {
      const tx = await connection.getParsedTransaction(sigInfo.signature, {
        maxSupportedTransactionVersion: 0,
        commitment: 'confirmed',
      })
      if (!tx) {
        continue
      }

      const instructions = tx.transaction?.message?.instructions || []
      for (const instr of instructions) {
        const programId = instr.programId?.toBase58?.() || instr.programId
        if (programId !== MEMO_PROGRAM_ID.toBase58()) {
          continue
        }

        // Parsed memo instructions in @solana/web3.js v1 expose `parsed`
        // (string), older serializations may put it in `data`.
        const memoData = typeof instr.parsed === 'string'
          ? instr.parsed
          : instr.parsed?.info?.memo
            ? instr.parsed.info.memo
            : typeof instr.data === 'string'
              ? instr.data
              : ''

        if (!memoData) {
          continue
        }

        memos.push({
          signature: sigInfo.signature,
          memo: memoData,
          slot: sigInfo.slot,
          blockTime: sigInfo.blockTime || tx.blockTime || null,
          err: sigInfo.err || null,
        })
      }
    } catch {
      // Per-tx failure should not break the whole feed; just skip.
    }

    if (rpcDelayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, rpcDelayMs))
    }
  }

  return memos
}

/**
 * Aggregate memo entries across multiple wallets into a single time-sorted
 * feed. Useful for showing a "class collective memory" view: each wallet
 * is queried independently (sequentially, with the same per-wallet limit),
 * then results are merged by blockTime descending.
 */
export async function fetchCollectiveMemos({
  connection,
  walletAddresses,
  perWalletLimit = 5,
  rpcDelayMs = 100,
}) {
  if (!walletAddresses || walletAddresses.length === 0) {
    return []
  }

  const all = []
  for (const address of walletAddresses) {
    try {
      const entries = await fetchWalletMemos({
        connection,
        walletAddress: address,
        limit: perWalletLimit,
        rpcDelayMs,
      })
      for (const entry of entries) {
        all.push({ ...entry, walletAddress: address })
      }
    } catch {
      // One wallet failing should not nuke the whole feed.
    }
  }

  return all.sort((a, b) => {
    const at = a.blockTime || 0
    const bt = b.blockTime || 0
    return bt - at
  })
}

export function formatBlockTime(blockTimeSeconds) {
  if (!blockTimeSeconds) {
    return ''
  }
  return new Date(blockTimeSeconds * 1000).toISOString().replace(/\.\d+Z$/, 'Z')
}

function withTimeout(promise, ms, label) {
  let timeoutId
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s. The wallet popup may have been closed; please retry.`))
    }, ms)
  })

  return Promise.race([promise, timeout]).finally(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })
}

/**
 * Submit a memo transaction through the connected wallet. Returns the
 * transaction signature on success. Caller is responsible for catching
 * thrown errors and surfacing them to the user.
 *
 * The signing step is wrapped in a 90s timeout so a stuck wallet popup
 * (e.g. user closed the approve window) cannot leave the UI hanging.
 */
export async function submitMemoViaWallet({
  provider,
  connection,
  payerAddress,
  memoText,
}) {
  if (!provider || typeof provider.signAndSendTransaction !== 'function') {
    throw new Error('Connected wallet does not support signAndSendTransaction.')
  }

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
  const transaction = buildMemoTransaction({
    payerAddress,
    memoText,
    recentBlockhash: blockhash,
  })

  const result = await withTimeout(
    provider.signAndSendTransaction(transaction),
    90_000,
    'Wallet sign-and-send',
  )
  const signature = typeof result === 'string' ? result : result?.signature
  if (!signature) {
    throw new Error('Wallet did not return a transaction signature.')
  }

  // Best-effort confirmation, capped at 30 seconds. A signed transaction
  // sent to devnet is already on-chain; the confirm wait is just for UI
  // status feedback and is not strictly required for the demo evidence.
  try {
    await withTimeout(
      connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        'confirmed',
      ),
      30_000,
      'Devnet confirmation',
    )
  } catch {
    // Treat confirmation timeout as soft-fail; the signature is still valid
    // and the user can verify on Solscan independently.
  }

  return signature
}
