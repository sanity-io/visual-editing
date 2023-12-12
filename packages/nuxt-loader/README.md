# @sanity/nuxt-loader

[![npm stat](https://img.shields.io/npm/dm/@sanity/nuxt-loader.svg?style=flat-square)](https://npm-stat.com/charts.html?package=@sanity/nuxt-loader)
[![npm version](https://img.shields.io/npm/v/@sanity/nuxt-loader.svg?style=flat-square)](https://www.npmjs.com/package/@sanity/nuxt-loader)
[![gzip size][gzip-badge]][bundlephobia]
[![size][size-badge]][bundlephobia]

```sh
npm install @sanity/nuxt-loader @sanity/client
npm install --save-dev nuxt@^3
```

## Usage

Setup composables for querying content

```ts
// ./src/sanity.composables.ts
import {
  createQueryStore,
  useEncodeDataAttribute,
  type UseQueryOptions,
} from '@sanity/nuxt-loader'
import type { QueryParams } from 'sanity'

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  useCdn: true,
  apiVersion: process.env.SANITY_API_VERSION,
})

const { useQuery: _useQuery, useLiveMode } = createQueryStore({ client })

const useQuery = async <
  QueryResponseResult = unknown,
  QueryResponseError = unknown,
>(
  key: string,
  query: string,
  params: QueryParams = {},
  options: UseQueryOptions = {},
) => {
  const snapshot = await _useQuery<QueryResponseResult, QueryResponseError>(
    key,
    query,
    params,
    options,
  )

  const encodeDataAttribute = useEncodeDataAttribute(
    snapshot.data,
    snapshot.sourceMap,
    studioUrl: 'https://my.sanity.studio',
  )

  return {
    ...snapshot,
    encodeDataAttribute,
  }
}
export { useQuery, useLiveMode }
```

Note that for clarity we are enabling Overlays and Live Mode at the page level. In practice this would likely be done at the app or layout level to provide a visual editing experience across multiple pages.

```vue
<template>
  <div>
    <h1 :data-sanity="encodeDataAttribute(['title'])">
      {{ data.title }}
    </h1>
  </div>
</template>

<script setup lang="ts">
import { useQuery, useLiveMode } from '~/sanity.composables'
import { type DisableOverlays, enableOverlays } from '@sanity/overlays'

interface MyPage {}
const query = `*[_type == "page"][0]`

// Fetch content using your useQuery composable
const { data, loading, encodeDataAttribute } = await useQuery<MyPage>(
  'my-page', // a unique key for this query
  query,
)

const allowStudioOrigin = 'https://my.sanity.studio'

// Enable live mode
let disableLiveMode: ReturnType<typeof useLiveMode> | undefined
onMounted(() => {
  disableLiveMode = useLiveMode({ allowStudioOrigin })
})
onUnmounted(() => disableLiveMode?.())

// Enable overlays
let disableOverlays: DisableOverlays | undefined
onMounted(() => {
  disableOverlays = enableOverlays()
})
onUnmounted(() => disableOverlays?.())
</script>
```

[gzip-badge]: https://img.shields.io/bundlephobia/minzip/@sanity/nuxt-loader?label=gzip%20size&style=flat-square
[size-badge]: https://img.shields.io/bundlephobia/min/@sanity/nuxt-loader?label=size&style=flat-square
[bundlephobia]: https://bundlephobia.com/package/@sanity/nuxt-loader
