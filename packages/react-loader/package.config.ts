import { defineConfig } from '@sanity/pkg-utils'

import baseConfig from '../../package.config'

export default defineConfig({
  ...baseConfig,
  bundles: [
    {
      source: './src/rsc/index.react-server.ts',
      import: './dist/rsc/index.react-server.js',
    },
  ],
})
