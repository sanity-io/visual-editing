'use client'

import groq from 'groq'

import { useQuery } from '@/sanity'
import { SITE_SETTINGS_QUERY } from '../queries'
import { ProjectsPage, ProjectsPageData } from './ProjectsPage'

const PAGE_QUERY = groq`{
  "projects": *[_type == "project" && defined(slug.current)],
  "siteSettings": ${SITE_SETTINGS_QUERY}
}`

export function ProjectsPreview() {
  const { data, loading } = useQuery<ProjectsPageData>(PAGE_QUERY)

  if (loading || !data) {
    return <div>Loading…</div>
  }

  return <ProjectsPage data={data} />
}
