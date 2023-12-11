# @sanity/svelte-loader

[![npm stat](https://img.shields.io/npm/dm/@sanity/svelte-loader.svg?style=flat-square)](https://npm-stat.com/charts.html?package=@sanity/svelte-loader)
[![npm version](https://img.shields.io/npm/v/@sanity/svelte-loader.svg?style=flat-square)](https://www.npmjs.com/package/@sanity/svelte-loader)
[![gzip size][gzip-badge]][bundlephobia]
[![size][size-badge]][bundlephobia]

```sh
npm install @sanity/svelte-loader @sanity/client
npm install --save-dev svelte@^4
```

## Usage

### Setup Sanity loaders for server and client side fetching

The loader file will run both on the client and server, it creates a query store and exports some useful methods we will use to query data and enable Live Mode.

```ts
// .src/lib/loader.ts
import { createQueryStore } from '@sanity/svelte-loader'

export const { loadQuery, useQuery, setServerClient, useLiveMode } =
  createQueryStore({ client: false, ssr: true })
```

The server loader file will run exclusively on the server. Here we set the Sanity client instance we want to use to fetch data server-side and re-export the `loadQuery` function, which will be used to execute queries.

```ts
// .src/lib/loader.server.ts
import { createClient } from '@sanity/client/stega'
import { loadQuery, setServerClient } from './loader'

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  useCdn: false,
  apiVersion: process.env.SANITY_API_VERSION,
  // Optionally enable stega
  // stega: { ... }
})

setServerClient(client)

export { loadQuery }
```

For clarity, we are exporting our queries and return types from a single `queries` file.

```ts
// .src/lib/queries.ts
export const pageQuery = `*[_type == "page"][0]`

export interface MyPage {
  title: string
  // ...etc
}
```

### Create a Svelte page component with data loaders

Now we can set up our Svelte route level `load` functions. On the server, we use `loadQuery` to perform initial data fetching.

```ts
// ./src/routes/+page.server.ts
import { pageQuery, type MyPage } from '$lib/queries'
import { loadQuery } from '$lib/loader.server'
import type { PageLoad } from './$types'

export const load: PageLoad = () => {
  return loadQuery<MyPage>(pageQuery)
}
```

On the client side (note `ssr = false`) we use `useQuery` for data fetching. The `load` function receives the initial server fetched data and passes it to `useQuery`. When we enable Live Mode, `useQuery` will handle data refetching and instant updates.

```ts
// ./src/routes/+page.ts
import { pageQuery, type MyPage } from '$lib/queries'
import { useQuery } from '$lib/loader'
import type { PageLoad } from './$types'

export const ssr = false

export const load: PageLoad = ({ data }) => {
  return useQuery<MyPage>(pageQuery, {}, { initial: data })
}
```

Finally, we can use the loaded data to render our page. We also use `useEncodeDataAttribute` for generating `data-sanity` attibutes to support rendering Overlays in our application. [See the docs for more information](https://www.sanity.io/docs/loaders-and-overlays#26cf681fadd4).

Note that for clarity we are enabling Overlays and Live Mode at the page level. In practice this would likely be done at the app or layout level to provide a visual editing experience across multiple pages.

```svelte
<script lang="ts">
  import { onMount } from 'svelte'
  import { useEncodeDataAttribute } from '@sanity/svelte-loader'
  import { createClient } from '@sanity/client/stega'
  import { enableOverlays } from '@sanity/overlays'
  import type { PageData } from './$types'
  import { useLiveMode } from '$lib/sanity.loader'
  import { client } from '$lib/sanity'

  export let data: PageData

  const studioUrl = 'https://my.sanity.studio'

  $: ({ data: page, loading, sourceMap } = $data)

  $: encodeDataAttribute = useEncodeDataAttribute(
    page,
    sourceMap,
    studioUrl,
  )

  onMount(() => {
    return enableOverlays()
  })

  const client = createClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET,
    useCdn: true,
    apiVersion: process.env.SANITY_API_VERSION,
    // Optionally enable stega
    // stega: { ... }
  })

  onMount(() => {
    return useLiveMode({
      allowStudioOrigin: studioUrl,
      client,
    })
  })
</script>

{#if loading}
  <div>Loading...</div>
{:else}
  <h1 data-sanity={encodeDataAttribute(['title'])}>
    {page.title}
  </h1>
{/if}
```

[gzip-badge]: https://img.shields.io/bundlephobia/minzip/@sanity/svelte-loader?label=gzip%20size&style=flat-square
[size-badge]: https://img.shields.io/bundlephobia/min/@sanity/svelte-loader?label=size&style=flat-square
[bundlephobia]: https://bundlephobia.com/package/@sanity/svelte-loader
