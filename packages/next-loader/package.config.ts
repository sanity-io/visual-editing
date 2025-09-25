import baseConfig from '@repo/package.config'
import {defineConfig} from '@sanity/pkg-utils'

export default defineConfig({
  ...baseConfig,
  extract: {
    rules: {
      'ae-incompatible-release-tags': 'warn',
      'ae-internal-missing-underscore': 'off',
      'ae-missing-release-tag': 'warn',
    },
  },
})
