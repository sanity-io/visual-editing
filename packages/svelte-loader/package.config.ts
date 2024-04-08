import baseConfig from '@repo/package.config'
import { defineConfig } from '@sanity/pkg-utils'
import svelte from 'rollup-plugin-svelte'

export default defineConfig({
  ...baseConfig,
  external: ['$app'],
  rollup: {
    plugins: [svelte()],
  },
})
