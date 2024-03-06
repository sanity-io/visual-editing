# @sanity/overlays — Visual Editing

[![npm stat](https://img.shields.io/npm/dm/@sanity/overlays.svg?style=flat-square)](https://npm-stat.com/charts.html?package=@sanity/overlays)
[![npm version](https://img.shields.io/npm/v/@sanity/overlays.svg?style=flat-square)](https://www.npmjs.com/package/@sanity/overlays)
[![gzip size][gzip-badge]][bundlephobia]
[![size][size-badge]][bundlephobia]

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
> Note that there's now a built-in `<VisualEditing>` component [for Next.js App Router in `next-sanity`](https://github.com/sanity-io/visual-editing/tree/main/packages/visual-editing#app-router), [and for Next.js Pages Router in `@sanity/visual-editing/next-pages-rouer`](https://github.com/sanity-io/visual-editing/tree/main/packages/visual-editing#pages-router), [and for Remix in `@sanity/visual-editing/remix`](https://github.com/sanity-io/visual-editing/tree/main/packages/visual-editing#remix).

[`@sanity/visual-editing`]: https://github.com/sanity-io/visual-editing/tree/main/packages/visual-editing#readme
[gzip-badge]: https://img.shields.io/bundlephobia/minzip/@sanity/overlays?label=gzip%20size&style=flat-square
[size-badge]: https://img.shields.io/bundlephobia/min/@sanity/overlays?label=size&style=flat-square
[bundlephobia]: https://bundlephobia.com/package/@sanity/overlays
