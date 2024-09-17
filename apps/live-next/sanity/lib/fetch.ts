import {client} from '@/sanity/lib/client'
import {token} from '@/sanity/lib/token'
import type {ClientPerspective, QueryParams} from 'next-sanity'
import {draftMode} from 'next/headers'

/**
 * Used to fetch data in Server Components, it has built in support for handling Draft Mode and perspectives.
 * When using the "published" perspective then time-based revalidation is used, set to match the time-to-live on Sanity's API CDN (60 seconds)
 * and will also fetch from the CDN.
 * When using the "previewDrafts" perspective then the data is fetched from the live API and isn't cached, it will also fetch draft content that isn't published yet.
 */
export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
  perspective = draftMode().isEnabled ? 'previewDrafts' : 'published',
  /**
   * Stega embedded Content Source Maps are used by Visual Editing by both the Sanity Presentation Tool and Vercel Visual Editing.
   * The Sanity Presentation Tool will enable Draft Mode when loading up the live preview, and we use it as a signal for when to embed source maps.
   * When outside of the Sanity Studio we also support the Vercel Toolbar Visual Editing feature, which is only enabled in production when it's a Vercel Preview Deployment.
   */
  stega = perspective === 'previewDrafts' || process.env.VERCEL_ENV === 'preview',
}: {
  query: QueryString
  params?: QueryParams
  perspective?: Omit<ClientPerspective, 'raw'>
  stega?: boolean
}) {
  // fetch the tags first, with revalidate to 1s to ensure we get the latest tags, eventually
  const {syncTags} = await client.fetch(query, params, {
    perspective: perspective as ClientPerspective,
    stega: false,
    useCdn: false,
    filterResponse: false,
    returnQuery: false,
    next: {revalidate: 1, tags: ['sanity']},
  })

  const tags = ['sanity', ...(syncTags?.map((tag) => `sanity:${tag}`) || [])]
  // console.log({query, params, perspective, tags})

  if (perspective === 'previewDrafts') {
    return client.fetch(query, params, {
      stega,
      perspective: 'previewDrafts',
      // The token is required to fetch draft content
      token,
      // The `previewDrafts` perspective isn't available on the API CDN
      useCdn: false,
      // And we can't cache the responses as it would slow down the live preview experience
      next: {revalidate: false, tags},
    })
  }
  return client.fetch(query, params, {
    stega,
    perspective: 'published',
    // The `published` perspective is available on the API CDN
    useCdn: false,
    // Only enable Stega in production if it's a Vercel Preview Deployment, as the Vercel Toolbar supports Visual Editing
    // When using the `published` perspective we use time-based revalidation to match the time-to-live on Sanity's API CDN (60 seconds)
    next: {revalidate: false, tags},
  })
}
