import { ShoesListResult, shoesList } from 'apps-common/queries'
import ShoesPageClient from './page.client'
import { query } from './sanity.ssr'

export default async function ShoesPage() {
  const initial = query<ShoesListResult>(shoesList)
  return <ShoesPageClient initial={initial} />
}
