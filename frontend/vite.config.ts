import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // En dev, le front appelle /patients (même origine) → Vite transmet au backend (5000).
    proxy: {
      '/health': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/api/health': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/patients': { target: 'http://127.0.0.1:5000', changeOrigin: true },
    },
  },
})
