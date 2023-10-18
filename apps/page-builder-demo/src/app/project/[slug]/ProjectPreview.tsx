'use client'

import { SITE_SETTINGS_QUERY } from '@/app/queries'
import { useQuery } from '@/sanity'
import groq from 'groq'
import { ProjectPage, ProjectPageData } from './ProjectPage'

const PAGE_QUERY = groq`{
  "project": *[_type == "project" && slug.current == $slug][0],
  "siteSettings": ${SITE_SETTINGS_QUERY}
}`

export function ProjectPreview(props: { slug: string }) {
  const { slug } = props

  const { data, loading } = useQuery<ProjectPageData>(PAGE_QUERY, { slug })

  if (loading || !data) {
    return <div>Loading…</div>
  }

  return <ProjectPage data={data} />
}
