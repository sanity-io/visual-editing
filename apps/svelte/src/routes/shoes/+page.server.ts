import { shoesList, type ShoesListResult } from 'apps-common/queries'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { client } }) => {
  const products = await client.fetch<ShoesListResult>(shoesList)
  return { products }
}
