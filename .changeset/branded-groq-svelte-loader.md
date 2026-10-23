---
'@sanity/svelte-loader': minor
---

feat: infer types from branded `.groq` queries in `loadQuery` and `useQuery`

Your `+page.server.ts` and `+page.svelte` can stop repeating themselves. `loadQuery` and `useQuery`, including its `{query, params, options}` form, now read the result and params types straight off a branded query, like the default export of a `.groq` file imported through [`@sanity-labs/groq-content-mapper`](https://github.com/sanity-labs/groq-content-mapper).

Before:

```ts
const initial = await loadQuery<PostQueryResult>(postQuery, {slug})
const q = useQuery<PostQueryResult>({query: postQuery, params: {slug}, options: {initial}})
```

After:

```ts
import postQuery from './post.groq' with {type: 'text'}

const initial = await loadQuery(postQuery, {slug})
const q = useQuery({query: postQuery, params: {slug}, options: {initial}})
//    ^? Readable<{data: PostQueryResult, ...}>, with `slug` required and checked
```

To try it, add the mapper to your `tsconfig.json` and type-check with `tsc --noEmit --runExternalCode` (TypeScript 7.1 or later):

```jsonc
{
  "contentMappers": [
    {
      "package": "@sanity-labs/groq-content-mapper",
      "extensions": [".groq"],
      "options": {
        "schema": "./schema.json", // the file `sanity schema extract` writes by default
        // "schemas": [{"include": "src/lib/queries/shop", "schema": "./shop.json"}], // only when querying more than one project or dataset
      },
    },
  ],
}
```

Reading the brand is experimental, as it is in `@sanity/client`, and needs `@sanity/client@^8.11.0`, which is now the minimum. Plain strings, `defineQuery`, `SanityQueries` registrations, `initial`-driven inference and explicit generics type exactly as before, and an explicit generic still wins over the brand.
