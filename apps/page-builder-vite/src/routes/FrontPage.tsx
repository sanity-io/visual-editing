import {frontPageQuery, Page, type FrontPageQueryResult} from '@repo/page-builder-shared'

import {useQuery} from '@/sanity/loader'

export function FrontPage() {
  const {data, loading} = useQuery<FrontPageQueryResult>(frontPageQuery)

  return <Page data={data ?? null} loading={loading} />
}
