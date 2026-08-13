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
    // `@sanity/ui@4` ships its static styles as `@sanity/ui/styles.css`, which the bundled
    // `@sanity/visual-editing` overlays import. Extract it into `dist/style.css` behind the
    // conditional `./style.css` export (`exports.nodeCompat` with a no-op JS shim for
    // runtimes that cannot load `.css` files), and prepend the self-referential
    // `import "@sanity/visual-editing-standalone/style.css"` to the entry (`inject`) — the
    // same conditional-export pattern `@sanity/ui` itself publishes. This keeps every
    // consumer working without an external `@sanity/ui` dependency:
    //
    // - bundlers resolve the `browser`/`style` conditions to the stylesheet and load it
    //   automatically, like any CSS import;
    // - Node (SSR module evaluation) resolves the `node`/`default` conditions to the shim
    //   instead of crashing on a `.css` file;
    // - esm.sh externalizes the import into a URL that resolves to the shim as well
    //   (verified: `esm.sh/@sanity/ui@4.0.2/styles.css?target=es2022` 301s to the
    //   `styles-css.js` shim), so native ESM consumers never execute `text/css` — they add
    //   the stylesheet with a `<link>` tag as documented in the README.
    //
    // Passing `css` here (rather than through `mergeConfig` below) is load-bearing: only the
    // `defineConfig` option wires up `cssNodeCompatPlugin`. The raw `@tsdown/css` `inject`
    // emits a relative `import './style.css'` statement instead, which crashes every native
    // ESM consumer as soon as the lazy overlay chunk loads — esm.sh rewrites it to a
    // `.css.mjs` URL that redirects to the raw `text/css` file, which browsers refuse to run
    // as a module (the 1.1.0 regression).
    css: {
      minify: true,
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
