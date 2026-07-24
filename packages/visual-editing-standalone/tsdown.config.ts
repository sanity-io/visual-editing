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
      /**
       * `styled-components` reads its escape hatches from `process.env` (statically) and from
       * bare globals (`typeof SC_DISABLE_SPEEDY == 'boolean'`). Pin them all to their browser
       * production defaults, then erase `process` itself: after `NODE_ENV` is inlined the only
       * remaining references are feature probes (`typeof process`) in code that never runs in
       * browsers, so the bundle ships without any Node-flavored dead branches.
       */
      'process.env.REACT_APP_SC_ATTR': 'undefined',
      'process.env.REACT_APP_SC_DISABLE_SPEEDY': 'undefined',
      'process.env.SC_ATTR': 'undefined',
      'process.env.SC_DISABLE_SPEEDY': 'undefined',
      process: 'undefined',
      SC_DISABLE_SPEEDY: 'false',
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
    // React mutates internal fields while scheduling renders, so property *writes* must remain
    // observable (`propertyWriteSideEffects: false` breaks react-dom fiber mutations and mounts
    // an empty overlay root). Property *reads* alone are safe to treat as pure — it is only the
    // combination of both assumptions that corrupts renders. Module pruning and pure factory
    // hints provide the rest of the tree-shaking wins: the inlined prebuilt dists (React via
    // CJS interop, `@sanity/ui`, `styled-components`) carry no `@__PURE__` annotations on their
    // component factory calls, so without the pure hints every component `@sanity/ui` defines
    // would stay in the bundle — not just the ones the overlays render. (Requires `@sanity/ui`
    // >= 3.4.3: earlier dists followed every component with a top-level `X.displayName = '...'`
    // assignment, a side-effect statement that pinned even unused components into the bundle.)
    // `moduleSideEffects: false` also covers the bundled declarations:
    // it lets rolldown-plugin-dts tree-shake vendor `Symbol.observable` global augmentations
    // (rxjs and xstate each ship one) and the barrel modules carrying dangling
    // `/// <reference path="..." />` directives, which would otherwise be hoisted into this
    // package's `.d.ts` output.
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      unknownGlobalSideEffects: false,
      manualPureFunctions: [
        'cloneElement',
        'createContext',
        'createElement',
        'createGlobalStyle',
        'createRef',
        'css',
        'forwardRef',
        'jsx',
        'jsxs',
        'keyframes',
        'lazy',
        'memo',
        'styled',
      ],
    },
    // Unlike a typical library, consumers download this package's bundled dependencies.
    // `true` enables the full Oxc pass — equivalent to `{compress, mangle, codegen: true}`.
    minify: true,
  },
) satisfies UserConfig
