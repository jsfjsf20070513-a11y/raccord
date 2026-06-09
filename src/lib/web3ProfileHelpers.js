// Web3StudentProfile 的纯工具函数（无 React/无组件状态依赖）。
// 2026-06-09 从 src/pages/Web3StudentProfile.jsx 抽出，函数体逐字保留。

// Base58 encoder for Solana signatures. Kept inline (no dependency) to avoid
// pulling @solana/web3.js / bs58 which previously triggered high-severity npm
// audit warnings for this public-safe repository.
export const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

export function base58Encode(input) {
  if (!input) {
    return ''
  }

  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input)
  if (bytes.length === 0) {
    return ''
  }

  let leadingZeros = 0
  for (const byte of bytes) {
    if (byte === 0) {
      leadingZeros += 1
    } else {
      break
    }
  }

  const digits = [0]
  for (let byteIndex = 0; byteIndex < bytes.length; byteIndex += 1) {
    let carry = bytes[byteIndex]
    for (let digitIndex = 0; digitIndex < digits.length; digitIndex += 1) {
      carry += digits[digitIndex] << 8
      digits[digitIndex] = carry % 58
      carry = (carry / 58) | 0
    }
    while (carry > 0) {
      digits.push(carry % 58)
      carry = (carry / 58) | 0
    }
  }

  let encoded = ''
  for (let i = 0; i < leadingZeros; i += 1) {
    encoded += BASE58_ALPHABET[0]
  }
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    encoded += BASE58_ALPHABET[digits[i]]
  }
  return encoded
}

export function buildIssuedTimestamp() {
  return new Date().toISOString().replace(/\.\d+Z$/, 'Z')
}

export async function copyToClipboardSafe(text) {
  if (!text) {
    return false
  }

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fall through to legacy path
  }

  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    return true
  } catch {
    return false
  }
}

export function formatAddress(publicKey = '') {
  if (!publicKey) {
    return ''
  }

  if (publicKey.length <= 14) {
    return publicKey
  }

  return `${publicKey.slice(0, 6)}...${publicKey.slice(-6)}`
}

export function getAddressFromProvider(provider, response) {
  const publicKey = response?.publicKey || provider?.publicKey
  return publicKey?.toBase58 ? publicKey.toBase58() : `${publicKey || ''}`
}

export function resolveProviderName(provider) {
  if (!provider) {
    return 'No wallet detected'
  }

  if (provider.isPhantom) {
    return 'Phantom'
  }

  return 'Injected Solana wallet'
}
