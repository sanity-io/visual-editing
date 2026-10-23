---
'@sanity/visual-editing': minor
---

feat: check params of branded `.groq` queries in `usePresentationQuery`

`usePresentationQuery` already typed `data` through `ClientReturn`, so with `@sanity/client@^8.11.0` a branded query, like the default export of a `.groq` file imported through [`@sanity-labs/groq-content-mapper`](https://github.com/sanity-labs/groq-content-mapper), now types its result with no `SanityQueries` entry. Its `params`, passed directly or as a promise, are now checked against the query too.

Before, the result needed a typegen registration and any params went:

```tsx
const {data} = usePresentationQuery({query: POST_QUERY, params: {slgu: slug}}) // typo compiles
```

After:

```tsx
import postQuery from './post.groq' with {type: 'text'}

const {data} = usePresentationQuery({query: postQuery, params: {slug}})
//     ^? PostQueryResult | null, and `slgu` is now a type error
```

Reading the brand is experimental, as it is in `@sanity/client`. The optional `@sanity/client` peer dependency is now `^7.28.0 || ^8.11.0` (was `^7.26.2 || ^8.0.0`), the first release on each major that exports `ClientParams`. Plain strings, `defineQuery` and `SanityQueries` registrations type exactly as before.
