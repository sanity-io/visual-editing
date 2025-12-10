import type {ShoeQueryResult} from '$lib/sanity.types'

import {shoeQuery as query} from '$lib/queries'

import type {PageServerLoad} from './$types'

export const load: PageServerLoad = async ({locals: {sanity}, params: {slug}}) => {
  const {loadQuery} = sanity
  const params = {slug}

  return {
    query,
    params,
    options: {initial: await loadQuery<ShoeQueryResult>(query, params)},
  }
}
