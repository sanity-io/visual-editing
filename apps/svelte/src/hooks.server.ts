import {createRequestHandler, setServerClient} from '@sanity/svelte-loader'
import {serverClient} from '$lib/server/sanity'

setServerClient(serverClient)

export const handle = createRequestHandler()
