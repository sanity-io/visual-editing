# Changelog

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
