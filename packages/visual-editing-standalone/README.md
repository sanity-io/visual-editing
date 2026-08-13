# `@sanity/visual-editing-standalone`

Use this package to add Sanity Visual Editing to applications that do not use
React.

The package has one JavaScript entry point:

```ts
import {createDataAttribute, enableVisualEditing} from '@sanity/visual-editing-standalone'
```

The package includes all of its runtime code: the internal React renderer,
React DOM, styled-components, and Sanity UI. The package has no dependencies
and no peer dependencies. The `inlinedDependencies` field in `package.json`
shows the version of each included dependency.

The package also has one stylesheet, which you must import. See
[Import the stylesheet](#import-the-stylesheet).

## When to use this package

Use this package with Vue, Nuxt, Svelte, Astro, plain JavaScript, or another
environment that can load ES modules.

Do not use this package in a React application. The package includes its own
copy of React, and a React application would then have two copies. In a React
application, use [`@sanity/visual-editing`](../visual-editing/README.md).

The word "standalone" refers to this distribution of the package. It is not
related to the `standalone` value from the Visual Editing environment APIs.

## Install the package

```sh
npm install @sanity/visual-editing-standalone
```

You do not have to install React.

## Import the stylesheet

The package does not load its stylesheet automatically. Import the stylesheet
one time, where you enable Visual Editing:

```ts
import '@sanity/visual-editing-standalone/styles.css'
```

A bundler loads this import as a usual stylesheet. If you do not use a
bundler, add a `<link>` tag. See [Load from esm.sh](#load-from-esmsh).

The overlays operate without the stylesheet, but these defects occur:

- The loading spinner does not rotate.
- Text for screen readers becomes visible.
- Long labels do not show an ellipsis.

## Enable Visual Editing

Enable Visual Editing only in the browser, and only while draft or preview
mode is active:

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

// Call this when preview mode stops or the page unloads.
disableVisualEditing()
```

The overlay renderer is in a different chunk. The package loads that chunk
only when you call `enableVisualEditing()`. If your application imports only
`createDataAttribute`, the chunk does not load. A bundler can also remove the
unused `enableVisualEditing` code.

The options are the same for all frameworks. If you need custom overlay
components or plugins, use `@sanity/visual-editing`.

## Create data attributes

Use `createDataAttribute` for values that cannot contain stega encoding.
Examples are images, numbers, and booleans:

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

You can load the package directly as a browser module. Add the stylesheet with
a `<link>` tag:

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

In production, use an exact package version. Then the CDN output does not
change.
