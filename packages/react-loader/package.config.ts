import baseConfig from '@repo/package.config'
import {defineConfig} from '@sanity/pkg-utils'

export default defineConfig({
  ...baseConfig,
  bundles: [
    {
      source: './src/rsc/index.react-server.ts',
      import: './dist/rsc/index.react-server.js',
    },
  ],
})
