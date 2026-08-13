# `@sanity/visual-editing-standalone`

Self-contained, ESM-only Visual Editing for applications that do not otherwise
use React.

The entire API is a single entry point:

```ts
import {createDataAttribute, enableVisualEditing} from '@sanity/visual-editing-standalone'
```

All runtime code—including the internal React renderer, React DOM,
styled-components, and Sanity UI—is compiled into package-internal ESM chunks.
Installing it adds no production or peer dependencies, and the exact bundled
versions are listed in the `inlinedDependencies` field of `package.json`.

The overlays' static stylesheet ships as the `./styles.css` export — named
after the `@sanity/ui@4` subpath it repackages — and must be imported
explicitly, as shown in [Import the stylesheet](#import-the-stylesheet). The
published JS never references the stylesheet itself, so the package loads in
every ESM runtime — bundlers, Node, esm.sh, import maps — without CSS-handling
support.

## When to use this package

Use this package with Vue, Nuxt, Svelte, Astro, vanilla JavaScript, or another
ESM-native environment where installing and bundling the React dependency graph
is undesirable.

React applications should use
[`@sanity/visual-editing`](../visual-editing/README.md) instead. This package
embeds its own React runtime, so using it in a React application would ship a
second copy.

The word "standalone" describes this package's self-contained distribution. It
is unrelated to the `standalone` value reported by Visual Editing environment
APIs.

## Install

```sh
npm install @sanity/visual-editing-standalone
```

No React packages need to be installed alongside it.

## Import the stylesheet

Import the overlays' static styles once, wherever Visual Editing is enabled:

```ts
import '@sanity/visual-editing-standalone/styles.css'
```

Bundlers handle the import like any other stylesheet. Without a bundler, add a
`<link>` tag instead, as in the [esm.sh example](#load-from-esmsh) below.

Skipping the stylesheet does not break the overlays, but the loading-spinner
animation, screen-reader-only hiding, and label ellipsis rules go missing.

## Enable Visual Editing

Only load Visual Editing in the browser while draft or preview mode is active:

```ts
import '@sanity/visual-editing-standalone/styles.css'
import {enableVisualEditing} from '@sanity/visual-editing-standalone'

const disableVisualEditing = enableVisualEditing({
  history: {
    subscribe: (navigate) => {
      const onPopState = () => {
        navigate({type: 'pop', url: location.href})
      }

      addEventListener('popstate', onPopState)
      return () => removeEventListener('popstate', onPopState)
    },
    update: (update) => {
      if (update.type === 'push') history.pushState(null, '', update.url)
      if (update.type === 'replace') history.replaceState(null, '', update.url)
      if (update.type === 'pop') history.back()
    },
  },
})

// Call this when preview mode is disabled or the page is torn down.
disableVisualEditing()
```

The overlay renderer stays in a separate lazy chunk that only loads when
`enableVisualEditing()` is called. Applications that only import
`createDataAttribute` never load it, and since the JS is side-effect free any
bundler can tree-shake the unused `enableVisualEditing` export away entirely.

The standalone options are framework-neutral. React-based custom overlay
components and plugins remain available from `@sanity/visual-editing`.

## Create data attributes

Use `createDataAttribute` for values that cannot carry stega encoding, such as
images, numbers, and booleans:

```ts
import {createDataAttribute} from '@sanity/visual-editing-standalone'

const dataSanity = createDataAttribute({
  baseUrl: 'https://example.sanity.studio',
  id: 'post-1',
  type: 'post',
  path: 'mainImage',
}).toString()
```

## Load from esm.sh

The package can be loaded directly as a browser module — add the stylesheet
with a `<link>` tag:

```html
<link rel="stylesheet" href="https://esm.sh/@sanity/visual-editing-standalone@2/styles.css" />
<script type="module">
  import {
    createDataAttribute,
    enableVisualEditing,
  } from 'https://esm.sh/@sanity/visual-editing-standalone@2'

  document.querySelector('h1').dataset.sanity = createDataAttribute({
    baseUrl: 'https://example.sanity.studio',
    id: 'post-1',
    type: 'post',
    path: 'title',
  }).toString()

  enableVisualEditing()
</script>
```

Pin an exact package version in production when deterministic CDN output is
required.
