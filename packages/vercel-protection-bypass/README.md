# @sanity/vercel-protection-bypass

[![npm stat](https://img.shields.io/npm/dm/@sanity/vercel-protection-bypass.svg?style=flat-square)](https://npm-stat.com/charts.html?package=@sanity/vercel-protection-bypass)
[![npm version](https://img.shields.io/npm/v/@sanity/vercel-protection-bypass.svg?style=flat-square)](https://www.npmjs.com/package/@sanity/vercel-protection-bypass)
[![gzip size][gzip-badge]][bundlephobia]
[![size][size-badge]][bundlephobia]

```sh
npm install @sanity/vercel-protection-bypass
```

This package is used together with [`sanity/presentation`] to configure it to work with Vercel's [Deployment Protection](https://vercel.com/docs/security/deployment-protection) feature.
The tool is only needed for setup, once it's configured you can safely uninstall it.

Add the tool your `sanity.config.ts`:

```ts
// ./sanity.config.ts
import {vercelProtectionBypassTool} from '@sanity/vercel-protection-bypass'
import {defineConfig} from 'sanity'
import {presentationTool} from 'sanity/presentation'

export default defineConfig({
  // ... other options
  plugins: [
    // ... other plugins
    presentationTool({
      previewUrl: {
        // @TODO change to the URL of the application, or `location.origin` if it's an embedded Studio
        origin: 'http://localhost:3000',
        previewMode: {
          enable: '/api/draft',
        },
      },
    }),
    vercelProtectionBypassTool(),
  ],
})
```

You should see a new `Vercel Protection Bypass` tab in the Studio's settings. Click it and follow the instructions to set up the tool.

[`sanity/presentation`]: https://github.com/sanity-io/visual-editing/tree/main/packages/presentation#readme
[gzip-badge]: https://img.shields.io/bundlephobia/minzip/@sanity/vercel-protection-bypass?label=gzip%20size&style=flat-square
[size-badge]: https://img.shields.io/bundlephobia/min/@sanity/vercel-protection-bypass?label=size&style=flat-square
[bundlephobia]: https://bundlephobia.com/package/@sanity/vercel-protection-bypass
