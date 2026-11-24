import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// VITE_BASE is set to the repo path when deploying to GitHub Pages
export default defineConfig({ base: process.env.VITE_BASE || '/', plugins: [react()], server: { port: 5173 } })
