# `@sanity/visual-editing-standalone`

Self-contained, ESM-only Visual Editing for applications that do not otherwise
use React.

The package exposes the framework-neutral `enableVisualEditing` and
`createDataAttribute` APIs. All runtime code—including the internal React
renderer, React DOM, styled-components, and Sanity UI—is compiled into
package-internal ESM chunks. Installing it adds no production or peer
dependencies.

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

## Enable Visual Editing

Only load Visual Editing in the browser while draft or preview mode is active:

```ts
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

The overlay renderer stays in a separate package-internal chunk and is loaded
only when `enableVisualEditing()` is called.

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

For server-rendered code that only creates attributes, use the focused subpath
so the overlay graph is not traversed:

```ts
import {createDataAttribute} from '@sanity/visual-editing-standalone/create-data-attribute'
```

`enableVisualEditing` also has a focused
`@sanity/visual-editing-standalone/enable-visual-editing` entry.

## Load from esm.sh

The package can be loaded directly as a browser module:

```html
<script type="module">
  import {
    createDataAttribute,
    enableVisualEditing,
  } from 'https://esm.sh/@sanity/visual-editing-standalone@1'

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
