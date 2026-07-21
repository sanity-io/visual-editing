import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import {defineConfig} from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    // `@repo/studio-url` reads these at build time to resolve the studio URL
    'process.env.VERCEL_BRANCH_URL': JSON.stringify(process.env.VERCEL_BRANCH_URL ?? ''),
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
