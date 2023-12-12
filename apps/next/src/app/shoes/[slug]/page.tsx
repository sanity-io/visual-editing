import { ShoeParams, ShoeResult, shoe } from 'apps-common/queries'
import { loadQuery } from '../sanity.ssr'
import ShoePageClient from './page.client'

type Props = {
  params: { slug: string }
}

export default async function ShoePage(props: Props) {
  const { params } = props
  const initial = loadQuery<ShoeResult>(shoe, params satisfies ShoeParams, {
    next: { tags: [`shoe:${params.slug}`, 'brandReference'] },
  })

  return <ShoePageClient params={params} initial={initial} />
}
