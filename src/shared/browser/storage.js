// Storage is optional. Browser policies can throw even when accessing its getter.
export function browserStorage() {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

export function readStored(key, storage = browserStorage()) {
  try {
    return storage?.getItem(key) ?? null
  } catch {
    return null
  }
}

export function writeStored(key, value, storage = browserStorage()) {
  try {
    storage?.setItem(key, value)
  } catch {
    // React state remains usable for this visit.
  }
}
