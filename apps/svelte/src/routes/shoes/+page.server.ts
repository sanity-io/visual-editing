import { shoesList, type ShoesListResult } from 'apps-common/queries'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { loadQuery } }) => {
  const initial = await loadQuery<ShoesListResult>(shoesList, {})
  return { initial }
}
