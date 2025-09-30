import {shoesListQuery as query} from '$lib/queries'
import type {ShoesListQueryResult} from '$lib/sanity.types'
import type {PageServerLoad} from './$types'

export const load: PageServerLoad = async ({locals: {sanity}}) => ({
  query,
  params: {},
  options: {initial: await sanity.loadQuery<ShoesListQueryResult>(query)},
})
