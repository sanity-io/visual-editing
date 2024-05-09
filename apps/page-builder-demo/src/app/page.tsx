import {loadQuery} from '@/sanity'
import type {IndexPageData} from './IndexPage'
import {IndexPreview} from './IndexPreview'
import {INDEX_PAGE_QUERY, SITE_SETTINGS_QUERY} from './queries'

const PAGE_QUERY = `//groq
{
  "page": ${INDEX_PAGE_QUERY},
  "siteSettings": ${SITE_SETTINGS_QUERY}
}`

export default async function IndexPage() {
  const initial = await loadQuery<IndexPageData>(PAGE_QUERY, {})
  return <IndexPreview query={PAGE_QUERY} initial={initial} />
}
