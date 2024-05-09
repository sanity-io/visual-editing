import {loadQuery} from '@/sanity'
import type {ProjectsPageData} from './ProjectsPage'
import {SITE_SETTINGS_QUERY} from '../queries'
import {ProjectsPreview} from './ProjectsPreview'

const PAGE_QUERY = `//groq
{
  "projects": *[_type == "project" && defined(slug.current)],
  "siteSettings": ${SITE_SETTINGS_QUERY}
}`

export default async function ProjectsPage() {
  const initial = await loadQuery<ProjectsPageData>(PAGE_QUERY, {})
  return <ProjectsPreview query={PAGE_QUERY} initial={initial} />
}
