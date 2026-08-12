---
'@sanity/visual-editing-types': minor
'@sanity/core-loader': minor
'@sanity/react-loader': minor
'@sanity/svelte-loader': minor
'@sanity/visual-editing': minor
---

feat: accept any `@sanity/client` version in the loaders via `SanityClientLike`

Options that took a client used to be typed as `SanityClient | SanityStegaClient`. `SanityClient`
declares a `#private` field, which makes it nominal rather than structural, so a client only
satisfied it when it came from the exact same copy of `@sanity/client`. Passing a client from a
different major failed to typecheck, and so did a duplicate install of the same version:

```
Type 'SanityClient' is not assignable to type 'SanityClient | SanityStegaClient'.
  Property '#private' in type 'SanityClient' refers to a different member that cannot be
  accessed from within type 'SanityClient'.
```

These options now take `SanityClientLike`, a structural interface covering only what the loaders
use: `config()`, `withConfig()` and `fetch()`. Any client satisfies it, from any version, including
the ones from `@sanity/client/stega`, `@sanity/preview-kit/client` and `next-sanity`.

This affects `createQueryStore({client})`, `setServerClient()`, `enableLiveMode({client})`,
`useLiveMode({client})`, `handlePreview({client})` and `handleLoadQuery({client})`. All of them
accept strictly more than before, so no changes are needed.

For SvelteKit, `event.locals.client` still gives you the full `SanityClient` API. If your app
resolves a different copy of `@sanity/client` than these packages do, name your own client type in
`app.d.ts` to avoid a mismatch:

```ts
import type {SanityClient} from '@sanity/client'
import type {LoaderLocals} from '@sanity/svelte-loader'

declare global {
  namespace App {
    interface Locals extends LoaderLocals<SanityClient> {}
  }
}
```

The one narrowing is `unstable__serverClient.instance`, which is now `SanityClientLike`. It is
marked `@internal` and prefixed `unstable__`.
