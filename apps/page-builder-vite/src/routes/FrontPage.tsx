import {Page} from '@/components/page/Page'
import type {FrontPageQueryResult} from '@/sanity.types'
import {useQuery} from '@/sanity/loader'
import {frontPageQuery} from '@/sanity/queries'

export function FrontPage() {
  const {data, loading} = useQuery<FrontPageQueryResult>(frontPageQuery)

  return <Page data={data ?? null} loading={loading} />
}
