import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: 'frontend/react',
  plugins: [react()],
  build: {
    outDir: '../../dist-react',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8787',
    },
  },
})
