'use client'

import {useQuery} from '@/sanity'
import {ExperimentPage, ExperimentPageData} from './ExperimentPage'

export function ExperimentPreview(props: {query: string; slug: string; initial: any}) {
  const {query, slug, initial} = props

  const {data, loading} = useQuery<ExperimentPageData>(query, {slug}, {initial})

  if (loading && !data) {
    return <div>Loading…</div>
  }

  return <ExperimentPage data={data as any} />
}
