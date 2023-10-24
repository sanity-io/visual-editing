import { defineConfig } from '@sanity/pkg-utils'

export default defineConfig({
  minify: false,
  extract: {
    bundledPackages: ['@sanity/core-loader', '@sanity/csm'],
    rules: {
      'ae-forgotten-export': 'warn',
      'ae-incompatible-release-tags': 'warn',
      'ae-missing-release-tag': 'warn',
    },
  },
  tsconfig: 'tsconfig.build.json',
})
