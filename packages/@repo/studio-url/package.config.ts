import baseConfig from '@repo/package.config'
import {defineConfig} from '@sanity/pkg-utils'

export default defineConfig({
  ...baseConfig,
  define: {
    'process.env.NODE_ENV': process.env['VERCEL_ENV'] || process.env['NODE_ENV'] || 'development',
    // rolldown/tsdown require define values to be strings (v11 tolerated undefined)
    'process.env.VERCEL_BRANCH_URL': process.env['VERCEL_BRANCH_URL'] || '',
  },
})
