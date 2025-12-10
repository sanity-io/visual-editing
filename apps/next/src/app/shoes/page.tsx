import {shoesList} from '@/queries'

import ShoesPageClient from './page.client'
import {sanityFetch} from './sanity.live'

export default async function ShoesPage() {
  const {data} = await sanityFetch({query: shoesList})
  return <ShoesPageClient initial={data} />
}
