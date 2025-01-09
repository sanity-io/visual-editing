import {createRequestHandler, setServerClient} from '@sanity/svelte-loader'
import {redirect} from '@sveltejs/kit'
import {serverClient} from '$lib/server/sanity'

setServerClient(serverClient)

export const handle = createRequestHandler({preview: {redirect}})
