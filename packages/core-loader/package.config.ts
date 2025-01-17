import baseConfig from '@repo/package.config'
import {defineConfig} from '@sanity/pkg-utils'

export default defineConfig({
  ...baseConfig,
  extract: {
    ...baseConfig.extract,
    bundledPackages: ['nanostores'],
    rules: {
      ...baseConfig.extract.rules,
      'ae-forgotten-export': 'warn',
    },
  },
})
