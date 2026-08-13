---
'@sanity/visual-editing-standalone': patch
---

Ship `dist/styles.css.d.ts` next to the stylesheet so consumers can `import '@sanity/visual-editing-standalone/styles.css'` without a local `declare module`. The `./styles.css` export stays a plain string pointing at the CSS file.
