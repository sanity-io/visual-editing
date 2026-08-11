---
'@sanity/visual-editing': patch
---

Fix overlay spacing and sizing lost in the `@sanity/ui@4` upgrade

`@sanity/ui@4` replaced the `space` prop with `gap` and dropped `"fill"` as a `width` value, so the `space` and `width="fill"` props still passed by the overlay UI (context menu, insert menu, element overlay and the theme wrapper) were no longer applied. Those call sites now use `gap` and an explicit full width, restoring the intended layout.
