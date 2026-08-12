import {fileURLToPath} from 'node:url'

import {defineConfig} from '@sanity/tsdown-config'
import {mergeConfig, type UserConfig} from 'tsdown'

/**
 * The module swapped in for `@sanity/ui/styles.css` imports — see the `plugins` note below.
 */
const injectStylesModule = fileURLToPath(new URL('./src/injectStyles.ts', import.meta.url))

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
    // Processes the stylesheets `injectStyles.ts` pulls in: the plain import is extracted
    // into the `dist/style.css` asset behind the (optional) `./style.css` export, and the
    // `?inline` import receives the same minified text for the runtime injection. `inject`
    // stays off — a `import './style.css'` statement in the output would throw in every
    // native ESM environment (see the plugin below).
    css: {
      minify: true,
    },
    plugins: [
      /**
       * `@sanity/ui@4` ships its static styles as `@sanity/ui/styles.css`, which the bundled
       * `@sanity/visual-editing` overlays import. Leaving a stylesheet import statement in
       * the published JS only works behind bundlers: native ESM consumers — `<script
       * type="module">`, import maps, and CDNs like esm.sh — cannot execute `text/css`, so
       * `enableVisualEditing()` would crash as soon as the lazy overlay chunk loads. (This
       * regressed the esm.sh usage documented in the README when 1.1.0 adopted
       * `@sanity/ui@4`: esm.sh rewrites the specifier to a `.css.mjs` URL that redirects to
       * the raw stylesheet, which browsers refuse to run as a module.)
       *
       * Redirect the stylesheet import to `src/injectStyles.ts` instead, which inlines the
       * processed stylesheet text into the same lazy chunk position the import statement
       * held and applies it to the document at runtime, keeping the dist free of `.css`
       * import statements — self-contained in the same sense as the bundled JS dependencies.
       *
       * `injectStyles.ts` itself imports the stylesheet twice; both resolve back through
       * this hook with `importer === injectStylesModule` and pass through to the real file:
       * - `@sanity/ui/styles.css` (side-effect import) keeps the stylesheet in the CSS
       *   pipeline so `dist/style.css` is still emitted for the `./style.css` export
       *   (`css.inject` is off, so no import statement reaches the output), and
       * - `@sanity/ui/styles.css?inline` provides the processed text (`@tsdown/css` strips
       *   `?inline` and re-resolves the clean id through this hook before reading the file).
       */
      {
        name: 'redirect-stylesheets-to-runtime-injection',
        resolveId: {
          filter: {id: /^@sanity\/ui\/styles\.css$/},
          handler: (_id: string, importer: string | undefined) =>
            importer === injectStylesModule ? null : injectStylesModule,
        },
        transform: {
          filter: {id: /injectStyles\.ts$/},
          handler(code: string, id: string) {
            // `tsdown:deps` re-resolves imports through `this.resolve` and drops the
            // `moduleSideEffects` of the resolution, and this config sets
            // `treeshake.moduleSideEffects: false` — so declare here that the injector,
            // imported for its side effect only, must not be tree-shaken away.
            if (id === injectStylesModule) return {code, map: null, moduleSideEffects: true}
            return null
          },
        },
      },
    ],
  },
) satisfies UserConfig
