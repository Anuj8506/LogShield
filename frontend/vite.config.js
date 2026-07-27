import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Forward /api requests to Express backend
      '/api': 'http://localhost:3000',
      // Forward WebSocket connections to Express backend
      '/ws': {
        target: 'ws://localhost:3000',
        ws: true
      }
    }
  }
})