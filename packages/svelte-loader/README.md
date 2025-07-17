# @sanity/svelte-loader

[![npm stat](https://img.shields.io/npm/dm/@sanity/svelte-loader.svg?style=flat-square)](https://npm-stat.com/charts.html?package=@sanity/svelte-loader)
[![npm version](https://img.shields.io/npm/v/@sanity/svelte-loader.svg?style=flat-square)](https://www.npmjs.com/package/@sanity/svelte-loader)
[![gzip size][gzip-badge]][bundlephobia]
[![size][size-badge]][bundlephobia]

A Sanity loader for Svelte and SvelteKit.

Loaders provide a convenient, unified way of loading data across production, development and preview states, for both server and client side rendering. They also handle the heavy lifting of implementing Visual Editing alongside [Presentation](https://www.sanity.io/docs/presentation).

Read more about loaders [here](https://www.sanity.io/docs/loaders-and-overlays).

## Installation

```sh
npm install @sanity/svelte-loader

# We will also need the following dependencies for fetching data and enabling visual editing
npm install @sanity/client @sanity/visual-editing
```

## Usage

Use the steps below with an existing or [new SvelteKit app](https://kit.svelte.dev/docs/creating-a-project) to enable visual editing using the Svelte loader.

### Define environment variables

Create a `.env` file in the project's root directory and provide the following environment variables. The token should not be exposed on the client, so the `PUBLIC_` prefix is omitted.

```bash
# .env
SANITY_API_READ_TOKEN="..."
PUBLIC_SANITY_PROJECT_ID="..."
PUBLIC_SANITY_DATASET="..."
PUBLIC_SANITY_API_VERSION="..."
PUBLIC_SANITY_STUDIO_URL="..."
```

### Setup Sanity client instances

Create and export an instance of Sanity client using the previously defined environment variables.

```ts
// src/lib/sanity.ts
import {createClient} from '@sanity/client'
import {
  PUBLIC_SANITY_API_VERSION,
  PUBLIC_SANITY_DATASET,
  PUBLIC_SANITY_PROJECT_ID,
  PUBLIC_SANITY_STUDIO_URL,
} from '$env/static/public'

export const client = createClient({
  projectId: PUBLIC_SANITY_PROJECT_ID,
  dataset: PUBLIC_SANITY_DATASET,
  apiVersion: PUBLIC_SANITY_API_VERSION,
  useCdn: true,
  stega: {
    studioUrl: PUBLIC_SANITY_STUDIO_URL,
  },
})
```

On the server, we use a Sanity client configured with a read token to allow the fetching of preview content.

```ts
// src/lib/server/sanity.ts
import {SANITY_API_READ_TOKEN} from '$env/static/private'
import {client} from '$lib/sanity'

export const serverClient = client.withConfig({
  token: SANITY_API_READ_TOKEN,
  // Optionally enable stega
  // stega: true
})
```

### Configure loaders and previews

We pass the server client instance to `setServerClient` in the [server hooks](https://kit.svelte.dev/docs/hooks#server-hooks) file as this code will only be executed once during app initialization.

The loader package also exports an optional `createRequestHandler` for creating a server hook [`handle`](https://kit.svelte.dev/docs/hooks#server-hooks-handle) function which:

- Creates server routes used to enable and disable previews.
- Verifies the preview cookie on each request and sets `locals.preview` to `true` or `false`.
- Sets and configures `locals.loadQuery`, the function we will use to fetch data on the server.

```ts
// src/hooks.server.ts
import {createRequestHandler, setServerClient} from '@sanity/svelte-loader'
import {serverClient} from '$lib/server/sanity'

setServerClient(serverClient)

export const handle = createRequestHandler()
```

> [!NOTE]
> If our app needs to support multiple `handle` functions, we can use SvelteKit's [sequence function](https://kit.svelte.dev/docs/modules#sveltejs-kit-hooks-sequence).

### Update types

`createRequestHandler` adds properties to the `event.locals` object. When using TypeScript, we should add these to our app's [`App.Locals`](https://kit.svelte.dev/docs/types#app-locals) interface.

```ts
// app.d.ts
import type {LoaderLocals} from '@sanity/svelte-loader'

declare global {
  namespace App {
    interface Locals extends LoaderLocals {}
  }
}

export {}
```

### Client side preview state

To access the preview state on the client side of our application, we pass it via a load function. Typically, the root level layout is a good place to do this. We return the value of `locals.preview` that the previously created `handle` function defines for us.

```ts
// src/routes/+layout.server.ts
import type {LayoutServerLoad} from './$types'

export const load: LayoutServerLoad = ({locals: {preview}}) => {
  return {preview}
}
```

We then access the passed `preview` value via the `LoadEvent.data` property, and set the preview state using the loader's `setPreviewing` function.

```ts
// src/routes/+layout.ts
import {setPreviewing} from '@sanity/svelte-loader'
import type {LayoutLoad} from './$types'

export const load: LayoutLoad = ({data: {preview}}) => {
  setPreviewing(preview)
}
```

We can now import `isPreviewing` (a [readonly Svelte store](https://svelte.dev/docs/svelte-store#readonly)) anywhere in our app. For example, in a component to display if previews are enabled or disabled:

```svelte
<!-- src/components/DisplayPreview.svelte -->
<script lang="ts">
  import {isPreviewing} from '@sanity/svelte-loader'
</script>

{#if $isPreviewing}
  <div>Previews Enabled</div>
{:else}
  <div>Previews Disabled</div>
{/if}
```

### Define queries

Next, create a `queries` file and define a GROQ query and associated result type. This example query is used to fetch a single page with a matching slug.

```ts
// src/lib/queries.ts
export const pageQuery = `*[_type == "page" && slug.current == $slug][0]`

export interface PageResult {
  title: string
  // ...etc
}
```

### Create a Svelte page and data loader

#### loadQuery

Create a server `load` function for our page that will handle fetching data from the Sanity Content Lake. Use `locals.loadQuery` to fetch data on the server.

```ts
// src/routes/[slug]/+page.server.ts
import {pageQuery, type PageResult} from '$lib/queries'
import type {PageServerLoad} from './$types'

export const load: PageServerLoad = async ({params, locals: {loadQuery}}) => {
  const {slug} = params

  const initial = await loadQuery<PageResult>(pageQuery, {slug})

  return {initial, params: {slug}}
}
```

#### useQuery

Next, create the page component. We use `useQuery` on the client, passing the initial data and route parameters that were returned by the `load` function. When live editing is enabled, `useQuery` will provide near instant updates from Content Lake and seamless switching between draft and published content.

`useQuery` also returns an `encodeDataAttribute` helper method for generating `data-sanity` attributes to support rendering [overlays](https://www.sanity.io/docs/loaders-and-overlays#1dbcc04a7093).

```svelte
<!-- src/routes/[slug]/+page.svelte -->
<script lang="ts">
  import {useQuery} from '@sanity/svelte-loader'
  import {pageQuery, type PageResult} from '$lib/queries'
  import type {PageData} from './$types'

  export let data: PageData
  const {initial, params} = data

  const query = useQuery<PageResult>(pageQuery, params, {initial})

  const studioUrl = 'https://my.sanity.studio'

  $: ({data: page, loading, encodeDataAttribute} = $query)
</script>

{#if loading}
  <div>Loading...</div>
{:else}
  <h1 data-sanity={encodeDataAttribute(['title'])}>
    {page.title}
  </h1>
{/if}
```

### Setup Visual Editing

Finally, we enable both live mode and overlays in the root layout component.

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import {useLiveMode} from '@sanity/svelte-loader'
  import {enableVisualEditing} from '@sanity/visual-editing'
  import {PUBLIC_SANITY_STUDIO_URL} from '$env/static/public'
  import {client} from '$lib/sanity'
  import {onMount} from 'svelte'

  onMount(() => enableVisualEditing())

  onMount(() =>
    useLiveMode({
      // If `stega.studioUrl` was not provided to the client instance in `sanity.ts`, a studioUrl should be provided here
      studioUrl: PUBLIC_SANITY_STUDIO_URL,
      // ...or alternatively provide the stega client directly
      // client: client.withConfig({
      //   stega: true
      // })
    }),
  )
</script>

<div class="app">
  <slot />
</div>
```

[gzip-badge]: https://img.shields.io/bundlephobia/minzip/@sanity/svelte-loader?label=gzip%20size&style=flat-square
[size-badge]: https://img.shields.io/bundlephobia/min/@sanity/svelte-loader?label=size&style=flat-square
[bundlephobia]: https://bundlephobia.com/package/@sanity/svelte-loader


