# @sanity/overlays — Visual Editing

Sanity Visual Editing highlights elements on your website that are editable in Sanity Studio.

Learn more about this feature, and how to use it, in our [Visual Editing documentation](http://sanity.io/docs/vercel-visual-editing).

> **Note**
> Visual Editing requires [Content Source Maps](https://www.sanity.io/blog/content-source-maps-announce), a feature available on a Sanity Enterprise plan. If you are an existing enterprise customer, [contact our sales team](https://www.sanity.io/contact/sales?ref=vercel-visual-editing-docs) to have Content Source Maps enabled on your project. [Learn more about Sanity for Enterprise organizations here](https://www.sanity.io/enterprise?ref=vercel-visual-editing-docs).

> **Note**
> This package is **not required** for Vercel Visual Editing. It is only required if you want to enable visual editing on alternative hosting providers.

## Prerequisites

- Sanity Enterprise project with Content Source Maps enabled
- An **enhanced** Sanity Client using `createClient` from [`@sanity/preview-kit`](https://github.com/sanity-io/preview-kit) or [`next-sanity`](https://github.com/sanity-io/next-sanity) with `encodeSourceMap` and `studioUrl` enabled

## Getting started

### 1. Install @sanity/overlays

Install the package along with either `next-sanity` or `@sanity/preview-kit` depending on your project.

The other peer dependencies are required and will be loaded asynchronously when Visual Editing is enabled.

```sh
# For Next.js applications
npm install @sanity/overlays next-sanity react react-dom styled-components
```

```sh
# Framework agnostic JavaScript libraries
npm install @sanity/overlays @sanity/preview-kit react react-dom styled-components
```

### 2. Configure an enhanced Sanity client

Visual Editing relies on encoded metadata being present in values returned from your queries. This metadata is only present when using an enhanced Sanity client on a project on which Content Source Maps is enabled.

Ensure `encodeSourceMap` is only `true` in non-production environments.

```ts
import { createClient } from 'next-sanity'
// or
import { createClient } from '@sanity/preview-kit/client'

const client = createClient({
  // ...all other config
  studioUrl: '/studio', // Or: 'https://my-cool-project.sanity.studio'
  encodeSourceMap: true,
})
```

For more configuration options when working with Content Source Maps and the enhanced Sanity Client, see the README's of either package:

- [next-sanity](https://github.com/sanity-io/next-sanity)
- [@sanity/preview-kit](https://github.com/sanity-io/preview-kit)

### 3. Dynamically enable Visual Editing

Ensure the overlay is only enabled in non-production environments.

```ts
import { enableOverlays } from '@sanity/overlays'

const disable = enableOverlays() // Enables Visual Editing overlay
disable() // Disables Visual Editing overlay
```

In React you could enable the feature in a `useEffect()` hook, where `disable()` will run on unmount:

```ts
import { enableOverlays } from '@sanity/overlays'

useEffect(enableOverlays, [])
```

When enabled, you should see clickable "Edit in Sanity Studio" buttons for every element which contains encoded metadata from Content Source Maps.

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

### `data-sanity-edit-info`

You can manually add custom "Edit in Sanity Studio" elements by adding a `data-sanity-edit-info` attribute to the element you want to be editable.

```tsx
export function MyComponent() {
  return (
    <div
      data-sanity-edit-info={JSON.stringify({
        origin: 'sanity.io',
        href: '/studio',
      })}
    >
      ...
    </div>
  )
}
```
