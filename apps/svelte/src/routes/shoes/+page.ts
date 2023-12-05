import { shoesList, type ShoesListResult } from 'apps-common/queries'
import { useQuery } from '$lib/sanity.loader'
import type { PageLoad } from './$types'

export const ssr = false

export const load: PageLoad = ({ data: initial }) => {
  return useQuery<ShoesListResult>(shoesList, {}, { initial })
}
