import {shoesList} from '@/queries'
import type {ShoesListResult} from '@/types'
import {draftMode} from 'next/headers'
import ShoesPageClient from './page.client'
import {loadQuery} from './sanity.ssr'

export default async function ShoesPage() {
  const initial = await loadQuery<ShoesListResult>(
    shoesList,
    {},
    {
      perspective: (await draftMode()).isEnabled ? 'drafts' : 'published',
      next: {revalidate: (await draftMode()).isEnabled ? 0 : false, tags: ['shoe']},
    },
  )
  return <ShoesPageClient initial={initial} />
}
