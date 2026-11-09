---
'@sanity/visual-editing': patch
---

fix: start `usePresentationQuery` when project, dataset, and perspective arrive

The loader comlink connects before Presentation has sent those values. The listen effect only depended on the comlink, so the first `loader/query-listen` returned early and was not retried until the 20s heartbeat. The hook now subscribes as soon as that state, the variant, the query, or its params are available.
