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
  ],
})
```

# Permissions model

> [!NOTE]
> v1 used to require Editor or above to create the secret.
> v2 lowers the requirement to Contributor.

In order to create an URL Preview Secret, the user needs to have the rights to create draft documents in the schema.
By default that means Contributor or above.
For Enterprise customers with custom roles, it's possible to grant Viewer roles access to create preview secrets.

## Granting access to Viewer roles and below

In your proiect access settings:

1. Create a new Content Resource.
2. Title it "Preview URL Secrets for Presentation Tool".
3. Set the filter to: `_type == "sanity.previewUrlSecret" && _id in path("drafts.**")`.
4. Click "Create content resource".
5. Create new role.
6. Title it "Viewer with Presentation Tool access".
7. Create the role.
8. Edit the "Content permissions".
9. For the "Preview URL Secrets for Presentation Tool" and set it to "+ Update and create". The "All documents", "Image assets" and "File assets" should be set to "Read".
10. Save changes.

To grant a user access to Presentation Tool you simply assign them the new "Viewer with Presentation Tool access" role, instead of "Viewer".

## Restricting access to who can enable/disable preview sharing

In Tools like Presentation, it's possible to share access to a preview link by generating a long lived secret.
By default you need to be an Editor or above to enable or disable preview sharing.
If preview sharing is enabled, then you need to be Viewer or above to read the secret.

When preview sharing is enabled, Presentation Tool will show a "Share" menu:

![Example preview sharing QR code](https://github.com/user-attachments/assets/186bdd20-cad3-44c7-948a-f23aabf7ef6a)

### Control who has access to a shared preview

By default everyone who's Viewer or above can see a shared preview, once someone who's Editor or above has enabled it for the dataset.

Enterprise customers can restrict this in the following way:

1. Create a new Content Resource.
2. Title it "Everything except preview sharing".
3. In the description, write "Access to all document types except for shared preview links"
4. Set the filter to: `_type != "sanity.previewUrlShareAccess"`.
5. Create new role.
6. Title it "Viewer without preview sharing".
7. Create the role.
8. Edit the "Content permissions".
9. For the "Everything except preview sharing" and set it to "Read". The "All documents" must be "No access", "Image assets" and "File assets" should be set to "Read".
10. If you followed the steps in the previous section, you should set "Preview URL Secrets for Presentation Tool" to "+ Update and create".
11. Save changes.

With everything setup correctly, users assigned to this role should see the following when attempting to use the "Share" menu:

![An alert shows an improper permission warning](https://github.com/user-attachments/assets/9e748f49-4f82-453c-bd83-cae6e86302f2)

If you're still able to see the QR code with the new role assigned, make sure you're not assigned to "Viewer" or other roles that may be granting access to "All documents: Read".

### Control who can toggle shared preview

By default anyone who's Editor or above can toggle sharing.
If anyone without permission attempts to toggle it they'll see a message like this:

![An alert shows an improper toggle permission warning](https://github.com/user-attachments/assets/798c9c32-88ac-40ba-9111-2ef4e8fc9a2b)

Enterprise customers can customize this in the following way:

1. Create a new Content Resource.
2. Title it "Preview URL Share Access".
3. In the description, write "Controls who can enable or disable preview sharing in Presentation Tool"
4. Set the filter to: `_type == "sanity.previewUrlShareAccess"`.
5. Create new role.
6. Title it "Can toggle preview sharing".
7. Create the role.
8. Edit the "Content permissions".
9. For the "Preview URL Share Access" set it to "Publish".
10. Save changes.

# Usage

## Next.js App Router

Create an API token with viewer rights, and put it in an environment variable named `SANITY_API_READ_TOKEN`, then create the following API handler:

```ts
// ./app/api/draft/route.ts

import {client} from '@/sanity/lib/client'
import {validatePreviewUrl} from '@sanity/preview-url-secret'
import {draftMode} from 'next/headers'
import {redirect} from 'next/navigation'

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

import {client} from '@/sanity/lib/client'
import {validatePreviewUrl} from '@sanity/preview-url-secret'
import type {NextApiRequest, NextApiResponse} from 'next'

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

## Remix.js

Create a session cookie for draft mode, and put it's secret in an environment variable name `SANITY_SESSION_SECRET`:

```ts
// ./app/sessions.ts

import {createCookieSessionStorage} from '@remix-run/node'

export const DRAFT_SESSION_NAME = '__draft'

if (!process.env.SANITY_SESSION_SECRET) {
  throw new Error(`Missing SANITY_SESSION_SECRET in .env`)
}

const {getSession, commitSession, destroySession} = createCookieSessionStorage({
  cookie: {
    name: DRAFT_SESSION_NAME,
    secrets: [process.env.SANITY_SESSION_SECRET],
    sameSite: 'lax',
  },
})

export {commitSession, destroySession, getSession}
```

Create an API token with viewer rights, and put it in an environment variable named `SANITY_API_READ_TOKEN`, then create the following resource route:

```ts
// ./app/routes/api.draft.ts

import {redirect, type LoaderFunctionArgs} from '@remix-run/node'
import {validatePreviewUrl} from '@sanity/preview-url-secret'
import {client} from '~/sanity/client'
import {commitSession, getSession} from '~/sessions'

export const loader = async ({request}: LoaderFunctionArgs) => {
  if (!process.env.SANITY_API_READ_TOKEN) {
    throw new Response('Draft mode missing token!', {status: 401})
  }

  const clientWithToken = client.withConfig({
    // Required, otherwise the URL preview secret can't be validated
    token: process.env.SANITY_API_READ_TOKEN,
  })

  const {isValid, redirectTo = '/'} = await validatePreviewUrl(clientWithToken, request.url)

  if (!isValid) {
    throw new Response('Invalid secret!', {status: 401})
  }

  const session = await getSession(request.headers.get('Cookie'))
  await session.set('projectId', client.config().projectId)

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  })
}
```

It's also handy to make a resource route to disable draft mode, so you have an easy way of disabling it when leaving the Presentation Mode and return to your app:

```ts
// ./app/routes/api.disable-draft.ts

import {redirect, type LoaderFunctionArgs} from '@remix-run/node'
import {destroySession, getSession} from '~/sessions'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get('Cookie'))

  return redirect('/', {
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  })
}
```

Now we can create a utility function that helps us get the draft mode from the session cookie in loaders:

```ts
// ./app/sanity/get-draft-mode.server.ts

import {client} from '~/sanity/client'
import {getSession} from '~/sessions'

export async function getDraftMode(request: Request) {
  const draftSession = await getSession(request.headers.get('Cookie'))
  const draft = draftSession.get('projectId') === client.config().projectId

  if (draft && !process.env.SANITY_API_READ_TOKEN) {
    throw new Error(
      `Cannot activate draft mode without a 'SANITY_API_READ_TOKEN' token in your environment variables.`,
    )
  }

  return draft
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
import {debugSecrets} from '@sanity/preview-url-secret/sanity-plugin-debug-secrets'
import {defineConfig} from 'sanity'

export default defineConfig({
  // ... other options
  plugins: [
    // Makes the url secrets visible in the Sanity Studio like any other documents defined in your schema
    debugSecrets(),
  ],
})
```

[`sanity/presentation`]: https://www.sanity.io/docs/presentation
[gzip-badge]: https://img.shields.io/bundlephobia/minzip/@sanity/preview-url-secret?label=gzip%20size&style=flat-square
[size-badge]: https://img.shields.io/bundlephobia/min/@sanity/preview-url-secret?label=size&style=flat-square
[bundlephobia]: https://bundlephobia.com/package/@sanity/preview-url-secret
