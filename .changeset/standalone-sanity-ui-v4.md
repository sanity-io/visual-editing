---
'@sanity/visual-editing-standalone': minor
---

Upgrade the bundled overlays to `@sanity/ui@^4.0.0`.

v4 ships its static styles as a stylesheet rather than injecting them at runtime, so the bundle now emits a package-internal `./style.css` and imports it. Bundlers pick it up automatically, and the package stays self-contained with no external `@sanity/ui` dependency.

`@sanity/ui` is bundled rather than installed, so v4's raised `engines.node` does not reach consumers of this package.
