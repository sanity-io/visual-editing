import {defineConfig} from '@sanity/tsdown-config'
import {mergeConfig, type UserConfig} from 'tsdown'

/**
 * `./styles.css` stays a CSS file at runtime (`default` → the stylesheet) so esm.sh
 * `<link rel="stylesheet" href="…/styles.css">` still 301s to `text/css`. A `types`
 * condition is required on top: TypeScript 6 `noUncheckedSideEffectImports` otherwise
 * forces every consumer to `declare module '@sanity/visual-editing-standalone/styles.css'`.
 *
 * `{nodeCompat: true}` is the wrong tool — it points `default` at a JS shim, and esm.sh
 * follows `default` (see `@sanity/ui/styles.css` → `styles-css.js`).
 */
const stylesCssExport = {
  types: './dist/styles.css.d.ts',
  default: './dist/styles.css',
} as const

/** Place `./styles.css` before `./package.json`, matching tsdown-config's `insertCssExport`. */
function insertStylesCssExport(exports: Record<string, unknown>): Record<string, unknown> {
  const next: Record<string, unknown> = {}
  let inserted = false
  for (const [key, value] of Object.entries(exports)) {
    if (key === './styles.css') continue
    if (key === './package.json' && !inserted) {
      next['./styles.css'] = stylesCssExport
      inserted = true
    }
    next[key] = value
  }
  if (!inserted) {
    next['./styles.css'] = stylesCssExport
  }
  return next
}

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
    // `@sanity/visual-editing` overlays import. Extract it into `dist/styles.css` behind a
    // `./styles.css` export — named after the `@sanity/ui` subpath it repackages — that
    // consumers load themselves: with a bundler
    // (`import '@sanity/visual-editing-standalone/styles.css'`) or a `<link>` tag, as
    // documented in the README.
    //
    // The published JS must never reference the stylesheet, which is why `inject` stays off.
    // Both spellings of an injected import break native ESM consumers on esm.sh as soon as
    // the importing chunk loads: the relative `import './style.css'` of 1.1.0 and the
    // self-referential `import '<pkg>/style.css'` of 1.2.0 (`exports.nodeCompat`) are each
    // externalized by esm.sh's build to a `style.css.mjs` URL that redirects to the raw
    // `text/css` file, which browsers refuse to run as a module. 1.2.0 was the worse of the
    // two — the import sat in the entry, so even `import {createDataAttribute}` crashed.
    //
    // `css.exports` stays off so we can declare the subpath ourselves: `types` → a
    // side-effect `.d.ts`, `default` → the stylesheet. A plain string export has no types
    // (Nuxt then needs `declare module`), and `exports.nodeCompat` would point `default`
    // at a JS shim, which esm.sh serves for `<link>` tags.
    css: {
      exports: false,
      fileName: 'styles.css',
      inject: false,
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
    // Copied into dist after the Rolldown pass and before publint. generateBundle is too
    // early: the CSS asset is not in the bundle yet when this config's plugins run.
    copy: ['src/styles.css.d.ts'],
    exports: {
      customExports(exports) {
        return insertStylesCssExport(exports)
      },
    },
    // Unlike a typical library, consumers download this package's bundled dependencies.
    // `true` enables the full Oxc pass — equivalent to `{compress, mangle, codegen: true}`.
    minify: true,
  },
) satisfies UserConfig
