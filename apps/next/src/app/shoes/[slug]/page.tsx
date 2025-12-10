import {shoe} from '@/queries'

import {sanityFetch} from '../sanity.live'
import ShoePageClient from './page.client'

type Props = {
  params: Promise<{slug: string}>
}

export default async function ShoePage({params}: Props) {
  const {data: initial} = await sanityFetch({query: shoe, params})

  return <ShoePageClient params={params} initial={initial} />
}
