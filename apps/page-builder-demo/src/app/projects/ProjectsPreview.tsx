'use client'

import {useQuery} from '@/sanity'
import {ProjectsPage, ProjectsPageData} from './ProjectsPage'

export function ProjectsPreview(props: {query: string; initial: any}) {
  const {query, initial} = props
  const {data, loading} = useQuery<ProjectsPageData>(query, {}, {initial})

  if (loading && !data) {
    return <div>Loading…</div>
  }

  return <ProjectsPage data={data as any} />
}
