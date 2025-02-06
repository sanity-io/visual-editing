import baseConfig from '@repo/package.config'
import {defineConfig} from '@sanity/pkg-utils'

export default defineConfig({
  ...baseConfig,
  // `@sanity/visual-editing` isn't designed to be server side rendered
  runtime: 'browser',
  define: {
    'process.env.NODE_ENV': 'production',
  },
  rollup: {
    ...baseConfig.rollup,
    treeshake: {
      preset: 'smallest',
      manualPureFunctions: ['createElement', 'forwardRef', 'memo', 'styled'],
    },
  },
  // @TODO re-enable once Next.js issues with React.useMemoCache has been resolved
  babel: {reactCompiler: false},
  reactCompilerOptions: {target: '18'},
})
