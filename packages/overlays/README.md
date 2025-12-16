> [!WARNING]  
> This package is replaced by [`@sanity/visual-editing`].

## Migrate to [`@sanity/visual-editing`]

Replace the dependency:

```sh
npm uninstall @sanity/overlays
npm install @sanity/visual-editing
```

Replace import statements:

```diff
-import { enableOverlays, type DisableOverlays } from '@sanity/overlays'
+import { enableVisualEditing, type DisableVisualEditing } from '@sanity/visual-editing'
```

> [!NOTE]  
> Note that there's now a built-in `<VisualEditing>` component [for Next.js App Router in `next-sanity`](https://github.com/sanity-io/visual-editing/tree/main/packages/visual-editing#app-router), [and for Next.js Pages Router in `@sanity/visual-editing/next-pages-router`](https://github.com/sanity-io/visual-editing/tree/main/packages/visual-editing#pages-router), [and for React Router in `@sanity/visual-editing/react-router`](https://github.com/sanity-io/visual-editing/tree/main/packages/visual-editing#react-router).
