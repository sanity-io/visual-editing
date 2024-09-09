import {shoe, type ShoeResult} from '$lib/queries'
import type {PageServerLoad} from './$types'

export const load: PageServerLoad = async ({locals: {client, preview}, params: {slug}}) => {
  const params = {slug}
  const product = await client.fetch<ShoeResult>(shoe, params, {stega: preview ? true : false})

  return {product, params}
}
