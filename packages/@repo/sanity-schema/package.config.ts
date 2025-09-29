import baseConfig from '@repo/package.config'
import {defineConfig} from '@sanity/pkg-utils'

export default defineConfig({
  ...baseConfig,
  rollup: {
    ...baseConfig.rollup,
  },
  extract: {
    ...baseConfig.extract,
    noCheck: true,
  },
})
