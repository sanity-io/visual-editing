import 'server-only'
import {defineLive} from 'next-sanity/live'
import {client} from './client'

const serverToken = process.env.SANITY_API_READ_TOKEN
const browserToken = process.env.SANITY_API_BROWSER_TOKEN

if (!serverToken) {
  throw new Error('Missing SANITY_API_READ_TOKEN')
}
if (!browserToken) {
  throw new Error('Missing SANITY_API_BROWSER_TOKEN')
}

export const {sanityFetch, SanityLive} = defineLive({
  client,
  serverToken,
  browserToken,
})
