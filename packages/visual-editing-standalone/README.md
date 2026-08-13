# `@sanity/visual-editing-standalone`

Add Sanity Visual Editing to Vue, Nuxt, Svelte, Astro, or plain JavaScript
applications.

> [!IMPORTANT]
> Import `@sanity/visual-editing-standalone/styles.css` wherever you enable
> Visual Editing. The overlays need these styles for accessibility, labels,
> and loading indicators.

## Quick start

### 1. Install

```bash
npm install @sanity/visual-editing-standalone
```

> [!TIP]
> Does your application use React? Use
> [`@sanity/visual-editing`](../visual-editing/README.md) instead. It also
> supports custom overlay components and plugins.

### 2. Enable Visual Editing

Import the stylesheet and call `enableVisualEditing()` in the browser. Do this
only while draft or preview mode is active.

```ts
import '@sanity/visual-editing-standalone/styles.css'
import {enableVisualEditing} from '@sanity/visual-editing-standalone'

enableVisualEditing()
```

`enableVisualEditing()` returns a cleanup function. Call it when preview mode
stops or the page unloads.

## Use a client-side router

Pass a history adapter if your application controls navigation:

```ts
const disableVisualEditing = enableVisualEditing({
  history: {
    subscribe: (navigate) => {
      const onPopState = () => navigate({type: 'pop', url: location.href})
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
```

## Use esm.sh

Add the stylesheet with a `<link>` tag. Then load the JavaScript module.

```html
<link rel="stylesheet" href="https://esm.sh/@sanity/visual-editing-standalone@2/styles.css" />
<script type="module">
  import {enableVisualEditing} from 'https://esm.sh/@sanity/visual-editing-standalone@2'

  enableVisualEditing()
</script>
```

Use an exact version in production to keep the CDN output stable.

## Create data attributes

Use `createDataAttribute` for values that cannot contain stega encoding, such
as images, numbers, and booleans:

```ts
import {createDataAttribute} from '@sanity/visual-editing-standalone'

const dataSanity = createDataAttribute({
  baseUrl: 'https://example.sanity.studio',
  id: 'post-1',
  type: 'post',
  path: 'mainImage',
}).toString()
```
