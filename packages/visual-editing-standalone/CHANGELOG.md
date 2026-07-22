# Changelog

## 1.0.0

### Major Changes

- [#3510](https://github.com/sanity-io/visual-editing/pull/3510) [`380b473`](https://github.com/sanity-io/visual-editing/commit/380b47334811a0aed59bf114c126f856b0b99c25) Thanks [@stipsan](https://github.com/stipsan)! - Initial release of `@sanity/visual-editing-standalone`, a self-contained ESM
  build of Sanity Visual Editing for non-React applications. A single entry
  point exposes `enableVisualEditing` and `createDataAttribute` with no runtime
  or peer dependencies, and the React-based overlay renderer is inlined into a
  lazy chunk that only loads once `enableVisualEditing()` is called
