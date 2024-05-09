'use client'

import {useQuery} from '@/sanity'
import {ProductPage, ProductPageData} from './ProductPage'

export function ProductPreview(props: {query: string; slug: string; initial: any}) {
  const {query, slug, initial} = props

  const {data, loading} = useQuery<ProductPageData>(query, {slug}, {initial})

  if (loading && !data) {
    return <div>Loading…</div>
  }

  return <ProductPage data={data as any} />
}
