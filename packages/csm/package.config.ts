import { defineConfig } from '@sanity/pkg-utils'

export default defineConfig({
  minify: false,
  external: ['@sanity/client'],
  extract: {
    bundledPackages: ['@sanity/client', 'visual-editing-helpers'],
    rules: {
      'ae-forgotten-export': 'warn',
      'ae-incompatible-release-tags': 'warn',
      'ae-missing-release-tag': 'warn',
    },
  },
  tsconfig: 'tsconfig.build.json',
})
