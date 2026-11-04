import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { siteMetadata, siteOrigin } from './scripts/site-config.mjs'

export default defineConfig(({ mode }) => ({
  plugins: [react(), siteMetadata(siteOrigin(loadEnv(mode, process.cwd(), 'RACCORD_').RACCORD_SITE_URL))],
  test: {
    environment: 'node',
    include: ['src/**/*.test.js', 'scripts/**/*.test.mjs'],
  },
}))
