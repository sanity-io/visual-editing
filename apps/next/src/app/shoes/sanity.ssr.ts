// import { experimental_taintUniqueValue } from 'react'

import { client } from './sanity.client'
import { serverOnly } from './sanity.loader'
import { draftMode } from 'next/headers'

const token = process.env.SANITY_API_READ_TOKEN

if (!token) {
  throw new Error('Missing SANITY_API_READ_TOKEN')
}

/*
// @TODO re-test when stable
experimental_taintUniqueValue(
  'Do not pass the sanity API read token to the client.',
  process,
  token,
)
// */

const { setServerClient } = serverOnly
setServerClient(
  client.withConfig({
    token,
    // Enable stega if it's a Vercel preview deployment, as the Vercel Toolbar has controls that shows overlays
    stega: {
      ...client.config().stega,
      enabled: process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview',
    },
  }),
)

// Automatically handle draft mode
export const query = ((query, params = {}, options = {}) => {
  const perspective =
    options.perspective || draftMode().isEnabled ? 'previewDrafts' : 'published'
  return serverOnly.query(query, params, { ...options, perspective })
}) satisfies typeof serverOnly.query
