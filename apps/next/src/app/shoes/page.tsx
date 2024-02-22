import { ShoesListResult, shoesList } from 'apps-common/queries'
import ShoesPageClient from './page.client'
import { loadQuery } from './sanity.ssr'
import { draftMode } from 'next/headers'

export default async function ShoesPage() {
  const initial = await loadQuery<ShoesListResult>(
    shoesList,
    {},
    {
      perspective: draftMode().isEnabled ? 'previewDrafts' : 'published',
      next: { revalidate: draftMode().isEnabled ? 0 : false, tags: ['shoe'] },
    },
  )
  return <ShoesPageClient initial={initial} />
}
