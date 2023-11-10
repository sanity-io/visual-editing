# @sanity/preview-url-secret

[![npm stat](https://img.shields.io/npm/dm/@sanity/preview-url-secret.svg?style=flat-square)](https://npm-stat.com/charts.html?package=@sanity/preview-url-secret)
[![npm version](https://img.shields.io/npm/v/@sanity/preview-url-secret/pink-lizard.svg?style=flat-square)](https://www.npmjs.com/package/@sanity/preview-url-secret)
[![gzip size][gzip-badge]][bundlephobia]
[![size][size-badge]][bundlephobia]

> **Warning**
>
> This is an experimental package. Breaking changes may be introduced at any time. It's not production ready.

```sh
npm i --save-exact @sanity/preview-url-secret@pink-lizard @sanity/client
```

## Usage

TODO how to verify the secret in an API handler that enables Draft Mode

## Presentation Tool

@TODO move to presentation tool docs

```ts
import { presentationTool } from '@sanity/presentation'
import { definePreviewUrl } from '@sanity/preview-url-secret/presentation'
import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'

export default defineConfig({
  projectId,
  dataset,
  schema,
  plugins: [
    presentationTool({
      // The URL you usually would pass into `previewUrl`:
      // previewUrl: 'http://localhost:3000/en/home',
      // You now pass into `definePreviewUrl`, slightly modified:
      previewUrl: definePreviewUrl({
        // You first specify the shared baseUrl:
        origin: 'http://localhost:3000',
        preview: '/en/home', // Optional, it's '/' by default
        // The API route that securely puts the app in a "Draft Mode"
        // Next.js docs: https://nextjs.org/docs/app/building-your-application/configuring/draft-mode
        draftMode: {
          enable: '/api/draft',
        },
      }),
    }),
    deskTool(),
    visionTool(),
  ],
})
```

[gzip-badge]: https://img.shields.io/bundlephobia/minzip/@sanity/preview-url-secret@pink-lizard?label=gzip%20size&style=flat-square
[size-badge]: https://img.shields.io/bundlephobia/min/@sanity/preview-url-secret@pink-lizard?label=size&style=flat-square
[bundlephobia]: https://bundlephobia.com/package/@sanity/preview-url-secret@pink-lizard
