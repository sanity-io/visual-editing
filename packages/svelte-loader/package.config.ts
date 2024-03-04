import { defineConfig } from '@sanity/pkg-utils'
import svelte from 'rollup-plugin-svelte'

import baseConfig from '../../package.config'

export default defineConfig({
  ...baseConfig,
  external: ['$app'],
  rollup: {
    plugins: [svelte()],
  },
})
