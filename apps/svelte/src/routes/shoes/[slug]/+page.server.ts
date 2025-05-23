import {shoeQuery} from '$lib/queries'
import type {ShoeQueryResult} from '$lib/sanity.types'
import type {PageServerLoad} from './$types'

export const load: PageServerLoad = async ({locals: {sanity}, params: {slug}}) => {
  const {client, previewEnabled} = sanity
  const params = {slug}
  const product = await client.fetch<ShoeQueryResult>(shoeQuery, params, {
    stega: previewEnabled ? true : false,
  })

  return {product, params}
}
