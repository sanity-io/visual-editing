# @sanity/visual-editing

[![npm stat](https://img.shields.io/npm/dm/@sanity/visual-editing.svg?style=flat-square)](https://npm-stat.com/charts.html?package=@sanity/visual-editing)
[![npm version](https://img.shields.io/npm/v/@sanity/visual-editing.svg?style=flat-square)](https://www.npmjs.com/package/@sanity/visual-editing)
[![gzip size][gzip-badge]][bundlephobia]
[![size][size-badge]][bundlephobia]

This package is used with the [Presentation](https://www.sanity.io/docs/presentation) tool in the Sanity Studio to create clickable elements to take editors right from previews to the document and field they want to edit.

## Getting started

```sh
npm install @sanity/visual-editing react react-dom
```

## Table of contents

- [Usage](#usage)
  - [Plain JS](#plain-js)
  - [Next.js](#nextjs)
    - [App Router](#app-router)
    - [Pages Router](#pages-router)
  - [Remix](#remix)
  - [React.js](#reactjs)
- [Refresh API](#refresh-api)
  - [Plain JS](#plain-js-1)
    - [`source: 'manual'`](#source-manual)
    - [`source: 'mutation'`](#source-mutation)
  - [Next.js App Router](#nextjs-app-router)
    - [`source: 'manual'`](#source-manual-1)
    - [`source: 'mutation'`](#source-mutation-1)
  - [Remix](#remix-1)
  - [SvelteKit](#sveltekit)
- [Manually configuring "Edit in Sanity Studio" elements](#manually-configuring-edit-in-sanity-studio-elements)
  - [`data-sanity-edit-target`](#data-sanity-edit-target)
- [Change the z-index of overlay elements](#change-the-z-index-of-overlay-elements)

## Usage

### Plain JS

```ts
import {enableVisualEditing} from '@sanity/visual-editing'

// Enables visual editing overlays
enableVisualEditing()

// Integrate with a router that uses the History API
enableVisualEditing({
  history: {
    subscribe: (navigate) => {
      const handler = (event: PopStateEvent) => {
        navigate({
          type: 'push',
          url: `${location.pathname}${location.search}`,
        })
      }
      window.addEventListener('popstate', handler)
      return () => window.removeEventListener('popstate', handler)
    },
    update: (update) => {
      switch (update.type) {
        case 'push':
          return window.history.pushState(null, '', update.url)
        case 'pop':
          return window.history.back()
        case 'replace':
          return window.history.replaceState(null, '', update.url)
        default:
          throw new Error(`Unknown update type: ${update.type}`)
      }
    },
  },
})
```

### Next.js

If you're using Next v13 or later you can use first class components that integrate with the router. Depending on which router you're using you may use either, or both, of the following components.

#### App Router

For App Router you should use the `VisualEditing` component from `next-sanity`:

```sh
npm i next-sanity
```

In your root `layout.tsx`, assuming you're using [Draft Mode](https://nextjs.org/docs/app/building-your-application/configuring/draft-mode) to toggle when to enable Visual Editing, add the `VisualEditing` component:

```tsx
import {VisualEditing} from 'next-sanity'
import {draftMode} from 'next/headers'

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>
        {children}
        {draftMode().isEnabled && (
          <VisualEditing
            zIndex={1000} // Optional
          />
        )}
      </body>
    </html>
  )
}
```

#### Pages Router

For Pages Router you should use the `VisualEditing` from `@sanity/visual-editing/next-pages-router`. Assuming you're using [Draft Mode](https://nextjs.org/docs/pages/building-your-application/configuring/draft-mode) or [Preview Mode](https://nextjs.org/docs/pages/building-your-application/configuring/preview-mode) to toggle when to enable Visual Editing, add the `VisualEditing` component to your `_app.tsx`:

```tsx
import {VisualEditing} from '@sanity/visual-editing/next-pages-router'
import type {AppProps} from 'next/app'
import {useRouter} from 'next/router'

export default function App({Component, pageProps}: AppProps) {
  const {isPreview} = useRouter()
  // A common alternative pattern to `isPreview` and `useRouter` is to pass down the draftMode/preview from getStaticProps/getServerSideProps/getInitialProps
  // const { draftMode } = pageProps
  return (
    <>
      <Component {...pageProps} />
      {isPreview && (
        <VisualEditing
          zIndex={1000} // Optional
        />
      )}
    </>
  )
}
```

### Remix

For Remix apps you should use `VisualEditing` from `@sanity/visual-editing/remix` in your `app/root.tsx`:

```tsx
import {json} from '@remix-run/node'
import {Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData} from '@remix-run/react'
import {VisualEditing} from '@sanity/visual-editing/remix'

export const loader = () => {
  return json({
    ENV: {
      SANITY_VISUAL_EDITING_ENABLED: process.env.SANITY_VISUAL_EDITING_ENABLED === 'true',
    },
  })
}

export default function App() {
  const {ENV} = useLoaderData<typeof loader>()

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <main>
          <Outlet />
        </main>
        {ENV.SANITY_VISUAL_EDITING_ENABLED && (
          <VisualEditing
            zIndex={1000} // Optional
          />
        )}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
```

### React.js

On React apps that don't have a first-class framework integration may use the `enableVisualEditing` function directly in a `useEffect` hook.

```tsx
import { enableVisualEditing } from '@sanity/visual-editing'
import { useEffect } from 'react'

export default function VisualEditing() {
  useEffect(() => {
    const disable = enableVisualEditing({
      history: {} // recommended, integrate your router here so it works with the URL bar in Presentation
      zIndex: 1000, // optional
    })
    return () => disable()
  }, [])

  return null
}
```

## Refresh API

The refresh API is complimentary to the [Loaders][loaders] and [Preview Kit][preview-kit] APIs. It's used to refresh the page when the user has made changes to the document in the Studio and wants to see the changes reflected in the preview or when clicking on the "Refresh" button in the Presentation Tool UI.
For some frameworks, like Next.js App Router, Remix and soon SvelteKit, there's first-class implementations of the refresh API that does what you want out of the box, while still allowing you to customize it if you need to.

- When to use:
  - When you're using a framework that has a refresh API that provides a better experience than a full page reload.
    - [Next.js App Router][next-app-router]
    - [Remix][remix]
    - [SvelteKit][sveltekit]
  - You have data fetching used in your app that it's either impractical or too costly to refactor to use [Loaders][loaders] or [Preview Kit][preview-kit].
  - You have other data fetching than Content Lake GROQ queries, for example GraphQL or REST APIs that you want to refresh.
- When not to use
  - If you're using a framework without a first-class refresh API.
  - You're already using [Loaders][loaders] or [Preview Kit][preview-kit] for all your data fetching.

The TypeScript signature for the API is:

```ts
interface VisualEditingOptions {
  refresh?: (payload: HistoryRefresh) => false | Promise<void>
}
type HistoryRefresh =
  | {
      source: 'manual'
      livePreviewEnabled: boolean
    }
  | {
      source: 'mutation'
      livePreviewEnabled: boolean
      document: {
        _id: string
        _type: string
        _rev: string
        slug?: {
          current?: string | null
        }
      }
    }
```

Returning `false` will trigger the default behavior, which is different depending on the `source` and `livePreviewEnabled` state.
Returning a Promise will report to Presentation Tool that a refresh is happening and will show a loading UI while the Promise is pending.

### Plain JS

#### `source: 'manual'`

It's fired when the user clicks on the "Refresh" button in the Presentation Tool.
The default behavior is effectively the same as `window.location.reload()`.

#### `source: 'mutation'`

The default behavior is to return `false`, as we can't make any assumptions of what the default behavior should be for your app if we don't know what framework you're using.

The payload will contain `livePreviewEnabled` and `document` properties.
`livePreviewEnabled` is true if either [Loaders][loaders] are detected to be setup in Live Mode, or if [Preview Kit][preview-kit] is enabled.
It allows you to chose a reload strategy based on wether the route you're on has live preview functionality or not, allowing you to incrementally adopt [Loaders][loaders] or [Preview Kit][preview-kit] without having to refactor all your data fetching at once.

The `document` part of the payload contains the `_id`, `_type`, `_rev` and `slug` properties of the document that was changed in the Studio. Depending on your app, you may want to use this information to decide if you want to refresh the page or not as well as which API to use.

### [Next.js App Router][next-app-router]

> [!NOTE]
> There's no default refresh API for Pages Router, as it doesn't have a first-class refresh API like App Router or Remix. But you can still use the `refresh` option to implement your own refresh logic by using the `refresh` prop on the `<VisualEditing />` component provided by `@sanity/visual-editing/next-pages-router`.

For App Router you should use the `VisualEditing` component from `next-sanity`:

```sh
npm i next-sanity
```

The implementation makes use of [Server Actions][server-actions], here's the default internal implementation (simplified):

```tsx
// app/layout.tsx
import {VisualEditing} from 'next-sanity'
import {revalidatePath, revalidateTag} from 'next/cache'
import {draftMode} from 'next/headers'

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head />
      <body>
        {children}
        {draftMode().isEnabled && (
          <VisualEditing
            refresh={async (payload) => {
              'use server'
              // Guard against a bad actor attempting to revalidate the page
              if (!draftMode().isEnabled) {
                return
              }
              if (payload.source === 'manual') {
                await revalidatePath('/', 'layout')
              }
              // Only revalidate on mutations if the route doesn't have loaders or preview-kit
              if (payload.source === 'mutation' && !payload.livePreviewEnabled) {
                await revalidatePath('/', 'layout')
              }
            }}
          />
        )}
      </body>
    </html>
  )
}
```

#### `source: 'manual'`

If your application is using `revalidateTag` then it's common to add the tag `all` to all data fetches. If you follow this pattern then you can reduce the impact of a manual refresh by using it here as well:

```tsx
<VisualEditing
  refresh={async (payload) => {
    'use server'
    // Guard against a bad actor attempting to revalidate the page
    if (!draftMode().isEnabled) {
      return
    }
    if (payload.source === 'manual') {
      await revalidateTag('all')
    }
  }}
/>
```

#### `source: 'mutation'`

If you're using `revalidateTag`, [and the GROQ webhook pattern][https://github.com/sanity-io/next-sanity#tag-based-revalidation-webhook], then you can reuse it here on route level as well:

```tsx
<VisualEditing
  refresh={async (payload) => {
    'use server'
    // Guard against a bad actor attempting to revalidate the page
    if (!draftMode().isEnabled) {
      return
    }
    if (payload.source === 'manual') {
      await revalidateTag('all')
    }
    if (payload.source === 'mutation') {
      // Call `revalidateTag` in the same way as ./app/api/revalidate/route.ts
      await revalidateTag(payload.document._type)
    }
  }}
/>
```

You can use `payload.livePreviewEnabled` and `payload.document` to better target scenarios where you want to `revalidateTag` or when it may already be handled by a `useQuery` hook from `@sanity/react-loader` already, or a `useLiveQuery` hook from `next-sanity/preview` or `@sanity/preview-kit`.

### [Remix][remix]

For Remix apps the implementation is much like the one for [Next.js App Router][next-app-router] when it comes to what happens depending on the `source` and `livePreviewEnabled` properties of the payload.

Remix doesn't have [Server Actions][server-actions] yet, under the hood the [`useRevalidator`](https://remix.run/docs/en/main/hooks/use-revalidator) hook is used. Here's the default internal implementation (simplified):

```tsx
// app/root.tsx
import {useRevalidator} from '@remix-run/react'
import {VisualEditing} from '@sanity/visual-editing/remix'

export default function App() {
  const {ENV} = useLoaderData<typeof loader>()
  const revalidator = useRevalidator()

  return (
    <html lang="en">
      <body>
        <Outlet />
        {ENV.SANITY_VISUAL_EDITING_ENABLED && (
          <VisualEditing
            refresh={(payload) => {
              if (payload.source === 'manual') {
                revalidator.revalidate()
              }
              if (payload.source === 'mutation' && !payload.livePreviewEnabled) {
                revalidator.revalidate()
              }
            }}
          />
        )}
      </body>
    </html>
  )
}
```

If you only want to configure **when** revalidation is called, and not the actual implementation, then you can call the `refreshDefault` function so you don't have to handle `useRevalidator` and its loading states yourself.

```tsx
<VisualEditing
  refresh={(payload, refreshDefault) => {
    if (payload.source === 'manual') {
      return refreshDefault()
    }
    // Always revalidate on mutations for document types that are used for MetaFunctions that render in <head />
    if (payload.source === 'mutation' && payload.document._type === 'settings') {
      return refreshDefault()
    }
  }}
/>
```

### [SvelteKit][sveltekit]

A first class implementation for SvelteKit is coming soon.

## Manually configuring "Edit in Sanity Studio" elements

### `data-sanity-edit-target`

You can choose which element to render the "Edit in Sanity Studio" buttons on by adding a `data-sanity-edit-target` attribute to the element you want to be clickable. This allows you to move the edit container to a parent wrapper element.

In this example, by default the edit button would be placed on the `<h1>` tag

```html
<section>
  <h1>{dynamicTitle}</h1>
  <div>Hardcoded Tagline</div>
</section>
```

But by adding the `data-sanity-edit-target` attribute to the `<section>` tag, the edit button will be placed on it instead.

```html
<section data-sanity-edit-target>
  <h1>{dynamicTitle}</h1>
  <div>Hardcoded Tagline</div>
</section>
```

Manually setting the edit target will use the first element it finds with encoded metadata and remove clickable buttons from all other child elements.

## Change the z-index of overlay elements

```ts
enableVisualEditing({
  zIndex: 1000,
})
```

[gzip-badge]: https://img.shields.io/bundlephobia/minzip/@sanity/visual-editing?label=gzip%20size&style=flat-square
[size-badge]: https://img.shields.io/bundlephobia/min/@sanity/visual-editing?label=size&style=flat-square
[bundlephobia]: https://bundlephobia.com/package/@sanity/visual-editing
[loaders]: https://www.sanity.io/docs/loaders-and-overlays
[preview-kit]: https://www.sanity.io/plugins/preview-kit
[next-app-router]: https://nextjs.org/docs/app
[remix]: https://remix.run/
[sveltekit]: https://kit.svelte.dev/
[server-actions]: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
