# @sanity/visual-editing — Visual Editing

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
    const disable = enableVisualEditing({})
    return () => disable()
  }, [])

  return null
}
```

[gzip-badge]: https://img.shields.io/bundlephobia/minzip/@sanity/visual-editing?label=gzip%20size&style=flat-square
[size-badge]: https://img.shields.io/bundlephobia/min/@sanity/visual-editing?label=size&style=flat-square
[bundlephobia]: https://bundlephobia.com/package/@sanity/visual-editing
