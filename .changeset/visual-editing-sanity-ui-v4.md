---
'@sanity/visual-editing': major
---

Upgrade to `@sanity/ui@^4.0.0` and load its required static stylesheet.

`@sanity/ui@4` raises its `engines.node` to `>=22.12`, dropping Node 20. This package depends on it directly, so that requirement reaches consumers and its own `engines.node` moves from `>=20.19` to `>=22.12`. The `react`, `react-dom` and `styled-components` peer ranges are unchanged — they already matched what v4 requires.
