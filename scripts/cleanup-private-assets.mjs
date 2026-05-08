#!/usr/bin/env node

// Removes the auto-generated override file and copied uploads/ after a
// successful deploy, so the developer's working tree returns to the
// public-safe state. Idempotent: safe to run when nothing was generated.

import { existsSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OVERRIDE_PATH = join(REPO_ROOT, 'src', 'data', 'privateAlbumOverrides.js')
const UPLOADS_DEST = join(REPO_ROOT, 'public', 'uploads')

if (existsSync(OVERRIDE_PATH)) {
  rmSync(OVERRIDE_PATH, { force: true })
  console.log(`[cleanup-private-assets] removed ${OVERRIDE_PATH}`)
}

if (existsSync(UPLOADS_DEST)) {
  rmSync(UPLOADS_DEST, { recursive: true, force: true })
  console.log(`[cleanup-private-assets] removed ${UPLOADS_DEST}`)
}

console.log('[cleanup-private-assets] done.')
