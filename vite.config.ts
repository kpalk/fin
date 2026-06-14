import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base is '/' in dev so refresh works at localhost:5173/
// base is '/fin/' in production for GitHub Pages deployment
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/fin/' : '/',
}))
