import {shoe as query, type ShoeResult} from '$lib/queries'
import type {PageServerLoad} from './$types'

export const load: PageServerLoad = async ({locals: {loadQuery}, params: {slug}}) => {
  const params = {slug}
  return {
    query,
    params,
    options: {initial: await loadQuery<ShoeResult>(query, params)},
  }
}
