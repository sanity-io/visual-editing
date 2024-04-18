'use client'

import {useQuery} from '@/sanity'
import {IndexPage, IndexPageData} from './IndexPage'
import {INDEX_PAGE_QUERY, SITE_SETTINGS_QUERY} from './queries'

const PAGE_QUERY = `{
  "page": ${INDEX_PAGE_QUERY},
  "siteSettings": ${SITE_SETTINGS_QUERY}
}`

export function IndexPreview() {
  const {data, loading} = useQuery<IndexPageData>(PAGE_QUERY)

  if (loading || !data) {
    return <div>Loading…</div>
  }

  return <IndexPage data={data} />
}
