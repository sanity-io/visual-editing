import {shoesList, type ShoesListResult} from '$lib/queries'
import type {PageServerLoad} from './$types'

export const load: PageServerLoad = async ({locals: {client}}) => {
  const products = await client.fetch<ShoesListResult>(shoesList)
  return {products}
}
