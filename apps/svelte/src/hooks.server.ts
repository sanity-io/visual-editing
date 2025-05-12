import {
  handleLiveLoader,
  handlePreviewMode,
  handleQueryLoader,
  setServerClient,
} from '@sanity/sveltekit'
import {redirect} from '@sveltejs/kit'
import {sequence} from '@sveltejs/kit/hooks'
import {SANITY_API_READ_TOKEN} from '$env/static/private'
import {serverClient} from '$lib/server/sanity'

setServerClient(serverClient)

export const handle = sequence(
  handlePreviewMode({
    client: serverClient,
    preview: {redirect},
  }),
  handleQueryLoader(),
  handleLiveLoader({
    serverToken: SANITY_API_READ_TOKEN,
  }),
)
