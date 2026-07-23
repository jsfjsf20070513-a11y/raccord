import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const DEFAULT_RPC = 'https://api.devnet.solana.com'
const DEFAULT_ADDRESS = 'Fo7H3z7r47RSJs7jLLQGdgcShUrdC9o3yWx1fmrigHJQ'
const MEMO_PROGRAM = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'
const OUTPUT_PATH = fileURLToPath(new URL('./_witness-archive.json', import.meta.url))
const args = new Set(process.argv.slice(2))

const rpcUrl = process.env.SOLANA_RPC_URL || DEFAULT_RPC
const address = process.env.WITNESS_WALLET_ADDRESS || DEFAULT_ADDRESS
const shouldWrite = args.has('--write')

async function rpc(method, params, attempt = 0) {
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: method, method, params }),
  })
  if (response.status === 429 && attempt < 7) {
    const retryAfter = Number(response.headers.get('retry-after'))
    const delay = Number.isFinite(retryAfter) && retryAfter > 0
      ? retryAfter * 1000
      : Math.min(8000, 500 * (2 ** attempt))
    await new Promise((resolve) => setTimeout(resolve, delay))
    return rpc(method, params, attempt + 1)
  }
  if (!response.ok) {
    throw new Error(`${method} HTTP ${response.status}`)
  }
  const payload = await response.json()
  if (payload.error) {
    throw new Error(`${method}: ${payload.error.message}`)
  }
  return payload.result
}

async function getAllSignatures() {
  const signatures = []
  let before

  while (true) {
    const options = { limit: 1000, commitment: 'finalized' }
    if (before) options.before = before
    const page = await rpc('getSignaturesForAddress', [address, options])
    signatures.push(...page)
    if (page.length < options.limit) break
    before = page.at(-1)?.signature
    if (!before) break
  }

  return signatures
}

function memoTextFromInstruction(instruction) {
  const programId = typeof instruction?.programId === 'string'
    ? instruction.programId
    : instruction?.programId?.toString?.()
  const isMemo = programId === MEMO_PROGRAM || instruction?.program === 'spl-memo'
  if (!isMemo) return null

  if (typeof instruction.parsed === 'string') return instruction.parsed
  if (typeof instruction.parsed?.info === 'string') return instruction.parsed.info
  if (typeof instruction.parsed?.memo === 'string') return instruction.parsed.memo
  return null
}

function extractMemos(transaction) {
  const outer = transaction?.transaction?.message?.instructions || []
  const inner = (transaction?.meta?.innerInstructions || [])
    .flatMap((group) => group.instructions || [])
  const parsed = [...outer, ...inner]
    .map(memoTextFromInstruction)
    .filter(Boolean)

  if (parsed.length) return [...new Set(parsed)]

  const fromLogs = (transaction?.meta?.logMessages || [])
    .map((line) => line.match(/^Program log: Memo(?: \(len \d+\))?: "(.*)"$/)?.[1])
    .filter(Boolean)
  return [...new Set(fromLogs)]
}

function isIdentityPayload(text) {
  return text.startsWith('math-class-website:')
    || text.includes('|tag=student-profile|')
    || text.includes('|wallet=')
}

function toTestimonial(entry) {
  const content = entry.memo.trim()
  if (!content || content.length > 120 || isIdentityPayload(content)) return null
  return {
    content,
    signature: 'archive Solana',
    created_at: entry.blockTime
      ? new Date(entry.blockTime * 1000).toISOString()
      : new Date().toISOString(),
  }
}

async function validateSession({ supabaseUrl, anonKey, accessToken, userId }) {
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      authorization: `Bearer ${accessToken}`,
    },
  })
  if (!response.ok) {
    throw new Error(`Supabase session validation failed: HTTP ${response.status}`)
  }
  const user = await response.json()
  if (user.id !== userId) {
    throw new Error('SUPABASE_USER_ID does not match the authenticated JWT subject')
  }
}

async function writeTestimonials(rows) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN
  const userId = process.env.SUPABASE_USER_ID
  if (!supabaseUrl || !anonKey || !accessToken || !userId) {
    throw new Error(
      '--write requires SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_ACCESS_TOKEN, and SUPABASE_USER_ID',
    )
  }

  await validateSession({ supabaseUrl, anonKey, accessToken, userId })
  const existingResponse = await fetch(
    `${supabaseUrl}/rest/v1/testimonials?select=content,signature,created_at`,
    {
      headers: {
        apikey: anonKey,
        authorization: `Bearer ${accessToken}`,
      },
    },
  )
  if (!existingResponse.ok) {
    throw new Error(`Supabase testimonial read failed: HTTP ${existingResponse.status}`)
  }
  const existing = await existingResponse.json()
  const fingerprints = new Set(existing.map((row) => `${row.content}\u0000${row.signature}`))
  const pending = rows
    .filter((row) => !fingerprints.has(`${row.content}\u0000${row.signature}`))
    .map((row) => ({ ...row, user_id: userId }))

  if (!pending.length) return []

  const insertResponse = await fetch(`${supabaseUrl}/rest/v1/testimonials`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
      prefer: 'return=representation',
    },
    body: JSON.stringify(pending),
  })
  if (!insertResponse.ok) {
    const detail = await insertResponse.text()
    throw new Error(`Supabase testimonial insert failed: HTTP ${insertResponse.status} ${detail}`)
  }
  return insertResponse.json()
}

const signatures = await getAllSignatures()
const entries = []

for (const record of signatures.filter((entry) => entry.memo !== null)) {
  const transaction = await rpc('getTransaction', [
    record.signature,
    {
      commitment: 'finalized',
      encoding: 'jsonParsed',
      maxSupportedTransactionVersion: 0,
    },
  ])
  for (const memo of extractMemos(transaction)) {
    entries.push({
      signature: record.signature,
      slot: record.slot,
      blockTime: record.blockTime,
      err: record.err,
      memo,
      kind: isIdentityPayload(memo) ? 'identity' : 'testimonial',
      explorer: `https://solscan.io/tx/${record.signature}?cluster=devnet`,
    })
  }
}

const testimonials = entries.map(toTestimonial).filter(Boolean)
const archive = {
  schemaVersion: 1,
  network: 'solana-devnet',
  rpcMethod: ['getSignaturesForAddress', 'getTransaction'],
  address,
  memoProgram: MEMO_PROGRAM,
  capturedAt: new Date().toISOString(),
  signatureCount: signatures.length,
  memoCount: entries.length,
  testimonialCount: testimonials.length,
  entries,
  testimonials,
}

await writeFile(OUTPUT_PATH, `${JSON.stringify(archive, null, 2)}\n`, 'utf8')
console.log(`Archived ${entries.length} memo(s) from ${signatures.length} transaction(s) to ${OUTPUT_PATH}`)

if (shouldWrite) {
  const inserted = await writeTestimonials(testimonials)
  console.log(`Inserted ${inserted.length} testimonial row(s) through anon + authenticated RLS`)
} else {
  console.log('Supabase unchanged (pass --write with an authenticated user session to migrate rows)')
}
