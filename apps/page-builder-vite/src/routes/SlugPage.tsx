import {Page, pageQuery, type PageQueryResult} from '@repo/page-builder-shared'
import {useMemo} from 'react'
import {useParams} from 'react-router'

import {useQuery} from '@/sanity/loader'

export function SlugPage() {
  const {slug} = useParams<{slug: string}>()
  const params = useMemo(() => ({slug: slug!}), [slug])
  const {data, loading} = useQuery<PageQueryResult>(pageQuery, params)

  return <Page data={data ?? null} loading={loading} />
}
