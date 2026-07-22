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
    // Rolldown equivalent of Rollup's `preset: 'smallest'`, plus React /
    // styled-components pure-factory hints. Property *writes* must stay
    // observable (React scheduling), but property *reads* alone can be treated
    // as pure — combining both assumptions is what corrupts renders.
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      unknownGlobalSideEffects: false,
      manualPureFunctions: [
        'createElement',
        'forwardRef',
        'lazy',
        'memo',
        'styled',
        'jsx',
        'jsxs',
        'jsxDEV',
        '_jsx',
        '_jsxs',
        'css',
        'keyframes',
        'createGlobalStyle',
        'cloneElement',
        'createContext',
        'createRef',
      ],
    },
    // Equivalent to `{compress, mangle, codegen: true}` — full Oxc minify.
    minify: true,
  },
) satisfies UserConfig
