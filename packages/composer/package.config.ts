import { defineConfig } from '@sanity/pkg-utils'

export default defineConfig({
  extract: {
    bundledPackages: ['@sanity/csm'],
    rules: {
      'ae-forgotten-export': 'warn',
      'ae-incompatible-release-tags': 'warn',
      'ae-missing-release-tag': 'warn',
    },
  },
  tsconfig: 'tsconfig.build.json',
})
