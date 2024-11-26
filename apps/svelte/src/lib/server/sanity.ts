import {SANITY_API_READ_TOKEN} from '$env/static/private'
import {client} from '$lib/sanity'

export const serverClient = client.withConfig({
  token: SANITY_API_READ_TOKEN,
})
