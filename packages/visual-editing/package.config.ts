import baseConfig from '@repo/package.config'
import {defineConfig} from '@sanity/pkg-utils'

export default defineConfig({
  ...baseConfig,
  // `@sanity/visual-editing` isn't designed to be server side rendered
  runtime: 'browser',
  define: {
    'process.env.NODE_ENV': 'production',
  },
  reactCompiler: {target: '19'},
  strictOptions: {noSanityClientPeerDependency: 'off'},
})
