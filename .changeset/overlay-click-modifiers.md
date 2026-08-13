---
'@sanity/visual-editing': patch
---

Stop intercepting preview clicks when a modifier key is held or overlays are toggled off, so Next.js `<Link>` and open-in-new-tab work without capture-phase `router.push` workarounds. Hovered primary clicks in Presentation still `preventDefault` to activate the overlay instead of navigating, and only while overlays are actually activated. Unconditional `mousedown` `preventDefault` (the iframe-focus trick) is limited to drag start.
