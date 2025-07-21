import baseConfig from '@repo/package.config'
import {defineConfig} from '@sanity/pkg-utils'

export default defineConfig({
  ...baseConfig,
  runtime: 'browser',
  define: {
    'process.env.NODE_ENV': 'production',
  },
  dts: 'rolldown',
})
