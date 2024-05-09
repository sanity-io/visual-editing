import {experimental_taintUniqueValue} from 'react'

import {client} from './sanity.client'
import {setServerClient, loadQuery as _loadQuery} from '@sanity/react-loader'
import {draftMode} from 'next/headers'

const token = process.env.SANITY_API_READ_TOKEN

if (!token) {
  throw new Error('Missing SANITY_API_READ_TOKEN')
}

experimental_taintUniqueValue(
  'Do not pass the sanity API read token to the client.',
  process,
  token,
)

setServerClient(
  client.withConfig({
    token,
  }),
)

// Automatically handle draft mode
export const loadQuery = ((query, params = {}, options = {}) => {
  const isDraftMode = draftMode().isEnabled
  const perspective = options.perspective || draftMode().isEnabled ? 'previewDrafts' : 'published'
  return _loadQuery(query, params, {
    ...options,
    perspective,
    stega: process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' || perspective === 'previewDrafts',
    next: {revalidate: isDraftMode ? 0 : 60},
  })
}) satisfies typeof _loadQuery
