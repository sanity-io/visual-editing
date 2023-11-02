import { defineConfig } from '@sanity/pkg-utils'

export default defineConfig({
  minify: false,
  extract: {
    bundledPackages: ['channels', 'visual-editing-helpers', '@sanity/util'],
    rules: {
      'ae-forgotten-export': 'warn',
      'ae-incompatible-release-tags': 'warn',
      'ae-missing-release-tag': 'warn',
      'ae-internal-missing-underscore': 'off',
    },
  },
  tsconfig: 'tsconfig.build.json',
})
