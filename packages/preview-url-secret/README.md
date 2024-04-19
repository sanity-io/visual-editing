# @sanity/preview-url-secret

[![npm stat](https://img.shields.io/npm/dm/@sanity/preview-url-secret.svg?style=flat-square)](https://npm-stat.com/charts.html?package=@sanity/preview-url-secret)
[![npm version](https://img.shields.io/npm/v/@sanity/preview-url-secret.svg?style=flat-square)](https://www.npmjs.com/package/@sanity/preview-url-secret)
[![gzip size][gzip-badge]][bundlephobia]
[![size][size-badge]][bundlephobia]

```sh
npm install @sanity/preview-url-secret @sanity/client
```

This package is used together with [`@sanity/presentation`]:

```ts
// ./sanity.config.ts
import {presentationTool} from 'sanity/presentation'
import {defineConfig} from 'sanity'

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
  ],
})
```

## Next.js App Router

Create an API token with viewer rights, and put it in an environment variable named `SANITY_API_READ_TOKEN`, then create the following API handler:

```ts
// ./app/api/draft/route.ts

import {draftMode} from 'next/headers'
import {redirect} from 'next/navigation'
import {validatePreviewUrl} from '@sanity/preview-url-secret'
import {client} from '@/sanity/lib/client'

const clientWithToken = client.withConfig({
  // Required, otherwise the URL preview secret can't be validated
  token: process.env.SANITY_API_READ_TOKEN,
})

export async function GET(req: Request) {
  const {isValid, redirectTo = '/'} = await validatePreviewUrl(clientWithToken, req.url)
  if (!isValid) {
    return new Response('Invalid secret', {status: 401})
  }

  draftMode().enable()

  redirect(redirectTo)
}
```

It's also handy to make a route to disable draft mode, so you have an easy way of disabling it when leaving the Presentation Mode and return to your app:

```ts
// ./app/api/disable-draft/route.ts

import {draftMode} from 'next/headers'
import {NextRequest, NextResponse} from 'next/server'

export function GET(request: NextRequest) {
  draftMode().disable()
  const url = new URL(request.nextUrl)
  return NextResponse.redirect(new URL('/', url.origin))
}
```

## Next.js Pages Router

Create an API token with viewer rights, and put it in an environment variable named `SANITY_API_READ_TOKEN`, then create the following API handler:

```ts
// ./pages/api/draft.ts

import type {NextApiRequest, NextApiResponse} from 'next'
import {validatePreviewUrl} from '@sanity/preview-url-secret'
import {client} from '@/sanity/lib/client'

const clientWithToken = client.withConfig({
  // Required, otherwise the URL preview secret can't be validated
  token: process.env.SANITY_API_READ_TOKEN,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse<string | void>) {
  if (!req.url) {
    throw new Error('Missing url')
  }
  const {isValid, redirectTo = '/'} = await validatePreviewUrl(clientWithToken, req.url)
  if (!isValid) {
    return res.status(401).send('Invalid secret')
  }
  // Enable Draft Mode by setting the cookies
  res.setDraftMode({enable: true})
  res.writeHead(307, {Location: redirectTo})
  res.end()
}
```

It's also handy to make a route to disable draft mode, so you have an easy way of disabling it when leaving the Presentation Mode and return to your app:

```ts
// ./pages/api/disable-draft.ts

import type {NextApiRequest, NextApiResponse} from 'next'

export default function handler(_req: NextApiRequest, res: NextApiResponse<void>): void {
  // Exit the current user from "Draft Mode".
  res.setDraftMode({enable: false})

  // Redirect the user back to the index page.
  res.writeHead(307, {Location: '/'})
  res.end()
}
```

## Checking the Studio origin

You can inspect the URL origin of the Studio that initiated the preview on the `studioOrigin` property of `validatePreviewUrl`:

```ts
const {isValid, redirectTo = '/', studioOrigin} = await validatePreviewUrl(clientWithToken, req.url)
if (studioOrigin === 'http://localhost:3333') {
  console.log('This preview was initiated from the local development Studio')
}
```

You don't have to check `isValid` before using it, as it'll be `undefined` if the preview URL secret failed validation. It's also `undefined` if the way the secret were created didn't provide an origin.

## Debugging generated secrets

You can view the generated url secrets that are in your dataset by adding the debug plugin to your `sanity.config.ts`:

```ts
import {defineConfig} from 'sanity'
import {debugSecrets} from '@sanity/preview-url-secret/sanity-plugin-debug-secrets'

export default defineConfig({
  // ... other options
  plugins: [
    // Makes the url secrets visible in the Sanity Studio like any other documents defined in your schema
    debugSecrets(),
  ],
})
```

[`@sanity/presentation`]: https://github.com/sanity-io/visual-editing/tree/main/packages/presentation#readme
[gzip-badge]: https://img.shields.io/bundlephobia/minzip/@sanity/preview-url-secret?label=gzip%20size&style=flat-square
[size-badge]: https://img.shields.io/bundlephobia/min/@sanity/preview-url-secret?label=size&style=flat-square
[bundlephobia]: https://bundlephobia.com/package/@sanity/preview-url-secret
