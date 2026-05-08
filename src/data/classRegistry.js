// Seed registry of wallets that have anchored at least one memo for the
// Math Class Website project on Solana devnet.
//
// This list is used by the "Class collective" view in the Web3 Student
// Profile to render an aggregated memo feed across all class members.
// New wallets are added locally via the Add wallet flow (stored in
// localStorage under CLASS_REGISTRY_KEY) and merged with this seed list
// at runtime.
//
// All addresses must be valid Solana base58 public keys. Comments next
// to each entry are non-binding hints to help with manual verification.

export const CLASS_REGISTRY_KEY = 'mathclass.web3.class-registry'

export const SEED_CLASS_WALLETS = [
  // Anchor builder + first on-chain memo on 2026-05-08
  'Fo7H3z7r47RSJs7jLLQGdgcShUrdC9o3yWx1fmrigHJQ',
]

export function readLocalRegistry() {
  if (typeof window === 'undefined') {
    return []
  }
  try {
    const raw = window.localStorage.getItem(CLASS_REGISTRY_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter((value) => typeof value === 'string' && value.length > 0)
  } catch {
    return []
  }
}

export function writeLocalRegistry(addresses) {
  if (typeof window === 'undefined') {
    return
  }
  try {
    const unique = Array.from(new Set(addresses.filter(Boolean)))
    window.localStorage.setItem(CLASS_REGISTRY_KEY, JSON.stringify(unique))
  } catch {
    // Local storage may be disabled (private mode); silently skip.
  }
}

export function addLocalWallet(address) {
  if (!address) {
    return readLocalRegistry()
  }
  const current = readLocalRegistry()
  if (current.includes(address)) {
    return current
  }
  const next = [...current, address]
  writeLocalRegistry(next)
  return next
}

export function removeLocalWallet(address) {
  if (!address) {
    return readLocalRegistry()
  }
  const current = readLocalRegistry()
  const next = current.filter((entry) => entry !== address)
  writeLocalRegistry(next)
  return next
}

export function isSeedWallet(address) {
  return SEED_CLASS_WALLETS.includes(address)
}

export function getMergedRegistry() {
  const local = readLocalRegistry()
  return Array.from(new Set([...SEED_CLASS_WALLETS, ...local]))
}
