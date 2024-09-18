import {shoe, type ShoeResult} from '$lib/queries'
import type {PageServerLoad} from './$types'

export const load: PageServerLoad = async ({locals: {client}, params: {slug}}) => {
  const params = {slug}
  const product = await client.fetch<ShoeResult>(shoe, params)

  return {product, params}
}
