---
"@sanity/visual-editing-csm": patch
---

`decodeSanityNodeData` now recovers document metadata from the `/intent/edit/` segment of stega hrefs when the URL search params are unusable, e.g. when the configured `studioUrl` contains a query string or uses hash routing. Previously such hrefs decoded into a legacy node without an `id`, leaving the Presentation documents panel empty and making overlay clicks do nothing ([sanity-io/sanity#14454](https://github.com/sanity-io/sanity/issues/14454))
