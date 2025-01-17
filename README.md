# Visual Editing

This repository contains packages to enable Visual Editing with Sanity. Visual Editing streamlines everyday content management with an intuitive, one-click path from website preview content to Studio.

## Presentation

[`sanity/presentation`](https://www.sanity.io/docs/presentation) is a Sanity Studio plugin that lets you work with content directly through preview — be it a website, in-store display, or anything you can point a browser at.

### [Vercel Deployment Protection](https://vercel.com/docs/security/deployment-protection)

Use the [`@sanity/vercel-protection-bypass`](./packages/vercel-protection-bypass) tool to setup Presentation to use [Protection Bypass](https://vercel.com/docs/security/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation#protection-bypass-for-automation) to successfully load deployments that are protected.

## Overlays & router integration

[`@sanity/visual-editing`](./packages/visual-editing/README.md) is used alongside the Presentation tool to create clickable elements to take editors right from previews to the document and field they want to edit. It's also used to two-way sync the preview URL and integrate with your framework router.

## Loaders

Loaders provide a convenient, unified way of loading data from Content Lake: A single front end data fetching implementation across production, development and preview states, for both server and client side rendering. They do the heavy lifting in integrating live content updates, perspective switching and Overlay rendering in your application.

Loaders are available for several frameworks:

- [`@sanity/react-loader`](./packages/react-loader/README.md)
- [`@nuxtjs/sanity`](https://sanity.nuxtjs.org/getting-started/visual-editing/)
- [`@sanity/svelte-loader`](./packages/svelte-loader/README.md)

These framework specific loaders are built on top of [`@sanity/core-loader`](./packages/core-loader/README.md), which can be used in any JavaScript-based project.

## Preview URL

[`@sanity/preview-url-secret`](./packages/preview-url-secret/README.md) exposes helpers for integrating draft or preview mode in your application.
