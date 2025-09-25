> [!WARNING]  
> This package is replaced by [`next-sanity`].

## Migrate to [`next-sanity`]

Replace the dependency:

```sh
npm uninstall @sanity/next-loader
npm install next-sanity
```

Replace import statements:

```diff
-import { defineLive, isCorsOriginError } from '@sanity/next-loader'
-import { usePresentationQuery } from '@sanity/next-loader/hooks'
+import { isCorsOriginError } from 'next-sanity'
+import { defineLive } from 'next-sanity/live'
+import { usePresentationQuery } from 'next-sanity/hooks'
```

[`next-sanity`]: https://github.com/sanity-io/next-sanity
