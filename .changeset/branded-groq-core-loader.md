---
'@sanity/core-loader': minor
---

feat: infer types from branded `.groq` queries in `createFetcherStore`

Your queries can now bring their own types. Pass `createFetcherStore` a query branded with `__groqResult` and `__groqParams`, like the default export of a `.groq` file imported through [`@sanity-labs/groq-content-mapper`](https://github.com/sanity-labs/groq-content-mapper), and the store's `data` is typed and its params are checked, with no generic and no `SanityQueries` entry.

Before, you named the type yourself:

```ts
const $posts = createFetcherStore<PostsQueryResult>(postsQuery, {type: 'post'})
```

After, the query knows:

```ts
import postsQuery from './posts.groq' with {type: 'text'}

const $posts = createFetcherStore(postsQuery, {type: 'post'})
//    ^? MapStore<QueryStoreState<PostsQueryResult, unknown>>, and a typo in `type` won't compile
```

The new `BrandedQueryResult` and `BrandedQueryParams` types build on `ClientReturn` and `ClientParams` from `@sanity/client@^8.11.0`, which is now the minimum. Reading the brand is experimental, as it is in `@sanity/client`. Plain strings, `defineQuery`, `SanityQueries` registrations and explicit generics type exactly as before, and an explicit generic still wins over the brand.
