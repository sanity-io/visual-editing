import {sanityFetch} from '@sanity/sveltekit'
import {shoesListQuery} from '$lib/queries'
import type {PageServerLoad} from './$types'

export const load: PageServerLoad = async (event) => {
  return sanityFetch(event, {query: shoesListQuery})
}
