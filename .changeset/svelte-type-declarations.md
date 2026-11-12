---
'@sanity/svelte-loader': patch
'@sanity/visual-editing': patch
---

Ship TypeScript declarations for `@sanity/svelte-loader` and `@sanity/visual-editing/svelte` again. Since the switch to `@sanity/tsconfig` (which enables `noEmitOnError`), `svelte-package` silently emitted no `.d.ts` files, so imports such as `import type {LoaderLocals} from '@sanity/svelte-loader'` failed with "Could not find a declaration file for module".
