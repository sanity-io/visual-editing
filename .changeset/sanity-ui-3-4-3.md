---
'@sanity/visual-editing': patch
'@sanity/visual-editing-standalone': patch
---

fix(deps): update dependency @sanity/ui to ^3.4.3, whose dist no longer pins unused components with `displayName` assignments — the standalone build's displayName-rewriting workaround plugin is removed
