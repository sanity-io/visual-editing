# Changelog

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
