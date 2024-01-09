import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [sveltekit()],
  // Fix process undefined when importing from apps-common/env
  define: { 'process.env': {} },
})
