---
'@sanity/visual-editing-standalone': major
---

feat!: require importing the stylesheet, now exported as `./styles.css`

The published JS no longer references the overlays' static stylesheet at all. Both automatic wirings shipped so far broke native ESM consumers: the relative `import './style.css'` of 1.1.0 and the self-referential `import '@sanity/visual-editing-standalone/style.css'` of 1.2.0 were each externalized by esm.sh's build to a `style.css.mjs` URL that redirects to the raw `text/css` file, which browsers refuse to run as a module — 1.2.0 crashed on the entry itself, taking `createDataAttribute` down with it.

Instead, import the stylesheet explicitly, once, wherever Visual Editing is enabled. With a bundler:

```ts
import '@sanity/visual-editing-standalone/styles.css'
```

Or, when loading from esm.sh, with a `<link>` tag:

```html
<link rel="stylesheet" href="https://esm.sh/@sanity/visual-editing-standalone@2/styles.css" />
```

Breaking changes:

- The stylesheet export is renamed from `./style.css` to `./styles.css`, matching the `@sanity/ui@4` subpath it repackages, and is now a plain export (the Node no-op shim behind the former conditional export is gone — nothing imports the stylesheet at runtime anymore).
- The stylesheet is no longer loaded automatically. Skipping it does not break the overlays, but the loading-spinner animation, screen-reader-only hiding, and label ellipsis rules go missing.
