# @sanity/presentation-comlink

> [!WARNING]  
> This package is not meant to be used directly, it's a shared dependency of `sanity/presentation` and `@sanity/visual-editing`. Using it in production is at your own risk.

The `sanity/presentation` tool requires a way to communicate with the application that lives within its preview iframe. The application is required to load up at least `@sanity/visual-editing`, but can also load up `@sanity/core-loader`, `next-sanity/live`, `@sanity/svelte-loader`, and `@sanity/react-loader`.
It uses `@sanity/comlink` to communicate over the iframe, and any popup preview windows, over the `window.postMessage` protocol.
The typings for those messages are defined in this package, as well as utils for maintaining compatibility with how older versions of `sanity/presentation` and `@sanity/visual-editing` used to format its message payloads, and helpers for handling payloads..
