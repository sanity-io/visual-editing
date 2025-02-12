import {shoe} from '@/queries'
import type {ShoeResult} from '@/types'
import {draftMode} from 'next/headers'
import {loadQuery} from '../sanity.ssr'
import ShoePageClient from './page.client'

type Props = {
  params: Promise<{slug: string}>
}

export default async function ShoePage(props: Props) {
  const params = await props.params
  const initial = loadQuery<ShoeResult>(shoe, params, {
    perspective: (await draftMode()).isEnabled ? 'drafts' : 'published',
    next: {
      revalidate: (await draftMode()).isEnabled ? 0 : false,
      tags: [`shoe:${params.slug}`],
    },
  })

  return <ShoePageClient params={params} initial={initial} />
}
