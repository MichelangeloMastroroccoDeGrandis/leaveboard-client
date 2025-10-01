import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 7091
  },
  build: {
    outDir: 'dist',
  },
  optimizeDeps: {
    exclude: ["crypto"], // prevent vite from polyfilling browser crypto
  },
  resolve: {
    alias: {
      crypto: "crypto" // ensure it uses Node’s crypto
    }
  }
})
