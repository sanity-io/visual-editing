import {SITE_SETTINGS_QUERY} from '@/app/queries'
import {ProductPreview} from './ProductPreview'
import {loadQuery} from '@/sanity'
import type {ProductPageData} from './ProductPage'

const PAGE_QUERY = `//groq
{
  "product": *[_type == "product" && slug.current == $slug][0]{
    ...,
    model {
      ...,
      file {
        "asset": asset->{
          url,
          originalFilename,
          extension,
        }
      },
    }
  },
  "siteSettings": ${SITE_SETTINGS_QUERY}
}`

export default async function ProductPage(props: {params: {slug: string}}) {
  const {params} = props
  const initial = await loadQuery<ProductPageData>(PAGE_QUERY, {slug: params.slug})

  return <ProductPreview query={PAGE_QUERY} slug={params.slug} initial={initial} />
}
