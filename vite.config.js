/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // /api(chat/speak)在生产是同域 Cloudflare Worker 路由;前端用相对路径。
  // 本地只连本地 Worker，避免开发请求进入班级站生产服务。
  server: {
    proxy: {
      '/api': { target: 'http://127.0.0.1:8787', changeOrigin: true },
    },
  },
  // Unit tests cover the pure security-critical helpers (URL sanitizing,
  // ops-queue envelope decoding, base58 signature encoding). They run in a
  // plain Node environment — no jsdom — so importing src/lib/supabase.js stays
  // inert when the dedicated VITE_RACCORD_SUPABASE_* configuration is absent.
  test: {
    environment: 'node',
    env: { VITE_RACCORD_SUPABASE_URL: '', VITE_RACCORD_SUPABASE_ANON_KEY: '' },
    include: ['src/**/*.test.js', 'scripts/**/*.test.js'],
  },
})
