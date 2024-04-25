'use client'

import {useQuery} from '@/sanity'
import {ProductsPage, ProductsPageData} from './ProductsPage'

export function ProductsPreview(props: {query: string; initial: any}) {
  const {query, initial} = props
  const {data, loading} = useQuery<ProductsPageData>(query, {}, {initial})

  if (loading && !data) {
    return <div>Loading…</div>
  }

  return <ProductsPage data={data as any} />
}
