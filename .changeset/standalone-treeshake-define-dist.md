---
'@sanity/visual-editing-standalone': patch
---

Shrink the self-contained dist by 11% with tsdown treeshake and define options: unused `@sanity/ui` components (including the lazy refractor syntax-highlighter chunk) now tree-shake away, `styled-components` escape hatches are pinned to browser production defaults so no `process` references remain, and the bundled declarations drop vendor `Symbol.observable` global augmentations and dangling reference directives at the module level.
