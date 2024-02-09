import { defineConfig } from '@sanity/pkg-utils'

import baseConfig from '../../package.config'

export default defineConfig({
  ...baseConfig,
  // `@sanity/visual-editing` isn't designed to be server side rendered
  runtime: 'browser',
  define: {
    'process.env.NODE_ENV': 'production',
  },
  rollup: {
    treeshake: {
      preset: 'smallest',
      manualPureFunctions: ['createElement', 'forwardRef', 'memo', 'styled'],
    },
  },
})
