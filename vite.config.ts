import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  root: 'frontend/static',
  plugins: [react()],
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
  },
  server: {
    fs: {
      allow: ['../..'],
    },
    proxy: {
      '/api': 'http://127.0.0.1:8787',
    },
  },
})
