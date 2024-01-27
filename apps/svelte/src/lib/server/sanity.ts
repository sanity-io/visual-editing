import { SANITY_API_READ_TOKEN } from '$env/static/private'
import { client } from '$lib/sanity'
import crypto from 'crypto'

export const draftModeId = crypto.randomBytes(16).toString('hex')

export const serverClient = client.withConfig({
  token: SANITY_API_READ_TOKEN,
  stega: {
    ...client.config().stega,
    enabled: true,
  },
})
