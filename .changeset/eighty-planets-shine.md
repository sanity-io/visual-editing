---
'@sanity/visual-editing-standalone': major
---

Initial release of `@sanity/visual-editing-standalone`, a self-contained ESM
build of Sanity Visual Editing for non-React applications. A single entry
point exposes `enableVisualEditing` and `createDataAttribute` with no runtime
or peer dependencies, and the React-based overlay renderer is inlined into a
lazy chunk that only loads once `enableVisualEditing()` is called
