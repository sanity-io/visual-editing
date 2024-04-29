'use client'

import {useQuery} from '@/sanity'
import {ProjectPage, ProjectPageData} from './ProjectPage'

export function ProjectPreview(props: {query: string; slug: string; initial: any}) {
  const {query, slug, initial} = props
  const {data, loading} = useQuery<ProjectPageData>(query, {slug}, {initial})

  if (loading && !data) {
    return <div>Loading…</div>
  }

  return <ProjectPage data={data as any} />
}
