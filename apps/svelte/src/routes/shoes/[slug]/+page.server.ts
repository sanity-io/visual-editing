import { shoe, type ShoeResult } from 'apps-common/queries'
import { loadQuery } from '@sanity/svelte-loader'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const { slug } = params

  const initial = await loadQuery<ShoeResult>(shoe, { slug })

  return { initial, params: { slug } }
}
