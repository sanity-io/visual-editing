'use client'

import groq from 'groq'

import {SITE_SETTINGS_QUERY} from '@/app/queries'
import {useQuery} from '@/sanity'
import {ProductPage, ProductPageData} from './ProductPage'

const PAGE_QUERY = groq`{
  "product": *[_type == "product" && slug.current == $slug][0],
  "siteSettings": ${SITE_SETTINGS_QUERY}
}`

export function ProductPreview(props: {slug: string}) {
  const {slug} = props

  const {data, loading} = useQuery<ProductPageData>(PAGE_QUERY, {slug})

  if (loading || !data) {
    return <div>Loading…</div>
  }

  return <ProductPage data={data} />
}
