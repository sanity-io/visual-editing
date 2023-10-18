import { ProductPreview } from './ProductPreview'

export function getInitialProps() {
  return {
    props: {},
  }
}

export default function ProductPage(props: { params: { slug: string } }) {
  const { params } = props

  return <ProductPreview slug={params.slug} />
}
