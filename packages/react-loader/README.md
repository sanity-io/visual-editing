# @sanity/react-loader

[![npm stat](https://img.shields.io/npm/dm/@sanity/react-loader.svg?style=flat-square)](https://npm-stat.com/charts.html?package=@sanity/react-loader)
[![npm version](https://img.shields.io/npm/v/@sanity/react-loader/pink-lizard.svg?style=flat-square)](https://www.npmjs.com/package/@sanity/react-loader)
[![gzip size][gzip-badge]][bundlephobia]
[![size][size-badge]][bundlephobia]

> **Warning**
>
> This is an experimental package. Breaking changes may be introduced at any time. It's not production ready.

```sh
npm i --save-exact @sanity/react-loader@pink-lizard @sanity/client@pink-lizard react@^18.2
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
  query,
  setServerClient,
  // Used only client side
  useQuery,
  useLiveMode,
} = createQueryStore({ client: false, ssr: true })
```

Later in the server side of the app, you setup the client. The `.server.ts` suffix on Remix ensures that this file is only loaded on the server, and it avoids adding `@sanity/client` to the browser bundle in production.

```ts
// ./src/app/sanity.loader.server.ts
import { createClient } from '@sanity/client/stega'
import { setServerClient, query } from './sanity.loader'

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
export { query }
```

Then somewhere in your app, you can use the `query` and `useQuery` utilities together. `useQuery` now only fetches data when Live Mode is active. Otherwise it's `query` that is used.

```tsx
// ./src/app/routes/products.$slug.tsx

import { Link, useLoaderData, useParams } from '@remix-run/react'
import { json, type LoaderFunction } from '@remix-run/node'
import { query } from '~/sanity.loader.server'
import { useQuery } from '~/sanity.loader'

interface Product {}
const queryProduct = `*[_type == "product" && slug.current == $slug][0]`

export const loader: LoaderFunction = async ({ params }) => {
  return json({
    params,
    initial: await query<Product>(queryProduct, params),
  })
}

export default function ShoePage() {
  const { params, initial } = useLoaderData<typeof loader>()

  if (!params.slug || !initial.data?.slug?.current) {
    throw new Error('No slug, 404?')
  }

  const { data } = useQuery<Product>(queryProduct, params, { initial })

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

// Only a Studio from this origin is allowed to connect to overlays and initiate live mode, it's also used to build Stega encoded source links that can take you from the application to the Studio
const allowStudioOrigin = 'https://my.sanity.studio'

// A browser client for Live Mode, it's only part of the browser bundle when the `VisualEditing` component is lazy loaded with `React.lazy`
const client = createClient({
  projectId: window.ENV.SANITY_PROJECT_ID,
  dataset: window.ENV.SANITY_DATASET,
  useCdn: true,
  apiVersion: window.ENV.SANITY_API_VERSION,
  stega: {
    enabled: true,
    studioUrl: allowStudioOrigin,
  },
})

export default function VisualEditing() {
  useEffect(
    () =>
      enableOverlays({
        allowStudioOrigin,
        history: {
          // setup Remix router integration
        },
      }),
    [],
  )

  useLiveMode({ allowStudioOrigin, client })

  return null
}
```

## Visual Editing

### @sanity/overlays

Link to @sanity/overlays README with setup.

Show how to use `jsx` utils.

Alternatively show how to set `data-sanity` attributes.

### Vercel Visual Editing

Show how to enable stega in strings.

[gzip-badge]: https://img.shields.io/bundlephobia/minzip/@sanity/react-loader@pink-lizard?label=gzip%20size&style=flat-square
[size-badge]: https://img.shields.io/bundlephobia/min/@sanity/react-loader@pink-lizard?label=size&style=flat-square
[bundlephobia]: https://bundlephobia.com/package/@sanity/react-loader@pink-lizard

```

```
