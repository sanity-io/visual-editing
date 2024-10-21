import {loadQuery as _loadQuery, setServerClient} from '@sanity/react-loader'
import {draftMode} from 'next/headers'
import {client} from './sanity.client'

const token = process.env.SANITY_API_READ_TOKEN

if (!token) {
  throw new Error('Missing SANITY_API_READ_TOKEN')
}

setServerClient(
  client.withConfig({
    token,
  }),
)

// Automatically handle draft mode
export const loadQuery = (async (query, params = {}, options = {}) => {
  const isDraftMode = (await draftMode()).isEnabled
  const perspective =
    options.perspective || (await draftMode()).isEnabled ? 'previewDrafts' : 'published'
  return _loadQuery(query, params, {
    ...options,
    perspective,
    stega: process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' || perspective === 'previewDrafts',
    next: {revalidate: isDraftMode ? 0 : 60},
  })
}) satisfies typeof _loadQuery
