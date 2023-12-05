import { shoesList, type ShoesListResult } from 'apps-common/queries'
import { loadQuery } from '$lib/sanity.loader.server'
import type { PageLoad } from './$types'
// import { VERCEL_ENV } from '$env/static/private'

export const load: PageLoad = () => {
  return loadQuery<ShoesListResult>(shoesList)
}
