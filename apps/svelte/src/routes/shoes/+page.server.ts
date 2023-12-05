import { shoesList, type ShoesListResult } from 'apps-common/queries'
import { loadQuery } from '$lib/sanity.loader.server'
import type { PageLoad } from './$types'

export const load: PageLoad = () => {
  return loadQuery<ShoesListResult>(shoesList)
}
