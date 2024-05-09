import {loadQuery} from '@/sanity'
import {SITE_SETTINGS_QUERY} from '../queries'
import type {ProductsPageData} from './ProductsPage'
import {ProductsPreview} from './ProductsPreview'

const PAGE_QUERY = `//groq
{
  "products": *[_type == "product" && defined(slug.current)]{
    _id,
    title,
    description,
    slug,
    "media": media[0]
  },
  "siteSettings": ${SITE_SETTINGS_QUERY}
}`

export default async function ProductsPage() {
  const initial = await loadQuery<ProductsPageData>(PAGE_QUERY, {})
  return <ProductsPreview query={PAGE_QUERY} initial={initial} />
}
