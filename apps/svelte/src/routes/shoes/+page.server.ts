import { shoesList, type ShoesListResult } from 'apps-common/queries'
import { loadQuery } from '@sanity/svelte-loader'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const initial = await loadQuery<ShoesListResult>(shoesList, {})
  return { initial }
}
