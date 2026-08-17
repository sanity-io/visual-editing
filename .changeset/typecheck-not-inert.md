---
'@sanity/core-loader': patch
'@sanity/svelte-loader': patch
---

fix: run vitest's typecheck against a tsconfig that actually checks the test files

`typecheck.tsconfig` pointed at `tsconfig.build.json` in both packages. In `core-loader` that config
sets `noCheck`, and in `svelte-loader` it only includes `src`, so type assertions in `test` were
outside the program. Either way every assertion silently passed. Type errors in `src` are still
covered by `pkg build --strict --check`.
