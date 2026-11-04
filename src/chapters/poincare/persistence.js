import { browserStorage } from '../../shared/browser/storage'
import { createPoincareArtifact, POINCARE_SKY_STORAGE_KEY } from './domain/poincareSkyState'

export function readPoincareArtifact(storage = browserStorage()) {
  if (!storage) return createPoincareArtifact()
  try {
    const stored = storage.getItem(POINCARE_SKY_STORAGE_KEY)
    return createPoincareArtifact(stored ? JSON.parse(stored) : undefined)
  } catch {
    return createPoincareArtifact()
  }
}

export function storePoincareArtifact(value, storage = browserStorage()) {
  const artifact = createPoincareArtifact(value)
  if (!storage) return artifact
  try {
    storage.setItem(POINCARE_SKY_STORAGE_KEY, JSON.stringify(artifact))
  } catch {
    // In-memory state remains authoritative for this visit when storage is blocked.
  }
  return artifact
}
