import { setServerClient, loadQuery } from '@sanity/svelte-loader'
import { handler } from '@sanity/svelte-loader'
import { serverClient, draftModeId } from '$lib/server/sanity'

setServerClient(serverClient)

export const handle = handler({
  draftMode: {
    secret: draftModeId,
    client: serverClient,
  },
  loadQuery,
})
