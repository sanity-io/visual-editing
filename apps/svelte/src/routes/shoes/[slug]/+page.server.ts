import { shoe, type ShoeResult } from 'apps-common/queries'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({
  params: { slug },
  locals: { loadQuery },
}) => {
  const initial = await loadQuery<ShoeResult>(shoe, { slug })
  return { initial, params: { slug } }
}
