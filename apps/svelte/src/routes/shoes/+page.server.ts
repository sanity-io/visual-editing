import {shoesList, type ShoesListResult} from '$lib/queries'
import type {PageServerLoad} from './$types'

export const load: PageServerLoad = async ({locals: {client, preview}}) => {
  const products = await client.fetch<ShoesListResult>(
    shoesList,
    {},
    {stega: preview ? true : false},
  )
  return {products}
}
