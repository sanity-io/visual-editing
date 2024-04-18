import {shoesList as query, type ShoesListResult} from 'apps-common/queries'
import type {PageServerLoad} from './$types'

export const load: PageServerLoad = async ({locals: {loadQuery}}) => ({
  query,
  params: {},
  options: {initial: await loadQuery<ShoesListResult>(query)},
})
