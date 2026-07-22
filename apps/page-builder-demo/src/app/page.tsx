import {frontPageQuery, Page} from '@repo/page-builder-shared'

import {sanityFetch} from '@/sanity/live'

export default async function IndexPage() {
  const {data} = await sanityFetch({query: frontPageQuery})

  return <Page data={data} />
}
