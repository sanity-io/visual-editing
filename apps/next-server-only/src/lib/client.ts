import {createClient} from '@sanity/client'

import {apiVersion, dataset, projectId, revalidateSecret} from './env'

export const client = createClient({
  apiVersion,
  dataset,
  projectId,
  // If the GROQ revalidate hook is setup we use the Vercel Data Cache to handle on-demand revalidation, and the Sanity API CDN if not
  useCdn: revalidateSecret ? false : true,
  perspective: 'published',
  stega: {
    studioUrl: '/studio',
  },
})
