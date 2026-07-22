import {defineConfig} from '@sanity/tsdown-config'
import {mergeConfig, type UserConfig} from 'tsdown'

export default mergeConfig(
  await defineConfig({
    tsconfig: 'tsconfig.dist.json',
    // The published artifact is browser-only, like `@sanity/visual-editing` itself.
    platform: 'browser',
    // Match `@sanity/visual-editing`: force production branches so React,
    // styled-components, and friends drop their development-only code paths.
    define: {'process.env.NODE_ENV': JSON.stringify('production')},
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
    // Rolldown equivalent of Rollup's `preset: 'smallest'` used by
    // `@sanity/visual-editing`, plus pure-function hints so unused React /
    // styled-components call sites can be eliminated. Do not set
    // `propertyWriteSideEffects: false` — it drops writes the overlay UI needs
    // and leaves an empty `sanity-visual-editing` root at runtime.
    //
    // Aggressive treeshake also keeps the dts bundler from hoisting rxjs
    // `/// <reference path>` / `Symbol.observable` artifacts into `index.d.ts`,
    // so no declaration-cleanup plugin is needed.
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      unknownGlobalSideEffects: false,
      manualPureFunctions: [
        'createElement',
        'forwardRef',
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
        'lazy',
        'createRef',
      ],
    },
    // Self-contained browser chunks are the final payload (npm / esm.sh).
    minify: true,
  },
) satisfies UserConfig
