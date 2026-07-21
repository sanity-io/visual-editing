import {useMemo} from 'react'
import {useParams} from 'react-router'

import {Page} from '@/components/page/Page'
import type {PageQueryResult} from '@/sanity.types'
import {useQuery} from '@/sanity/loader'
import {pageQuery} from '@/sanity/queries'

export function SlugPage() {
  const {slug} = useParams<{slug: string}>()
  const params = useMemo(() => ({slug: slug!}), [slug])
  const {data, loading} = useQuery<PageQueryResult>(pageQuery, params)

  return <Page data={data ?? null} loading={loading} />
}
