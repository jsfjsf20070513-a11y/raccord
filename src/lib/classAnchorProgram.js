import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'

// Front-end client for the `class_anchor` Anchor program.
//
// The program itself is written and deployed in a parallel session
// (see programs/class-anchor in the Solana Playground project — IDL
// pinned in src/lib/classAnchorIdl.json once available). Until the
// real program ID + instruction discriminator are filled in below,
// IS_ANCHOR_PROGRAM_LIVE stays false and the UI keeps the
// "Anchor with Class Program" button disabled. This lets the rest
// of the app build green while the contract deploys.
//
// Replacement checklist (after `anchor deploy` lands):
//   1. CLASS_ANCHOR_PROGRAM_ID  →  the deployed program's pubkey
//   2. ANCHOR_STATEMENT_DISCRIMINATOR  →  first 8 bytes of
//      sha256("global:anchor_statement"). Compute via:
//        node -e "console.log(Array.from(\
//          require('crypto').createHash('sha256')\
//            .update('global:anchor_statement').digest()\
//        ).slice(0, 8))"
//   3. IS_ANCHOR_PROGRAM_LIVE  →  true

// PLACEHOLDER — replace with the deployed program ID. The literal
// `11111111111111111111111111111111` is the Solana System Program;
// using it as a stub is intentional so `new PublicKey(...)` parses
// during build, but no anchor_statement call would actually succeed
// against it.
export const CLASS_ANCHOR_PROGRAM_ID = new PublicKey(
  '11111111111111111111111111111111',
)

// PLACEHOLDER — replace with sha256("global:anchor_statement")[0..8].
const ANCHOR_STATEMENT_DISCRIMINATOR = new Uint8Array([
  0, 0, 0, 0, 0, 0, 0, 0,
])

export const IS_ANCHOR_PROGRAM_LIVE = false

// Maximum bytes for the on-chain statement field. Mirrors the Rust
// program's `require!(statement.len() <= 200, ...)` guard.
export const CLASS_ANCHOR_MAX_STATEMENT = 200

// Encode an unsigned 64-bit integer as 8 little-endian bytes.
// Used for both the borsh argument encoding and the PDA seed.
function u64ToLeBytes(value) {
  const buf = new Uint8Array(8)
  let n = BigInt(value)
  for (let i = 0; i < 8; i += 1) {
    buf[i] = Number(n & 0xffn)
    n >>= 8n
  }
  return buf
}

// Borsh-encode the `anchor_statement` instruction data:
//   [discriminator(8) | nonce(8 LE) | statement_len(4 LE) | statement(utf8)]
function encodeStatementInstructionData(nonce, statement) {
  const utf8Statement = new TextEncoder().encode(statement)
  const data = new Uint8Array(8 + 8 + 4 + utf8Statement.length)
  data.set(ANCHOR_STATEMENT_DISCRIMINATOR, 0)
  data.set(u64ToLeBytes(nonce), 8)
  // Borsh `string` is a u32-LE length prefix followed by the utf-8 bytes.
  new DataView(data.buffer).setUint32(16, utf8Statement.length, true)
  data.set(utf8Statement, 20)
  return data
}

// PDA seeds for `class_anchor`:
//   [b"class_anchor", signer_pubkey, nonce_le_bytes]
// These seeds match the Rust program's `#[account(seeds = ..., bump)]`.
export function deriveClassAnchorPda(payerPubkey, nonce) {
  return PublicKey.findProgramAddressSync(
    [
      new TextEncoder().encode('class_anchor'),
      payerPubkey.toBytes(),
      u64ToLeBytes(nonce),
    ],
    CLASS_ANCHOR_PROGRAM_ID,
  )
}

/**
 * Build a Transaction (unsigned) that calls `anchor_statement` on the
 * deployed `class_anchor` program. Mirrors the buildMemoTransaction
 * shape in src/lib/solanaMemo.js so the Web3 page can swap one for
 * the other without restructuring the UI flow.
 */
export function buildAnchorStatementTransaction({
  payerAddress,
  statement,
  recentBlockhash,
  nonce,
}) {
  if (!payerAddress) {
    throw new Error('Missing wallet address for anchor_statement transaction.')
  }
  if (!statement) {
    throw new Error('Missing statement for anchor_statement transaction.')
  }
  if (statement.length > CLASS_ANCHOR_MAX_STATEMENT) {
    throw new Error(
      `Statement exceeds ${CLASS_ANCHOR_MAX_STATEMENT} characters; truncate before anchoring.`,
    )
  }
  if (!recentBlockhash) {
    throw new Error('Missing recent blockhash.')
  }

  const payerPubkey = new PublicKey(payerAddress)
  const finalNonce = typeof nonce === 'number' ? nonce : Date.now()
  const [classAnchorPda] = deriveClassAnchorPda(payerPubkey, finalNonce)

  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: classAnchorPda, isSigner: false, isWritable: true },
      { pubkey: payerPubkey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: CLASS_ANCHOR_PROGRAM_ID,
    data: encodeStatementInstructionData(finalNonce, statement),
  })

  const transaction = new Transaction({
    feePayer: payerPubkey,
    recentBlockhash,
  })
  transaction.add(instruction)
  return { transaction, classAnchorPda, nonce: finalNonce }
}

/**
 * Build a short, ASCII-only payload for the on-chain `statement`
 * field. Kept short enough to fit within CLASS_ANCHOR_MAX_STATEMENT
 * even after worst-case wallet expansion.
 */
export function buildAnchorStatementPayload({ walletAddress, project = 'math-class-website', tag = 'class-anchor' }) {
  const issuedAt = new Date().toISOString().replace(/\.\d+Z$/, 'Z')
  return `${project}:1|tag=${tag}|wallet=${walletAddress}|issued=${issuedAt}`
}

function withTimeout(promise, ms, label) {
  let timeoutId
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        new Error(
          `${label} timed out after ${Math.round(ms / 1000)}s. The wallet popup may have been closed; please retry.`,
        ),
      )
    }, ms)
  })
  return Promise.race([promise, timeout]).finally(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })
}

/**
 * Submit a class_anchor statement transaction through the connected
 * wallet. Returns the transaction signature on success. While
 * IS_ANCHOR_PROGRAM_LIVE is false this throws a friendly error and
 * the caller should fall back to submitMemoViaWallet.
 */
export async function submitAnchorStatementViaWallet({
  provider,
  connection,
  payerAddress,
  statement,
}) {
  if (!IS_ANCHOR_PROGRAM_LIVE) {
    throw new Error(
      'class_anchor program is not deployed yet — please use the SPL Memo button. The Anchor program is being deployed in a parallel session and will be enabled here once the program ID is wired in.',
    )
  }
  if (!provider || typeof provider.signAndSendTransaction !== 'function') {
    throw new Error('Connected wallet does not support signAndSendTransaction.')
  }

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
  const { transaction } = buildAnchorStatementTransaction({
    payerAddress,
    statement,
    recentBlockhash: blockhash,
  })

  const result = await withTimeout(
    provider.signAndSendTransaction(transaction),
    90_000,
    'Wallet sign-and-send (class_anchor)',
  )
  const signature = typeof result === 'string' ? result : result?.signature
  if (!signature) {
    throw new Error('Wallet did not return a transaction signature.')
  }

  try {
    await withTimeout(
      connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        'confirmed',
      ),
      30_000,
      'Devnet confirmation',
    )
  } catch {
    // Soft-fail confirmation timeout; the transaction has already
    // been broadcast and the user can verify on Solscan.
  }

  return signature
}
