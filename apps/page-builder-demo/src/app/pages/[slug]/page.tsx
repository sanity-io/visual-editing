import {Page, pageQuery, pageSlugsQuery} from '@repo/page-builder-shared'

import {sanityFetch} from '@/sanity/live'

export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: pageSlugsQuery,
    perspective: 'published',
    stega: false,
  })
  return data
}

export default async function PagesPage({params}: {params: Promise<{slug: string}>}) {
  const {data} = await sanityFetch({query: pageQuery, params})

  return <Page data={data} />
}
