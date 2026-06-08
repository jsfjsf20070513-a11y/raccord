// Shared Solana wallet-provider detection for the web3 pages.
//
// Two facts about injected wallets this module exists to handle:
//   1. Phantom injects `window.solana` ASYNCHRONOUSLY — often after the React
//      tree has already mounted. A single synchronous read on mount therefore
//      races the injection and can wrongly conclude "no wallet detected". We
//      wait for Phantom's `phantom#initialized` event, and poll as a fallback,
//      before deciding the wallet is missing.
//   2. On a fresh page load `provider.isConnected` is false even for a dapp the
//      user previously approved. Callers use `connect({ onlyIfTrusted: true })`
//      to silently restore that session without popping a prompt, so the
//      "connected" condition survives a reload or in-app navigation.

export function getInjectedSolanaProvider() {
  if (typeof window === 'undefined') {
    return null
  }

  const provider = window.phantom?.solana || window.solana
  return typeof provider?.connect === 'function' ? provider : null
}

/**
 * Resolve the injected Solana provider, waiting up to `timeoutMs` for an
 * asynchronous wallet injection. Resolves with the provider once available,
 * or `null` if none appears within the window. Never rejects.
 */
export function waitForInjectedSolanaProvider(timeoutMs = 3000) {
  return new Promise((resolve) => {
    const existing = getInjectedSolanaProvider()
    if (existing || typeof window === 'undefined') {
      resolve(existing)
      return
    }

    let settled = false
    const finish = (value) => {
      if (settled) {
        return
      }
      settled = true
      window.removeEventListener('phantom#initialized', onInit)
      clearInterval(pollId)
      clearTimeout(timeoutId)
      resolve(value)
    }

    const onInit = () => finish(getInjectedSolanaProvider())
    window.addEventListener('phantom#initialized', onInit, { once: true })

    const pollId = setInterval(() => {
      const found = getInjectedSolanaProvider()
      if (found) {
        finish(found)
      }
    }, 200)

    const timeoutId = setTimeout(() => finish(getInjectedSolanaProvider()), timeoutMs)
  })
}

/**
 * Silently restore a previously-approved wallet session. Returns the base58
 * address on success, or null if the wallet was never trusted (no prompt is
 * shown in that case). Caller supplies an address extractor so it can reuse
 * its own normalization.
 */
export async function eagerReconnect(provider, getAddress) {
  if (!provider || typeof provider.connect !== 'function') {
    return null
  }
  try {
    const response = await provider.connect({ onlyIfTrusted: true })
    const address = getAddress
      ? getAddress(provider, response)
      : response?.publicKey?.toBase58?.() ?? null
    return address || null
  } catch {
    // Wallet was never approved for this origin — stay disconnected, no prompt.
    return null
  }
}
