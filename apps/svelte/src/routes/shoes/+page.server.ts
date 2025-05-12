import {shoesListQuery} from '$lib/queries'
import type {ShoesListQueryResult} from '$lib/sanity.types'
import type {PageServerLoad} from './$types'

export const load: PageServerLoad = async ({locals: {sanity}}) => {
  const {client, previewEnabled} = sanity
  const products = await client.fetch<ShoesListQueryResult>(
    shoesListQuery,
    {},
    {stega: previewEnabled ? true : false},
  )
  return {products}
}
