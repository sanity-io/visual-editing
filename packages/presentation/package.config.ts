import baseConfig from '@repo/package.config'
import {defineConfig} from '@sanity/pkg-utils'

export default defineConfig({
  ...baseConfig,
  external: ['@sanity/ui', 'react', 'react-dom', 'sanity', 'styled-components'],
  define: {
    PRESENTATION_ENABLE_LIVE_DRAFT_EVENTS: process.env['PRESENTATION_ENABLE_LIVE_DRAFT_EVENTS'],
  },
  babel: {reactCompiler: true},
  // @ts-expect-error - add `target` to `pkg-utils` types
  reactCompilerOptions: {target: '18'},
})
