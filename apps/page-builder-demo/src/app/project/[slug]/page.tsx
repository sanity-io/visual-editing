import {SITE_SETTINGS_QUERY} from '@/app/queries'
import {loadQuery} from '@/sanity'
import type {ProjectPageData} from './ProjectPage'
import {ProjectPreview} from './ProjectPreview'

const PAGE_QUERY = `//groq
{
  "project": *[_type == "project" && slug.current == $slug][0],
  "siteSettings": ${SITE_SETTINGS_QUERY}
}`

export default async function ProjectPage(props: {params: {slug: string}}) {
  const {params} = props
  const initial = await loadQuery<ProjectPageData>(PAGE_QUERY, {slug: params.slug})

  return <ProjectPreview query={PAGE_QUERY} slug={params.slug} initial={initial} />
}
