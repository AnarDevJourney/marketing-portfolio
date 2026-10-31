import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173 },
  // Libraries reached only through dynamic import(); pre-bundle them so the
  // dev server doesn't re-optimize mid-session and break already-loaded pages.
  optimizeDeps: { include: ['lenis', 'gsap', 'gsap/ScrollTrigger'] },
})
