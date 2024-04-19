import {ProductPreview} from './ProductPreview'

export default function ProductPage(props: {params: {slug: string}}) {
  const {params} = props

  return <ProductPreview slug={params.slug} />
}
