---
'@sanity/visual-editing': patch
'@sanity/visual-editing-standalone': patch
---

Keep visual editing overlay labels on-screen while the preview scrolls by positioning them with CSS anchor positioning when the browser supports it.

Browsers without `anchor-name` / `position-try-fallbacks` keep the previous IntersectionObserver flip above/below the overlay.
