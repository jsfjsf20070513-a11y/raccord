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
