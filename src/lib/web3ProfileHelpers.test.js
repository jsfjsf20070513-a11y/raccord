import { describe, it, expect } from 'vitest'
import bs58 from 'bs58'
import {
  base58Encode,
  formatAddress,
  getAddressFromProvider,
  resolveProviderName,
} from './web3ProfileHelpers'

// Red line: the ed25519 identity-proof signature is shown to the user as base58
// and is meant to be independently verifiable. The encoder is hand-rolled (to
// avoid pulling bs58 into the runtime bundle), so it MUST agree byte-for-byte
// with the reference bs58 library — otherwise the displayed proof is wrong.

describe('base58Encode vs bs58 reference', () => {
  it('matches known vectors', () => {
    expect(base58Encode(Uint8Array.from([0, 0, 1]))).toBe('112')
    expect(base58Encode(new TextEncoder().encode('Hello World'))).toBe('JxF12TrwUP45BMd')
  })

  it('preserves leading-zero bytes as leading "1"s', () => {
    const bytes = Uint8Array.from([0, 0, 0, 5, 9])
    expect(base58Encode(bytes)).toBe(bs58.encode(bytes))
    expect(base58Encode(bytes).startsWith('111')).toBe(true)
  })

  it('agrees with bs58 across a deterministic byte sweep', () => {
    // Linear congruential generator → reproducible "random" bytes, no Date/random.
    let seed = 0x2545f491
    const next = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed % 256
    }
    for (let len = 1; len <= 64; len += 1) {
      const bytes = Uint8Array.from({ length: len }, () => next())
      expect(base58Encode(bytes)).toBe(bs58.encode(bytes))
    }
  })

  it('matches bs58 for a 64-byte all-zero signature', () => {
    const zeros = new Uint8Array(64)
    expect(base58Encode(zeros)).toBe(bs58.encode(zeros))
  })

  it('returns empty string for empty / falsy input', () => {
    expect(base58Encode(new Uint8Array(0))).toBe('')
    expect(base58Encode(null)).toBe('')
    expect(base58Encode(undefined)).toBe('')
  })

  it('accepts a plain number array, not just Uint8Array', () => {
    expect(base58Encode([0, 0, 1])).toBe('112')
  })
})

describe('formatAddress', () => {
  it('passes through short keys unchanged', () => {
    expect(formatAddress('ABCDEF')).toBe('ABCDEF')
    expect(formatAddress('12345678901234')).toBe('12345678901234') // exactly 14
  })

  it('truncates long keys to head...tail', () => {
    expect(formatAddress('Cmv8pnxAaCfo8PtMZowcKTRv85Y5BvT7U2zYfspBC4fu')).toBe('Cmv8pn...pBC4fu')
  })

  it('returns empty for empty input', () => {
    expect(formatAddress('')).toBe('')
    expect(formatAddress()).toBe('')
  })
})

describe('getAddressFromProvider', () => {
  it('prefers the response public key via toBase58()', () => {
    const response = { publicKey: { toBase58: () => 'RESP_KEY' } }
    const provider = { publicKey: { toBase58: () => 'PROVIDER_KEY' } }
    expect(getAddressFromProvider(provider, response)).toBe('RESP_KEY')
  })

  it('falls back to the provider public key', () => {
    const provider = { publicKey: { toBase58: () => 'PROVIDER_KEY' } }
    expect(getAddressFromProvider(provider, {})).toBe('PROVIDER_KEY')
  })

  it('stringifies a public key without toBase58', () => {
    expect(getAddressFromProvider({ publicKey: 'RAW' }, null)).toBe('RAW')
    expect(getAddressFromProvider(null, null)).toBe('')
  })
})

describe('resolveProviderName', () => {
  it('reports Phantom, generic, and missing wallets', () => {
    expect(resolveProviderName({ isPhantom: true })).toBe('Phantom')
    expect(resolveProviderName({})).toBe('Injected Solana wallet')
    expect(resolveProviderName(null)).toBe('No wallet detected')
  })
})
