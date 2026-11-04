import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { siteMetadata, siteOrigin } from './scripts/site-config.mjs'

export default defineConfig(({ mode }) => ({
  plugins: [react(), siteMetadata(siteOrigin(loadEnv(mode, process.cwd(), 'RACCORD_').RACCORD_SITE_URL))],
  // 保留升级前的浏览器支持范围。
  build: { target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'] },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js', 'scripts/**/*.test.mjs'],
  },
}))
