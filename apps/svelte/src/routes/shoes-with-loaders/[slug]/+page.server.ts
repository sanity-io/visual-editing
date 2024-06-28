import {shoe as query, type ShoeResult} from 'apps-common/queries'
import type {PageServerLoad} from './$types'

export const load: PageServerLoad = async ({locals: {loadQuery}, params: {slug}}) => {
  const params = {slug}
  console.log('erm???')
  try {
    const foo = await loadQuery<ShoeResult>(query, params)
    console.log(foo)
  } catch (e) {
    console.log('e!', e)
    throw e
  }
  return {
    query,
    params,
    options: {initial: await loadQuery<ShoeResult>(query, params)},
  }
}
