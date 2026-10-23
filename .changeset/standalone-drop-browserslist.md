---
'@sanity/visual-editing-standalone': patch
---

Remove the `browserslist` field, which extended the undeclared `@sanity/browserslist-config` and made autoprefixer fail on `styles.css` in consuming apps.
