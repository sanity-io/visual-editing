import { ShoesListResult, shoesList } from 'apps-common/queries'
import ShoesPageClient from './page.client'
import { loadQuery } from './sanity.ssr'

export default async function ShoesPage() {
  const initial = loadQuery<ShoesListResult>(shoesList)
  return <ShoesPageClient initial={initial} />
}
