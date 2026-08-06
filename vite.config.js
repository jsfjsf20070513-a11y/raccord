/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // /api(chat/speak)在生产是同域 Cloudflare Worker 路由;前端用相对路径。
  // dev 下把它代理到生产 Worker,保持本地可用(Worker 白名单含 localhost:5173)。
  server: {
    proxy: {
      '/api': { target: 'https://rucmathclass.com', changeOrigin: true },
    },
  },
  // Unit tests cover the pure security-critical helpers (URL sanitizing,
  // ops-queue envelope decoding, base58 signature encoding). They run in a
  // plain Node environment — no jsdom — so importing src/lib/supabase.js stays
  // inert (no VITE_SUPABASE_* env → isSupabaseConfigured is false → no client).
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
})
