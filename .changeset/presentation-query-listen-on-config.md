---
'@sanity/visual-editing': patch
---

Fix `usePresentationQuery` taking up to 20 seconds to return data in Presentation. The query is now registered as soon as the project, dataset and perspective arrive from Presentation (and again right away when the perspective, variant, query or params change), instead of waiting for the next heartbeat. Results for a perspective or variant that is no longer active are ignored.
