---
"@sanity/core-loader": patch
"@sanity/react-loader": patch
"@sanity/visual-editing": patch
---

Fix regression in generated `.d.ts`

[An issue in `rolldown-plugin-dts` caused some typings to be missing.](https://github.com/sxzz/rolldown-plugin-dts/issues/227)
