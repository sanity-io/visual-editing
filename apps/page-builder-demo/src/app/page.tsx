import { loadQuery } from '@/sanity'
import { IndexPreview } from './IndexPreview'
import { INDEX_PAGE_QUERY, SITE_SETTINGS_QUERY } from './queries'
import type { IndexPageData } from './IndexPage'

const PAGE_QUERY = `{
  "page": ${INDEX_PAGE_QUERY},
  "siteSettings": ${SITE_SETTINGS_QUERY}
}`

export default async function IndexPage() {
  const initial = await loadQuery<IndexPageData>(PAGE_QUERY)
  return <IndexPreview initial={initial} />
}
