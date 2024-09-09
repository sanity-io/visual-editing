import {Page, type PageData} from '@/components/page'
import {sanityFetch} from '@/sanity/live'
import {defineQuery} from 'next-sanity'
import {notFound} from 'next/navigation'

const frontPageQuery = defineQuery(`
  *[_id == "siteSettings"][0]{
    frontPage->{
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
  }.frontPage
`)

export default async function IndexPage() {
  const {data} = await sanityFetch({query: frontPageQuery})
  if (!data) {
    notFound()
  }

  // @TODO fix typegen vs manual types issues
  return <Page data={data as unknown as PageData} />
}
