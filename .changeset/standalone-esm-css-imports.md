---
'@sanity/visual-editing-standalone': patch
---

fix: restore native ESM compatibility (esm.sh, import maps) that 1.1.0 lost to a stylesheet import statement

`@sanity/ui@4`'s static stylesheet was wired up as an `import './style.css'` statement in the lazy overlay chunk, which only bundlers understand: browsers refuse to execute `text/css` as a module, so `enableVisualEditing()` crashed with `Failed to fetch dynamically imported module` when the package was loaded from esm.sh or any other native ESM setup. The stylesheet text is now embedded in the overlay chunk and applied to the document at runtime through the CSSOM (compatible with strict `style-src` Content Security Policies), keeping the dist free of `.css` import statements — self-contained in native ESM environments and behind bundlers alike. The `./style.css` export remains available, but importing it is never required.
