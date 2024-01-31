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

# You will also need the following dependencies for fetching data and enabling visual editing
npm install @sanity/client @sanity/overlays
```

## Usage

Use the steps below with an existing or [new SvelteKit app](https://kit.svelte.dev/docs/creating-a-project) to enable visual editing using the Svelte loader.

### Define environment variables

Create a `.env` file in the project's root directory and provide the following environment variables. The token should not be exposed on the client, so the `PUBLIC_` prefix is omitted.

```bash
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
import { createClient } from '@sanity/client/stega'
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
  // Optionally provide stega configuration
  // stega: {
  //   studioUrl: PUBLIC_SANITY_STUDIO_URL,
  // },
})
```

On the server, we use a Sanity client configured with a read token, CDN disabled and specified perspective to allow the fetching of draft content. We pass this client instance to `setServerClient` in the [server hooks](https://kit.svelte.dev/docs/hooks#server-hooks) file as this code will only be executed once during app initialization.

```ts
// src/hooks.server.ts
import { client } from './sanity'
import { setServerClient } from '@sanity/svelte-loader'
import { SANITY_API_READ_TOKEN } from '$env/static/private'

setServerClient(
  client.withConfig({
    token: SANITY_API_READ_TOKEN,
    useCdn: false,
    perspective: 'previewDrafts',
  }),
)
```

### Define queries

Next, create a `queries` file and define a GROQ query (and corresponding TypeScript type). This example query is used to fetch a single page with a matching slug.

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

First, create a server `load` function that will handle fetching data from the Sanity Content Lake. Use `loadQuery` to fetch data on the server.

```ts
// /src/routes/[slug]/+page.server.ts
import { loadQuery } from '@sanity/svelte-loader'
import { pageQuery, type PageResult } from '$lib/queries'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const { slug } = params

  const initial = await loadQuery<PageResult>(pageQuery, { slug })

  return { initial, params: { slug } }
}
```

#### useQuery

Next, create the page component. We use `useQuery` on the client, passing the initial data and route parameters that were returned by the `load` function. When live editing is enabled, `useQuery` will provide near instant updates from Content Lake and seamless switching between draft and published content.

`useQuery` also returns an `encodeDataAttribute` helper method for generating `data-sanity` attributes to support rendering [overlays](https://www.sanity.io/docs/loaders-and-overlays#1dbcc04a7093).

```svelte
<!-- /src/routes/[slug]/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types'
  import { useQuery } from '@sanity/svelte-loader'
  import { pageQuery, type PageResult } from '$lib/queries'

  export let data: PageData
  const { initial, params } = data;

  const query = useQuery<PageResult>(pageQuery, params, { initial })

  const studioUrl = 'https://my.sanity.studio'

  $: ({ data: page, loading, encodeDataAttribute } = $query)
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

Finally, we enable both live mode andoverlays in the root layout component.

```svelte
<!-- /src/routes/+layout.svelte -->
<script lang="ts">
  import { onMount } from 'svelte'
  import { enableOverlays } from '@sanity/overlays'
  import { useLiveMode } from '@sanity/svelte-loader'
  import { client } from '$lib/sanity'
  import { PUBLIC_SANITY_STUDIO_URL } from '$env/static/public'

  onMount(() => enableOverlays())

  onMount(() => useLiveMode({
    // If `stega.studioUrl` was not provided to the client instance in `sanity.ts`, a studioUrl should be provided here
    studioUrl: PUBLIC_SANITY_STUDIO_URL
    // ...or alternatively provide the stega client directly
    // client: client.withConfig({
    //   stega: { ...client.config().stega, enabled: true },
    // })
  }))
</script>

<div class="app">
  <slot />
</div>
```

[gzip-badge]: https://img.shields.io/bundlephobia/minzip/@sanity/svelte-loader?label=gzip%20size&style=flat-square
[size-badge]: https://img.shields.io/bundlephobia/min/@sanity/svelte-loader?label=size&style=flat-square
[bundlephobia]: https://bundlephobia.com/package/@sanity/svelte-loader
