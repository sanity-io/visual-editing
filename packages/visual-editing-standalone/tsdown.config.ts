import {defineConfig} from '@sanity/tsdown-config'
import {mergeConfig, type UserConfig} from 'tsdown'

export default mergeConfig(
  await defineConfig({
    tsconfig: 'tsconfig.dist.json',
    // The published artifact is browser-only, like `@sanity/visual-editing` itself.
    platform: 'browser',
    // Fold all common production guards before minification and tree shaking.
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
      'import.meta.env.DEV': 'false',
      'import.meta.env.PROD': 'true',
      'import.meta.env.MODE': JSON.stringify('production'),
    },
    deps: {
      // This package is deliberately self-contained: bundle every dependency,
      // including the lazy-loaded React runtime, into package-internal chunks.
      alwaysBundle: /./,
      onlyBundle: false,
      // Fail the build if any bare import were to leak into the output.
      onlyImport: [],
    },
  }),
  {
    // React mutates internal fields while scheduling renders, so property writes must remain
    // observable. Module pruning and pure factory hints provide the safe tree-shaking wins.
    treeshake: {
      moduleSideEffects: false,
      manualPureFunctions: ['createElement', 'forwardRef', 'lazy', 'memo', 'styled'],
    },
    // Unlike a typical library, consumers download this package's bundled dependencies.
    minify: {
      compress: true,
      mangle: true,
      codegen: true,
    },
  },
) satisfies UserConfig
