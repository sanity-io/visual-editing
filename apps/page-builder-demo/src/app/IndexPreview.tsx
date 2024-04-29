'use client'

import {useQuery} from '@/sanity'
import {IndexPage, IndexPageData} from './IndexPage'

export function IndexPreview(props: {query: string; initial: any}) {
  const {query, initial} = props
  const {data, loading} = useQuery<IndexPageData>(query, {}, {initial})

  if (loading && !data) {
    return <div>Loading…</div>
  }

  return <IndexPage data={data as any} />
}
