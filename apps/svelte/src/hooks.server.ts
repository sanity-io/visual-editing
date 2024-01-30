import { setServerClient, loadQuery } from '@sanity/svelte-loader'
import { handler } from '@sanity/svelte-loader'
import { serverClient, previewSecret } from '$lib/server/sanity'

setServerClient(serverClient)

export const handle = handler({
  preview: {
    secret: previewSecret,
    client: serverClient,
  },
  loadQuery,
})
