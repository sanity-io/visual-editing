---
'@sanity/visual-editing-standalone': patch
---

Ship TypeScript types for the `./styles.css` export so consumers can `import '@sanity/visual-editing-standalone/styles.css'` without a local `declare module`. The runtime export stays the stylesheet (`default` still points at `dist/styles.css`) so esm.sh `<link>` tags keep resolving to `text/css`.
