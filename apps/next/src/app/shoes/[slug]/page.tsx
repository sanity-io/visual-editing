import {shoe} from '@/queries'
import type {ShoeResult} from '@/types'
import {draftMode} from 'next/headers'
import {loadQuery} from '../sanity.ssr'
import ShoePageClient from './page.client'

type Props = {
  params: {slug: string}
}

export default async function ShoePage(props: Props) {
  const {params} = props
  const initial = loadQuery<ShoeResult>(shoe, params, {
    perspective: draftMode().isEnabled ? 'previewDrafts' : 'published',
    next: {
      revalidate: draftMode().isEnabled ? 0 : false,
      tags: [`shoe:${params.slug}`],
    },
  })

  return <ShoePageClient params={params} initial={initial} />
}
