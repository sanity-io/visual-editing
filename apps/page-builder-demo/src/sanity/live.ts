import {defineLive} from 'next-sanity'
import {client} from './client'
import {token} from './token'

export const {sanityFetch, SanityLive, SanityLiveStream, verifyPreviewSecret} = defineLive({
  client,
  serverToken: token,
  browserToken: process.env.SANITY_API_BROWSER_TOKEN || token,
})
