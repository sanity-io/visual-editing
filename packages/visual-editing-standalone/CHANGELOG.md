# Changelog

## 2.0.1

### Patch Changes

- [#3630](https://github.com/sanity-io/visual-editing/pull/3630) [`1b5e8be`](https://github.com/sanity-io/visual-editing/commit/1b5e8be938dcd84545d75b205cd285e9f505e079) Thanks [@stipsan](https://github.com/stipsan)! - Ship TypeScript types for the `./styles.css` export so consumers can `import '@sanity/visual-editing-standalone/styles.css'` without a local `declare module`. The runtime export stays the stylesheet (`default` still points at `dist/styles.css`) so esm.sh `<link>` tags keep resolving to `text/css`.

## 2.0.0

### Major Changes

- [#3627](https://github.com/sanity-io/visual-editing/pull/3627) [`0947fd6`](https://github.com/sanity-io/visual-editing/commit/0947fd6e3df626028770724105c1f0e8ebd7f29e) Thanks [@stipsan](https://github.com/stipsan)! - feat!: require importing the stylesheet, now exported as `./styles.css`

  The published JS no longer references the overlays' static stylesheet at all. Both automatic wirings shipped so far broke native ESM consumers: the relative `import './style.css'` of 1.1.0 and the self-referential `import '@sanity/visual-editing-standalone/style.css'` of 1.2.0 were each externalized by esm.sh's build to a `style.css.mjs` URL that redirects to the raw `text/css` file, which browsers refuse to run as a module — 1.2.0 crashed on the entry itself, taking `createDataAttribute` down with it.

  Instead, import the stylesheet explicitly, once, wherever Visual Editing is enabled. With a bundler:

  ```ts
  import '@sanity/visual-editing-standalone/styles.css'
  ```

  Or, when loading from esm.sh, with a `<link>` tag:

  ```html
  <link rel="stylesheet" href="https://esm.sh/@sanity/visual-editing-standalone@2/styles.css" />
  ```

  Breaking changes:

  - The stylesheet export is renamed from `./style.css` to `./styles.css`, matching the `@sanity/ui@4` subpath it repackages, and is now a plain export (the Node no-op shim behind the former conditional export is gone — nothing imports the stylesheet at runtime anymore).
  - The stylesheet is no longer loaded automatically. Skipping it does not break the overlays, but the loading-spinner animation, screen-reader-only hiding, and label ellipsis rules go missing.

### Patch Changes

- [#3625](https://github.com/sanity-io/visual-editing/pull/3625) [`f7f1542`](https://github.com/sanity-io/visual-editing/commit/f7f154239d2b2f259a66de7c075196cf54f05de2) Thanks [@stipsan](https://github.com/stipsan)! - Keep visual editing overlay labels on-screen while the preview scrolls by positioning them with CSS anchor positioning when the browser supports it.

  Browsers without `anchor-name` / `position-try-fallbacks` keep the previous IntersectionObserver flip above/below the overlay.

## 1.2.0

### Minor Changes

- [#3621](https://github.com/sanity-io/visual-editing/pull/3621) [`541ec31`](https://github.com/sanity-io/visual-editing/commit/541ec3111f5115bd187609dad1418ac88a0d5e0f) Thanks [@stipsan](https://github.com/stipsan)! - Add `onVariantChange` to `enableVisualEditing` options, matching `@sanity/visual-editing`, so non-React apps can persist the Studio editing variant for server-side fetches.

### Patch Changes

- [#3622](https://github.com/sanity-io/visual-editing/pull/3622) [`804430c`](https://github.com/sanity-io/visual-editing/commit/804430cf34ce9bdbe9b51b275b6fb3f8ff9d2b64) Thanks [@stipsan](https://github.com/stipsan)! - fix(deps): update dependency @sanity/ui to ^4.0.3

- [#3598](https://github.com/sanity-io/visual-editing/pull/3598) [`4fa3f63`](https://github.com/sanity-io/visual-editing/commit/4fa3f63509192d4666f740163cf941fe6c612400) Thanks [@stipsan](https://github.com/stipsan)! - fix: prevent a React 19 update loop when Visual Editing overlays are hidden by Suspense

- [#3618](https://github.com/sanity-io/visual-editing/pull/3618) [`7d940e1`](https://github.com/sanity-io/visual-editing/commit/7d940e1f5c389b6a26106c907855e6eb85e88bde) Thanks [@stipsan](https://github.com/stipsan)! - fix: restore native ESM (esm.sh) compatibility that 1.1.0 lost to a stylesheet import statement

  `@sanity/ui@4`'s static stylesheet was wired up as a relative `import './style.css'` statement in the lazy overlay chunk, which only bundlers understand: esm.sh rewrites the specifier to a URL that redirects to the raw `text/css` file, which browsers refuse to run as a module, so `enableVisualEditing()` crashed with `Failed to fetch dynamically imported module` in every native ESM setup.

  The stylesheet is now published behind a conditional `./style.css` export — the same pattern `@sanity/ui` itself uses — and imported self-referentially from the entry: bundlers resolve the `browser`/`style` conditions to the stylesheet and load it automatically, while Node and native ESM consumers (including esm.sh) resolve a no-op JS shim instead of crashing. When loading from esm.sh, add the stylesheet with `<link rel="stylesheet" href="https://esm.sh/@sanity/visual-editing-standalone@1/dist/style.css" />` as documented in the README.

## 1.1.0

### Minor Changes

- [#3565](https://github.com/sanity-io/visual-editing/pull/3565) [`b6ced53`](https://github.com/sanity-io/visual-editing/commit/b6ced53e2a64b8f16ca9807023929af4f589d488) Thanks [@stipsan](https://github.com/stipsan)! - Upgrade the bundled overlays to `@sanity/ui@^4.0.0`.

  v4 ships its static styles as a stylesheet rather than injecting them at runtime, so the bundle now emits a package-internal `./style.css` and imports it. Bundlers pick it up automatically, and the package stays self-contained with no external `@sanity/ui` dependency.

  `@sanity/ui` is bundled rather than installed, so v4's raised `engines.node` does not reach consumers of this package.

## 1.0.5

### Patch Changes

- [#3534](https://github.com/sanity-io/visual-editing/pull/3534) [`a1fea20`](https://github.com/sanity-io/visual-editing/commit/a1fea208007654ef785ba52b2234a685eb77ea60) Thanks [@stipsan](https://github.com/stipsan)! - Tighten standalone treeshake further (`propertyReadSideEffects` / `unknownGlobalSideEffects` / more pure factories) and use `minify: true` for the same full Oxc minify pass.

## 1.0.4

### Patch Changes

- [#3548](https://github.com/sanity-io/visual-editing/pull/3548) [`e98a4a2`](https://github.com/sanity-io/visual-editing/commit/e98a4a2d4868b298f3d50eb92cbb848d15ba2225) Thanks [@stipsan](https://github.com/stipsan)! - fix(deps): bump shared dependencies to latest (sanity ^6.6.0, react ^19.2.8, typescript 6.0.3, @sanity/pkg-utils ^11.0.13, styled-components ^6.4.4)

## 1.0.3

### Patch Changes

- [#3535](https://github.com/sanity-io/visual-editing/pull/3535) [`a31f1e7`](https://github.com/sanity-io/visual-editing/commit/a31f1e73b1809390dbc9228825c0bcda04e951cc) Thanks [@stipsan](https://github.com/stipsan)! - fix(deps): update dependency @sanity/ui to ^3.4.3, whose dist no longer pins unused components with `displayName` assignments — the standalone build's displayName-rewriting workaround plugin is removed

- [#3535](https://github.com/sanity-io/visual-editing/pull/3535) [`a31f1e7`](https://github.com/sanity-io/visual-editing/commit/a31f1e73b1809390dbc9228825c0bcda04e951cc) Thanks [@stipsan](https://github.com/stipsan)! - Shrink the self-contained dist by 11% with tsdown treeshake and define options: unused `@sanity/ui` components (including the lazy refractor syntax-highlighter chunk) now tree-shake away, `styled-components` escape hatches are pinned to browser production defaults so no `process` references remain, and the bundled declarations drop vendor `Symbol.observable` global augmentations and dangling reference directives at the module level.

## 1.0.2

### Patch Changes

- [#3533](https://github.com/sanity-io/visual-editing/pull/3533) [`46e18e9`](https://github.com/sanity-io/visual-editing/commit/46e18e90af4a4946fbb713ffde10f658a31cb8df) Thanks [@stipsan](https://github.com/stipsan)! - Reduce the standalone browser distribution size with production defines, aggressive tree shaking, and full minification.

## 1.0.1

### Patch Changes

- [#3526](https://github.com/sanity-io/visual-editing/pull/3526) [`fb82f68`](https://github.com/sanity-io/visual-editing/commit/fb82f68170e7de4bd3c0e47f155815a008918512) Thanks [@squiggler-app](https://github.com/apps/squiggler-app)! - fix(deps): update dependency @sanity/icons to ^5.2.0

- [#3527](https://github.com/sanity-io/visual-editing/pull/3527) [`ebd718d`](https://github.com/sanity-io/visual-editing/commit/ebd718d80e95245baea46a986fe9e1bd90511afc) Thanks [@squiggler-app](https://github.com/apps/squiggler-app)! - fix(deps): update dependency @sanity/ui to ^3.4.0

## 1.0.0

### Major Changes

- [#3510](https://github.com/sanity-io/visual-editing/pull/3510) [`380b473`](https://github.com/sanity-io/visual-editing/commit/380b47334811a0aed59bf114c126f856b0b99c25) Thanks [@stipsan](https://github.com/stipsan)! - Initial release of `@sanity/visual-editing-standalone`, a self-contained ESM
  build of Sanity Visual Editing for non-React applications. A single entry
  point exposes `enableVisualEditing` and `createDataAttribute` with no runtime
  or peer dependencies, and the React-based overlay renderer is inlined into a
  lazy chunk that only loads once `enableVisualEditing()` is called
