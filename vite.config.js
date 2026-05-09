import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // @solana/web3.js + @coral-xyz/anchor reference Node's `global`.
    global: 'globalThis',
  },
  resolve: {
    alias: {
      // Provide a browser-friendly Buffer for Solana packages.
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    include: ['buffer', '@solana/web3.js', '@coral-xyz/anchor', 'bn.js'],
  },
})
