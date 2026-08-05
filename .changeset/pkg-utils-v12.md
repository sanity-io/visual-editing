---
'@sanity/visual-editing': patch
'@sanity/core-loader': patch
'@sanity/react-loader': patch
'@sanity/preview-url-secret': patch
'@sanity/visual-editing-csm': patch
'@sanity/visual-editing-types': patch
---

Build with `@sanity/pkg-utils` v12 (tsdown). Internal build-tooling change; export paths for consumers are unchanged aside from dropping a broken `types` condition on the `./svelte` export that pointed at a non-existent `dist-svelte/index.d.ts`.
