---
'@sanity/visual-editing': patch
---

Stop intercepting preview clicks when a modifier key is held, overlays are toggled off, or the "Open in Studio" action is shown, so Next.js `<Link>` and open-in-new-tab work without capture-phase `router.push` workarounds. Hovered primary clicks in Presentation still `preventDefault` to activate the overlay instead of navigating; the overlay toggle handlers write a module-level `interceptClicks` flag synchronously so toggling off applies to clicks in the same interaction. Unconditional `mousedown` `preventDefault` (the iframe-focus trick) is limited to drag start. Userland `data-sanity-overlay-element="capture"` elements keep swallowing clicks.
