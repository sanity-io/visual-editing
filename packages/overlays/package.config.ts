import { defineConfig } from '@sanity/pkg-utils'

const noExternal = new Set(['visual-editing-helpers'])

export default defineConfig({
  extract: {
    rules: {
      'ae-forgotten-export': 'warn',
      'ae-incompatible-release-tags': 'warn',
      'ae-missing-release-tag': 'warn',
    },
  },
  minify: true,
  external: (externals) =>
    externals.filter((external) => !noExternal.has(external)),
  tsconfig: 'tsconfig.build.json',
})
