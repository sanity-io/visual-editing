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

### In React.js

```tsx
import { enableVisualEditing } from '@sanity/vision-editing'
import { useEffect } from 'react'

export default function VisualEditing() {
  useEffect(() => {
    const disable = enableVisualEditing()
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

[gzip-badge]: https://img.shields.io/bundlephobia/minzip/@sanity/visual-editing?label=gzip%20size&style=flat-square
[size-badge]: https://img.shields.io/bundlephobia/min/@sanity/visual-editing?label=size&style=flat-square
[bundlephobia]: https://bundlephobia.com/package/@sanity/visual-editing
