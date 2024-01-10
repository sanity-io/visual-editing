import { client } from '$lib/sanity'
import { setServerClient } from '@sanity/svelte-loader'
import { SANITY_API_READ_TOKEN } from '$env/static/private'

setServerClient(
  client.withConfig({
    token: SANITY_API_READ_TOKEN,
    useCdn: false,
    perspective: 'previewDrafts',
    // stega: {
    //   ...client.config().stega,
    //   enabled: process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview',
    // },
  }),
)
