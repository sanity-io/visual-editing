import {defineConfig} from '@sanity/pkg-utils'

export default defineConfig({
  rollup: {
    optimizeLodash: true,
  },
  extract: {
    bundledPackages: ['@repo/visual-editing-helpers'],
    rules: {
      'ae-forgotten-export': 'error',
      'ae-incompatible-release-tags': 'warn',
      'ae-internal-missing-underscore': 'off',
      'ae-missing-release-tag': 'warn',
    },
  },
  tsconfig: 'tsconfig.build.json',
})
