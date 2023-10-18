'use client'

import groq from 'groq'

import { useQuery } from '@/sanity'
import { SITE_SETTINGS_QUERY } from '../queries'
import { ProductsPage, ProductsPageData } from './ProductsPage'

const PAGE_QUERY = groq`{
  "products": *[_type == "product" && defined(slug.current)]{
    _id,
    title,
    description,
    slug,
    "media": media[0]
  },
  "siteSettings": ${SITE_SETTINGS_QUERY}
}`

export function ProductsPreview() {
  const { data, loading } = useQuery<ProductsPageData>(PAGE_QUERY)

  if (loading || !data) {
    return <div>Loading…</div>
  }

  return <ProductsPage data={data} />
}
