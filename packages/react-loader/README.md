# @sanity/react-loader

[![npm stat](https://img.shields.io/npm/dm/@sanity/react-loader.svg?style=flat-square)](https://npm-stat.com/charts.html?package=@sanity/react-loader)
[![npm version](https://img.shields.io/npm/v/@sanity/react-loader.svg?style=flat-square)](https://www.npmjs.com/package/@sanity/react-loader)
[![gzip size][gzip-badge]][bundlephobia]
[![size][size-badge]][bundlephobia]

```sh
npm install @sanity/react-loader @sanity/client react@^18.2
```

## Usage

### Server only production data fetching, client side Live Mode

By default data is fetched on both the server, and on the client after hydration.
For private datasets, or other similar use cases, it may be desirable to only fetch data on the server when Live Mode is not enabled.

For this to work you'll first have to setup a shared file that is loaded both on the server and the client, which sets `ssr: true` and defers setting the client to later by setting `client: false`. The snippets are for a Remix application

```ts
// ./src/app/sanity.loader.ts
import { createQueryStore } from '@sanity/react-loader'

export const {
  // Used only server side
  loadQuery,
  setServerClient,
  // Used only client side
  useQuery,
  useLiveMode,
} = createQueryStore({ client: false, ssr: true })
```

You can also use the top-level shortcuts for the same effect:

```ts
// ./src/app/sanity.loader.ts

export {
  // Used only server side
  loadQuery,
  setServerClient,
  // Used only client side
  useQuery,
  useLiveMode,
} from '@sanity/react-loader'
```

Later in the server side of the app, you setup the client. The `.server.ts` suffix on Remix ensures that this file is only loaded on the server, and it avoids adding `@sanity/client` to the browser bundle in production.

```ts
// ./src/app/sanity.loader.server.ts
import { createClient } from '@sanity/client/stega'
import { setServerClient, loadQuery } from './sanity.loader'

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  useCdn: true,
  apiVersion: process.env.SANITY_API_VERSION,
  stega: {
    enabled: true,
    studioUrl: 'https://my.sanity.studio',
  },
})

setServerClient(client)

// Re-export for convenience
export { loadQuery }
```

Then somewhere in your app, you can use the `loadQuery` and `useQuery` utilities together. `useQuery` now only fetches data when Live Mode is active. Otherwise it's `loadQuery` that is used.

```tsx
// ./src/app/routes/products.$slug.tsx

import { Link, useLoaderData, useParams } from '@remix-run/react'
import { json, type LoaderFunction } from '@remix-run/node'
import { loadQuery } from '~/sanity.loader.server'
import { useQuery } from '~/sanity.loader'

interface Product {}
const query = `*[_type == "product" && slug.current == $slug][0]`

export const loader: LoaderFunction = async ({ params }) => {
  return json({
    params,
    initial: await loadQuery<Product>(query, params),
  })
}

export default function ProductPage() {
  const { params, initial } = useLoaderData<typeof loader>()

  if (!params.slug || !initial.data?.slug?.current) {
    throw new Error('No slug, 404?')
  }

  const { data } = useQuery<Product>(query, params, { initial })

  // Use `data` in your view, it'll mirror what the loader returns in production mode,
  // while Live Mode it becomes reactive and respons in real-time to your edits in the Presentation tool.
  return <ProductTemplate data={data} />
}
```

Enabling Live Mode is done by adding `useLiveMode` to the same component you're currently calling `enableOverlays` from `@sanity/overlays`:

```tsx
// ./src/app/VisualEditing.tsx
import { enableOverlays, type HistoryUpdate } from '@sanity/overlays'
import { useEffect } from 'react'
import { useLiveMode } from '~/sanity.loader'

// A browser client for Live Mode, it's only part of the browser bundle when the `VisualEditing` component is lazy loaded with `React.lazy`
const client = createClient({
  projectId: window.ENV.SANITY_PROJECT_ID,
  dataset: window.ENV.SANITY_DATASET,
  useCdn: true,
  apiVersion: window.ENV.SANITY_API_VERSION,
  stega: {
    enabled: true,
    studioUrl: 'https://my.sanity.studio',
  },
})

export default function VisualEditing() {
  useEffect(
    () =>
      enableOverlays({
        history: {
          // setup Remix router integration
        },
      }),
    [],
  )

  useLiveMode({ client })

  return null
}
```

### Adding overlays to any element

You can use the `encodeDataAttribute` function returned by `useQuery` to create `data-json` attributes, that are picked up by `@sanity/overlays`.
This allows you to link to elements that otherwise isn't automatically linked to using `@sanity/client/stega`, such as array root item, or an image field.

If you aren't using stega and don't have a `studioUrl` defined in the `createClient` call, then you add it to the `useLiveMode` hook:

```diff
-useLiveMode({ client })
+useLiveMode({ client, studioUrl: 'https://my.sanity.studio' })
```

You then use it in your template:

```tsx
// ./src/app/routes/products.$slug.tsx

import { Link, useLoaderData, useParams } from '@remix-run/react'
import { json, type LoaderFunction } from '@remix-run/node'
import { useQuery } from '@sanity/react-loader'
import { loadQuery } from '~/sanity.loader.server'

interface Product {}
const query = `*[_type == "product" && slug.current == $slug][0]`

export const loader: LoaderFunction = async ({ params }) => {
  return json({
    params,
    initial: await loadQuery<Product>(query, params),
  })
}

export default function ProductPage() {
  const { params, initial } = useLoaderData<typeof loader>()

  if (!params.slug || !initial.data?.slug?.current) {
    throw new Error('No slug, 404?')
  }

  const { data, encodeDataAttribute } = useQuery<Product>(query, params, {
    initial,
  })

  // Use `data` in your view, it'll mirror what the loader returns in production mode,
  // while Live Mode it becomes reactive and respons in real-time to your edits in the Presentation tool.
  // And `encodeDataAttribute` is a helpful utility for adding custom `data-sanity` attributes.
  return (
    <ProductTemplate data={data} encodeDataAttribute={encodeDataAttribute} />
  )
}
```

You use `encodeDataAttribute` by giving it a path to the data you want to be linked to, or open in the Studio when in the Presentation tool.

```tsx
// ./src/app/templates/product.tsx
import { StudioPathLike } from '@sanity/react-loader'

interface Product {}

interface Props {
  data: Product
  encodeDataAttribute: (path: StudioPathLike) => string | undefined
}
export default function ProductTemplate(props: Props) {
  const { data, encodeDataAttribute } = props
  return (
    <>
      <img
        // Adding this attribute makes sure the image is always clickable in the Presentation tool
        data-sanity={encodeDataAttribute('image')}
        src={urlFor(data.image.asset).url()}
        // other props
      />
    </>
  )
}
```

[gzip-badge]: https://img.shields.io/bundlephobia/minzip/@sanity/react-loader?label=gzip%20size&style=flat-square
[size-badge]: https://img.shields.io/bundlephobia/min/@sanity/react-loader?label=size&style=flat-square
[bundlephobia]: https://bundlephobia.com/package/@sanity/react-loader
