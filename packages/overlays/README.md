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

Install the package along with either `@sanity/react-loader`, `@sanity/nuxt-loader`, `@sanity/svelte-loader` or `@sanity/core-loader` depending on your project.

The other peer dependencies are required and will be loaded asynchronously when Visual Editing is enabled.

```sh
# For React.js applications
npm install --save-exact @sanity/overlays@pink-lizard @sanity/react-loader@pink-lizard react react-dom styled-components
```

```sh
# Framework agnostic JavaScript libraries
npm install --save-exact @sanity/overlays@pink-lizard @sanity/core-loader@pink-lizard react react-dom styled-components
```

### 2. Fetch data with a Sanity loader

TODO, link to the docs for each loader

### 3. Set data attributes

TODO, how to set the `data-sanity` attributes

### 4. Dynamically enable Visual Editing

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

## Using stega

Docs on how to use the new stega enhanced client in `@sanity/client/stega` which replaces `@sanity/preview-kit/client`.

## Vercel Visual Editing compatibility

A note on usage that's compatible with Vercel.
