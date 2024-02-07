# @sanity/visual-editing

[![npm stat](https://img.shields.io/npm/dm/@sanity/visual-editing.svg?style=flat-square)](https://npm-stat.com/charts.html?package=@sanity/visual-editing)
[![npm version](https://img.shields.io/npm/v/@sanity/visual-editing.svg?style=flat-square)](https://www.npmjs.com/package/@sanity/visual-editing)
[![gzip size][gzip-badge]][bundlephobia]
[![size][size-badge]][bundlephobia]

This package is used with the [Presentation](https://www.sanity.io/docs/presentation) tool in the Sanity Studio to create clickable elements to take editors right from previews to the document and field they want to edit.

## Getting started

```sh
npm install @sanity/visual-editing
```

## Usage

### Plain JS

```ts
import { enableVisualEditing } from '@sanity/vision-editing'

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
import { draftMode } from 'next/headers'
import { VisualEditing } from 'next-sanity'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
      {draftMode().isEnabled() && (
        <VisualEditing
          zIndex={1000} // Optional
        />
      )}
    </html>
  )
}
```

#### Pages Router

For Pages Router you should use the `VisualEditing` from `@sanity/visual-editing/next-pages-router`. Assuming you're using [Draft Mode](https://nextjs.org/docs/pages/building-your-application/configuring/draft-mode) or [Preview Mode](https://nextjs.org/docs/pages/building-your-application/configuring/preview-mode) to toggle when to enable Visual Editing, add the `VisualEditing` component to your `_app.tsx`:

```tsx
import { VisualEditing } from '@sanity/visual-editing/next-pages-router'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'

export default function App({ Component, pageProps }: AppProps) {
  const { isPreview } = useRouter()
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

### React.js

On React apps that don't have a first-class framework integration may use the `enableVisualEditing` function directly in a `useEffect` hook.

```tsx
import { enableVisualEditing } from '@sanity/vision-editing'
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
