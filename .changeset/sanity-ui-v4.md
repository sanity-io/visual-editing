---
'@sanity/visual-editing': major
'@sanity/visual-editing-standalone': minor
---

Upgrade to `@sanity/ui@^4.0.0` and load its required static stylesheet.

`@sanity/ui@4` raises its `engines.node` to `>=22.12`, dropping Node 20. Since `@sanity/visual-editing` depends on it directly, that requirement reaches consumers, so this package's own `engines.node` moves from `>=20.19` to `>=22.12`. The `react`, `react-dom` and `styled-components` peer ranges are unchanged — they already matched what v4 requires.

`@sanity/visual-editing-standalone` bundles `@sanity/ui`, so the Node requirement does not reach its consumers. It gains a `./style.css` export: the bundled overlays import it, so bundlers pick it up automatically.
