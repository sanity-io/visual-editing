import {Page, type PageData} from '@/components/page'
import {sanityFetch} from '@/sanity/live'
import {defineQuery} from 'next-sanity'
import {notFound} from 'next/navigation'

const pageQuery = defineQuery(`
  *[_type == "page" && slug.current == $slug][0]{
    _type,
    _id,
    title,
    sections[]{
      ...,
      symbol->{_type},
      'headline': coalesce(headline, symbol->headline),
      'tagline': coalesce(tagline, symbol->tagline),
      'subline': coalesce(subline, symbol->subline),
      'image': coalesce(image, symbol->image),
      product->{
        _type,
        _id,
        title,
        slug,
        "media": media[0]
      },
      products[]{
        _key,
        ...(@->{
          _type,
          _id,
          title,
          slug,
          "media": media[0]
        })
      }
    },
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
  const {data} = await sanityFetch({query: pageQuery, params: await params})
  if (!data) {
    notFound()
  }

  // @TODO fix typegen vs manual types issues
  return <Page data={data as unknown as PageData} />
}
