import {defineConfig} from '@sanity/pkg-utils'

export default defineConfig({
  rollup: {
    optimizeLodash: true,
  },
  extract: {
    rules: {
      'ae-incompatible-release-tags': 'warn',
      'ae-internal-missing-underscore': 'off',
      'ae-missing-release-tag': 'off',
    },
  },
  tsconfig: 'tsconfig.build.json',
})
