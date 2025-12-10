import {shoeQuery} from '$lib/queries'
import {sanityFetch} from '@sanity/sveltekit'

import type {PageServerLoad} from './$types'

export const load: PageServerLoad = async (event) => {
  return sanityFetch(event, {query: shoeQuery})
}
