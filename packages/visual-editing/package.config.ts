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
      // The `smallest` preset sets `moduleSideEffects: false`, which would strip
      // the side-effect-only `import '@sanity/ui/styles.css'` (required since
      // @sanity/ui@4.0.0-next.5 ships static styles as a stylesheet). Keep CSS
      // imports so the stylesheet reaches consumers' bundlers.
      moduleSideEffects: (id) => id.endsWith('.css'),
    },
  },
  babel: {reactCompiler: true},
  reactCompilerOptions: {target: '19'},
  strictOptions: {noSanityClientPeerDependency: 'off'},
})
