import {Page, sectionFragment} from '@/components/page'
import {sanityFetch} from '@/sanity/live'
import {defineQuery} from 'next-sanity'

const pageQuery = defineQuery(`
  *[_type == "page" && slug.current == $slug][0]{
    _type,
    _id,
    title,
    ${sectionFragment},
    style
  }
`)

const pageSlugs = defineQuery(`*[_type == "page" && defined(slug.current)]{"slug": slug.current}`)
export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: pageSlugs,
    perspective: 'published',
    stega: false,
  })
  return data
}

export default async function PagesPage({params}: {params: Promise<{slug: string}>}) {
  const {data} = await sanityFetch({query: pageQuery, params})

  return <Page data={data} />
}
