---
'@sanity/visual-editing-standalone': patch
---

fix: restore native ESM (esm.sh) compatibility that 1.1.0 lost to a stylesheet import statement

`@sanity/ui@4`'s static stylesheet was wired up as a relative `import './style.css'` statement in the lazy overlay chunk, which only bundlers understand: esm.sh rewrites the specifier to a URL that redirects to the raw `text/css` file, which browsers refuse to run as a module, so `enableVisualEditing()` crashed with `Failed to fetch dynamically imported module` in every native ESM setup.

The stylesheet is now published behind a conditional `./style.css` export — the same pattern `@sanity/ui` itself uses — and imported self-referentially from the entry: bundlers resolve the `browser`/`style` conditions to the stylesheet and load it automatically, while Node and native ESM consumers (including esm.sh) resolve a no-op JS shim instead of crashing. When loading from esm.sh, add the stylesheet with `<link rel="stylesheet" href="https://esm.sh/@sanity/visual-editing-standalone@1/dist/style.css" />` as documented in the README.
